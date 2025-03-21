import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStartOfDay } from '../utils/dateUtils';
import LRU from 'lru-cache';
import { firebaseMealService } from './firebaseMealService';
import { MealDocument } from '../types/meal';
import NetInfo from '@react-native-community/netinfo';
import { firestore, auth, Timestamp } from '../firebase/firebaseInstances';
import { analyticsService } from './analyticsService';
import { firebaseCore } from './firebase/firebaseCore';
import { FirebaseMealDocument } from './firebaseMealService';

const SIMPLE_FOOD_LOG_KEY = '@simple_food_log';
const UNDO_HISTORY_KEY = '@simple_food_log_undo_history';
const UNDO_CONFIG_KEY = '@simple_food_log_undo_config';
const DEFAULT_UNDO_TIMEOUT = 30000; // 30 seconds
const MAX_UNDO_HISTORY = 50;

// LRU Cache configuration
const cache = new LRU<string, SimpleFoodItem[]>({
  max: 100, // Maximum number of items to store in cache
  ttl: 5 * 60 * 1000 // Items expire after 5 minutes
});

interface UndoConfig {
  timeout: number;
  maxHistory: number;
}

export interface SimpleFoodItem {
  id: string;
  name: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  servingSize?: number;
  servingUnit?: string;
  timestamp: string;
}

export interface RemovedItem extends SimpleFoodItem {
  removedAt: string;
  expiresAt: string;
}

export interface BatchRemovedItems {
  items: RemovedItem[];
  batchId: string;
  removedAt: string;
  expiresAt: string;
}

interface UndoHistoryItem {
  id: string;
  type: 'single' | 'batch';
  data: RemovedItem | BatchRemovedItems;
  expiresAt: string;
}

interface PaginatedResponse<T> {
  items: T[];
  hasMore: boolean;
  total: number;
  [Symbol.iterator](): Iterator<T>;
}

class PaginatedResponseImpl<T> implements PaginatedResponse<T> {
  constructor(
    public items: T[],
    public hasMore: boolean,
    public total: number
  ) {}

  [Symbol.iterator](): Iterator<T> {
    return this.items[Symbol.iterator]();
  }
}

// Utility function to compress data before storing
const compressData = (data: any): string => {
  return JSON.stringify(data);
};

// Utility function to decompress stored data
const decompressData = <T>(data: string): T => {
  return JSON.parse(data);
};

let activeMealSubscription: (() => void) | null = null;

export const simpleFoodLogService = {
  async _waitForAuth(): Promise<void> {
    return new Promise((resolve) => {
      if (auth().currentUser) {
        resolve();
        return;
      }
      
      const unsubscribe = auth().onAuthStateChanged((user) => {
        if (user) {
          unsubscribe();
          resolve();
        }
      });

      // Add timeout to prevent hanging
      setTimeout(() => {
        unsubscribe();
        resolve();
      }, 10000); // 10 second timeout
    });
  },

  async getSimpleFoodLog(page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<SimpleFoodItem>> {
    try {
      // Get local items first
      const localItems = await this._getAllItems();

      // Only proceed with Firebase subscription if user is authenticated
      const user = auth().currentUser;
      if (!user) {
        console.log('[SimpleFoodLog] No authenticated user, returning local data only');
        const paginatedItems = localItems.slice((page - 1) * pageSize, page * pageSize);
        return new PaginatedResponseImpl(
          paginatedItems,
          page * pageSize < localItems.length,
          localItems.length
        );
      }

      // Clear any existing subscription
      if (activeMealSubscription) {
        activeMealSubscription();
        activeMealSubscription = null;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return new Promise<PaginatedResponse<SimpleFoodItem>>((resolve, reject) => {
        try {
          const handleMealUpdate = (meal: FirebaseMealDocument | null) => {
            if (!meal) {
              const paginatedItems = localItems.slice((page - 1) * pageSize, page * pageSize);
              resolve(new PaginatedResponseImpl(
                paginatedItems,
                page * pageSize < localItems.length,
                localItems.length
              ));
              return;
            }

            // Convert and save meal data
            this._convertAndSaveMeal(meal).then(() => {
              this._getAllItems().then(items => {
                const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);
                resolve(new PaginatedResponseImpl(
                  paginatedItems,
                  page * pageSize < items.length,
                  items.length
                ));
              });
            }).catch(reject);
          };

          // Set up new subscription only if authenticated
          firebaseMealService.subscribeToMealUpdates(today.toISOString(), handleMealUpdate)
            .then(unsubscribe => {
              if (unsubscribe) {
                activeMealSubscription = unsubscribe;
                console.log('[SimpleFoodLog] Set up new Firebase subscription');
              }
            })
            .catch(error => {
              console.warn('[SimpleFoodLog] Firebase subscription failed, using local data:', error);
              const paginatedItems = localItems.slice((page - 1) * pageSize, page * pageSize);
              resolve(new PaginatedResponseImpl(
                paginatedItems,
                page * pageSize < localItems.length,
                localItems.length
              ));
            });
        } catch (error) {
          console.error('[SimpleFoodLog] Error in subscription setup:', error);
          reject(error);
        }
      });
    } catch (error) {
      console.error('[SimpleFoodLog] Error in getSimpleFoodLog:', error);
      const localItems = await this._getAllItems();
      const paginatedItems = localItems.slice((page - 1) * pageSize, page * pageSize);
      return new PaginatedResponseImpl(
        paginatedItems,
        page * pageSize < localItems.length,
        localItems.length
      );
    }
  },

  async addFoodItem(item: Omit<SimpleFoodItem, 'id' | 'timestamp'>): Promise<SimpleFoodItem> {
    try {
      // Wait for auth to be initialized
      await this._waitForAuth();

      const currentItems = await this._getAllItems();
      
      const newItem: SimpleFoodItem = {
        ...item,
        id: `${Date.now()}-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
        timestamp: new Date().toISOString(),
      };

      // Save to Firebase if online
      const networkState = await NetInfo.fetch();
      if (networkState.isConnected && auth().currentUser) {
        try {
          await firebaseMealService.addMeal(newItem);
          console.log('[SimpleFoodLog] Successfully saved meal to Firebase:', newItem.id);
        } catch (error) {
          console.error('Error saving to Firebase:', error);
          // Continue with local save even if Firebase fails
        }
      }

      const updatedItems = [newItem, ...currentItems];
      await this._saveItems(updatedItems);
      
      cache.clear();
      
      return newItem;
    } catch (error) {
      console.error('Error adding food item:', error);
      throw error;
    }
  },

  async removeFoodItem(id: string): Promise<RemovedItem> {
    let itemToRemove: SimpleFoodItem | undefined;
    
    try {
      // Wait for auth to be initialized
      await this._waitForAuth();

      console.log('[SimpleFoodLog] Starting removal of food item:', id);

      const currentItems = await this._getAllItems();
      itemToRemove = currentItems.find(item => item.id === id);
      if (!itemToRemove) {
        throw new Error('Item not found');
      }

      // Delete from Firebase first if online
      const networkState = await NetInfo.fetch();
      if (networkState.isConnected && auth().currentUser) {
        try {
          await firebaseMealService.deleteMeal(id);
          console.log('[SimpleFoodLog] Successfully deleted meal from Firebase:', id);
          
          // Immediately update local state
          const updatedItems = currentItems.filter(item => item.id !== id);
          await this._saveItems(updatedItems);
          console.log('[SimpleFoodLog] Successfully updated local state after deletion');
        } catch (error) {
          console.error('[SimpleFoodLog] Error deleting from Firebase:', error);
          throw error;
        }
      } else {
        // If offline, update local state and queue for sync
        const updatedItems = currentItems.filter(item => item.id !== id);
        await this._saveItems(updatedItems);
        await this._markForSync(id, 'delete');
        console.log('[SimpleFoodLog] Queued deletion for sync:', id);
      }

      const now = new Date();
      const config = await this.getUndoConfig();
      const removedItem: RemovedItem = {
        ...itemToRemove,
        removedAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + config.timeout).toISOString(),
      };

      // Add to undo history
      await this._addToUndoHistory({
        id: removedItem.id,
        type: 'single',
        data: removedItem,
        expiresAt: removedItem.expiresAt,
      });

      // Clear all caches to ensure fresh data
      cache.clear();
      console.log('[SimpleFoodLog] Cleared cache after deletion');

      // Force a refresh of the Firebase subscription
      if (activeMealSubscription) {
        activeMealSubscription();
        activeMealSubscription = null;
        console.log('[SimpleFoodLog] Reset Firebase subscription after deletion');
      }

      return removedItem;
    } catch (error) {
      console.error('[SimpleFoodLog] Error removing food item:', error);
      throw error;
    }
  },

  async _markForSync(id: string, operation: 'create' | 'update' | 'delete'): Promise<void> {
    try {
      const syncKey = `@sync_pending_${operation}`;
      const pendingSync = await AsyncStorage.getItem(syncKey);
      const pendingIds = pendingSync ? JSON.parse(pendingSync) : [];
      
      if (!pendingIds.includes(id)) {
        pendingIds.push(id);
        await AsyncStorage.setItem(syncKey, JSON.stringify(pendingIds));
      }
    } catch (error) {
      console.error('[SimpleFoodLog] Error marking for sync:', error);
    }
  },

  // Private helper methods for optimized storage operations
  async _getAllItems(): Promise<SimpleFoodItem[]> {
    try {
      const data = await AsyncStorage.getItem(SIMPLE_FOOD_LOG_KEY);
      if (!data) return [];
      
      // Parse the stored data
      const parsedData = JSON.parse(data);
      return Array.isArray(parsedData) ? parsedData : [];
    } catch (error) {
      console.error('Error getting food items:', error);
      return [];
    }
  },

  async _saveItems(items: SimpleFoodItem[]): Promise<void> {
    const validItems = items.map(item => ({
      ...item,
      timestamp: typeof item.timestamp === 'string' 
        ? item.timestamp 
        : new Date().toISOString()
    }));
    await AsyncStorage.setItem(SIMPLE_FOOD_LOG_KEY, JSON.stringify(validItems));
  },

  async undoRemove(removedItem: RemovedItem): Promise<SimpleFoodItem> {
    try {
      const currentItems = await this.getSimpleFoodLog();
      
      const { removedAt, ...itemToRestore } = removedItem;
      
      const updatedItems = [itemToRestore, ...currentItems];
      await AsyncStorage.setItem(SIMPLE_FOOD_LOG_KEY, JSON.stringify(updatedItems));
      
      return itemToRestore;
    } catch (error) {
      console.error('Error undoing remove:', error);
      throw error;
    }
  },

  async clearFoodLog(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SIMPLE_FOOD_LOG_KEY);
    } catch (error) {
      console.error('Error clearing food log:', error);
      throw error;
    }
  },

  async removeBatchItems(ids: string[]): Promise<BatchRemovedItems> {
    try {
      const allItems = await this._getAllItems();
      const itemsToRemove = allItems.filter(item => ids.includes(item.id));
      
      if (itemsToRemove.length === 0) {
        throw new Error('No items found to remove');
      }

      const now = new Date();
      const config = await this.getUndoConfig();
      const expiresAt = new Date(now.getTime() + config.timeout).toISOString();

      const batchRemovedItems: BatchRemovedItems = {
        items: itemsToRemove.map(item => ({
          ...item,
          removedAt: now.toISOString(),
          expiresAt,
        })),
        batchId: `batch-${Date.now()}`,
        removedAt: now.toISOString(),
        expiresAt,
      };

      // Add to undo history
      await this._addToUndoHistory({
        id: batchRemovedItems.batchId,
        type: 'batch',
        data: batchRemovedItems,
        expiresAt,
      });

      const updatedItems = allItems.filter(item => !ids.includes(item.id));
      await this._saveItems(updatedItems);
      
      // Invalidate cache
      cache.clear();

      return batchRemovedItems;
    } catch (error) {
      console.error('Error removing batch items:', error);
      throw error;
    }
  },

  async undoBatchRemove(batchItems: BatchRemovedItems): Promise<SimpleFoodItem[]> {
    try {
      const currentItems = await this._getAllItems();
      const restoredItems = batchItems.items.map(({ removedAt, expiresAt, ...item }) => item);
      const updatedItems = [...restoredItems, ...currentItems];
      await this._saveItems(updatedItems);
      
      // Invalidate cache
      cache.clear();
      
      return restoredItems;
    } catch (error) {
      console.error('Error undoing batch remove:', error);
      throw error;
    }
  },

  async getUndoHistory(): Promise<UndoHistoryItem[]> {
    try {
      const data = await AsyncStorage.getItem(UNDO_HISTORY_KEY);
      if (!data) return [];

      const history: UndoHistoryItem[] = JSON.parse(data);
      const now = new Date().toISOString();

      // Filter out expired items
      const validHistory = history.filter(item => item.expiresAt > now);

      // Update storage if items were filtered out
      if (validHistory.length !== history.length) {
        await AsyncStorage.setItem(UNDO_HISTORY_KEY, JSON.stringify(validHistory));
      }

      return validHistory;
    } catch (error) {
      console.error('Error getting undo history:', error);
      return [];
    }
  },

  async _addToUndoHistory(item: UndoHistoryItem): Promise<void> {
    try {
      const history = await this.getUndoHistory();
      const config = await this.getUndoConfig();
      
      // Add new item and limit history size
      const updatedHistory = [item, ...history].slice(0, config.maxHistory);
      
      await AsyncStorage.setItem(UNDO_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error adding to undo history:', error);
      throw error;
    }
  },

  async clearExpiredUndoHistory(): Promise<void> {
    try {
      const history = await this.getUndoHistory();
      // getUndoHistory already filters out expired items
      await AsyncStorage.setItem(UNDO_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error clearing expired undo history:', error);
    }
  },

  async getUndoConfig(): Promise<UndoConfig> {
    try {
      const data = await AsyncStorage.getItem(UNDO_CONFIG_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return { timeout: DEFAULT_UNDO_TIMEOUT, maxHistory: MAX_UNDO_HISTORY };
    } catch (error) {
      console.error('Error getting undo config:', error);
      return { timeout: DEFAULT_UNDO_TIMEOUT, maxHistory: MAX_UNDO_HISTORY };
    }
  },

  async setUndoConfig(config: Partial<UndoConfig>): Promise<UndoConfig> {
    try {
      const currentConfig = await this.getUndoConfig();
      const newConfig = { ...currentConfig, ...config };
      await AsyncStorage.setItem(UNDO_CONFIG_KEY, JSON.stringify(newConfig));
      return newConfig;
    } catch (error) {
      console.error('Error setting undo config:', error);
      throw error;
    }
  },

  // New method to clean up old data
  async cleanupOldData(): Promise<void> {
    try {
      const currentItems = await this._getAllItems();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const filteredItems = currentItems.filter(item => 
        new Date(item.timestamp) > thirtyDaysAgo
      );

      if (filteredItems.length !== currentItems.length) {
        await this._saveItems(filteredItems);
        cache.clear();
      }
    } catch (error) {
      console.error('Error cleaning up old data:', error);
    }
  },

  async syncWithFirebase(): Promise<void> {
    try {
      // Wait for auth to be initialized
      await this._waitForAuth();

      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected || !auth().currentUser) {
        console.log('Cannot sync with Firebase: offline or not authenticated');
        return;
      }

      // Get all local items
      const localItems = await this._getAllItems();
      
      // Get all Firebase items
      const startDate = new Date(0);
      const endDate = new Date();
      const firebaseMeals = await firebaseMealService.getMealsInRange(startDate, endDate);

      // Create maps for easier comparison
      const localItemsMap = new Map(localItems.map(item => [item.id, item]));
      const firebaseItemsMap = new Map(firebaseMeals.map(meal => [meal.id, meal]));

      // Items to sync to Firebase (items in local but not in Firebase)
      const itemsToSync = localItems.filter(item => !firebaseItemsMap.has(item.id));
      if (itemsToSync.length > 0) {
        await firebaseMealService.syncLocalMealsToFirebase(itemsToSync);
        console.log('[SimpleFoodLog] Synced local items to Firebase:', itemsToSync.length);
      }

      // Items to sync from Firebase (items in Firebase but not in local)
      const itemsToAdd = firebaseMeals
        .filter(meal => !localItemsMap.has(meal.id))
        .map(meal => this._convertToSimpleFoodItem(meal));

      if (itemsToAdd.length > 0) {
        const updatedItems = [...itemsToAdd, ...localItems];
        await this._saveItems(updatedItems);
        console.log('[SimpleFoodLog] Synced Firebase items to local:', itemsToAdd.length);
      }

      cache.clear();
      console.log('[SimpleFoodLog] Successfully completed Firebase sync');
    } catch (error) {
      console.error('Error syncing with Firebase:', error);
      throw error;
    }
  },

  cleanup(): void {
    if (activeMealSubscription) {
      activeMealSubscription();
      activeMealSubscription = null;
    }
  },

  // Helper method to merge Firebase and local meal data
  _mergeMealData(firebaseItems: SimpleFoodItem[], localItems: SimpleFoodItem[]): SimpleFoodItem[] {
    const itemMap = new Map<string, SimpleFoodItem>();
    
    // Add all Firebase items to the map
    firebaseItems.forEach(item => {
      itemMap.set(item.id, item);
    });
    
    // Add local items that don't exist in Firebase
    localItems.forEach(item => {
      if (!itemMap.has(item.id)) {
        itemMap.set(item.id, item);
      }
    });
    
    // Convert map back to array and sort by timestamp
    return Array.from(itemMap.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  // Add helper method to get pending deletions
  async _getPendingDeletions(): Promise<string[]> {
    try {
      const pendingSync = await AsyncStorage.getItem('@sync_pending_delete');
      return pendingSync ? JSON.parse(pendingSync) : [];
    } catch (error) {
      console.error('[SimpleFoodLog] Error getting pending deletions:', error);
      return [];
    }
  },

  // Helper method for saving individual items
  async _saveItem(item: SimpleFoodItem): Promise<void> {
    const items = await this._getAllItems();
    const index = items.findIndex(i => i.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.push(item);
    }
    await this._saveItems(items);
  },

  // Convert Firebase meal to SimpleFoodItem
  _convertToSimpleFoodItem(meal: FirebaseMealDocument): SimpleFoodItem {
    return {
      id: meal.id,
      name: meal.name,
      calories: meal.calories,
      macros: {
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
      },
      servingSize: meal.servingSize,
      servingUnit: meal.servingUnit,
      timestamp: meal.timestamp instanceof Timestamp 
        ? meal.timestamp.toDate().toISOString()
        : typeof meal.timestamp === 'string'
          ? meal.timestamp
          : new Date().toISOString()
    };
  },

  // Helper method to convert and save meal data
  async _convertAndSaveMeal(meal: FirebaseMealDocument): Promise<void> {
    const simpleFoodItem = this._convertToSimpleFoodItem(meal);
    await this._saveItem(simpleFoodItem);
  }
}; 