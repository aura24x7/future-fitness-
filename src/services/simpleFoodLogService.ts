import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStartOfDay } from '../utils/dateUtils';
import LRU from 'lru-cache';

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
  protein: number;
  carbs: number;
  fat: number;
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
}

// Utility function to compress data before storing
const compressData = (data: any): string => {
  return JSON.stringify(data);
};

// Utility function to decompress stored data
const decompressData = <T>(data: string): T => {
  return JSON.parse(data);
};

export const simpleFoodLogService = {
  async getSimpleFoodLog(page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<SimpleFoodItem>> {
    try {
      const cacheKey = `${SIMPLE_FOOD_LOG_KEY}_${page}_${pageSize}`;
      const cachedData = cache.get(cacheKey);
      
      if (cachedData) {
        return {
          items: cachedData,
          hasMore: cachedData.length === pageSize,
          total: cachedData.length
        };
      }

      const data = await AsyncStorage.getItem(SIMPLE_FOOD_LOG_KEY);
      if (!data) {
        return { items: [], hasMore: false, total: 0 };
      }

      const allItems: SimpleFoodItem[] = decompressData(data);
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedItems = allItems.slice(start, end);

      // Cache the results
      cache.set(cacheKey, paginatedItems);

      return {
        items: paginatedItems,
        hasMore: end < allItems.length,
        total: allItems.length
      };
    } catch (error) {
      console.error('Error getting simple food log:', error);
      return { items: [], hasMore: false, total: 0 };
    }
  },

  async addFoodItem(item: Omit<SimpleFoodItem, 'id' | 'timestamp'>): Promise<SimpleFoodItem> {
    try {
      const currentItems = await this._getAllItems();
      
      const newItem: SimpleFoodItem = {
        ...item,
        id: `${Date.now()}-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
        timestamp: new Date().toISOString(),
      };

      const updatedItems = [newItem, ...currentItems];
      await this._saveItems(updatedItems);
      
      // Invalidate cache
      cache.clear();
      
      return newItem;
    } catch (error) {
      console.error('Error adding food item:', error);
      throw error;
    }
  },

  async removeFoodItem(id: string): Promise<RemovedItem> {
    try {
      const currentItems = await this._getAllItems();
      const itemToRemove = currentItems.find(item => item.id === id);
      if (!itemToRemove) {
        throw new Error('Item not found');
      }

      const now = new Date();
      const config = await this.getUndoConfig();
      const removedItem: RemovedItem = {
        ...itemToRemove,
        removedAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + config.timeout).toISOString(),
      };

      await this._addToUndoHistory({
        id: removedItem.id,
        type: 'single',
        data: removedItem,
        expiresAt: removedItem.expiresAt,
      });

      const updatedItems = currentItems.filter(item => item.id !== id);
      await this._saveItems(updatedItems);

      // Invalidate cache
      cache.clear();

      return removedItem;
    } catch (error) {
      console.error('Error removing food item:', error);
      throw error;
    }
  },

  // Private helper methods for optimized storage operations
  async _getAllItems(): Promise<SimpleFoodItem[]> {
    const data = await AsyncStorage.getItem(SIMPLE_FOOD_LOG_KEY);
    return data ? decompressData(data) : [];
  },

  async _saveItems(items: SimpleFoodItem[]): Promise<void> {
    const compressed = compressData(items);
    await AsyncStorage.setItem(SIMPLE_FOOD_LOG_KEY, compressed);
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
  }
}; 