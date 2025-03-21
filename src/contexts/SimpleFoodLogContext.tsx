import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { simpleFoodLogService, SimpleFoodItem, RemovedItem, BatchRemovedItems } from '../services/simpleFoodLogService';
import { useMeals, MealDetails } from './MealContext';
import { debounce } from 'lodash';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import from our synchronized Firebase initialization
import { firestore, auth, Timestamp } from '../firebase/firebaseInstances';
import { 
  QuerySnapshot,
  DocumentSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { User } from 'firebase/auth';

import { firebaseMealService } from '../services/firebaseMealService';
import { eventEmitter } from '../services/eventEmitter';
import { getWeekNumber } from '../utils/dateUtils';

// Helper function to format date key
const formatDateKey = (date: Date) => {
  return date.toISOString().split('T')[0];
};

interface UndoConfig {
  timeout: number;
  maxHistory: number;
}

interface SimpleFoodLogContextType {
  items: SimpleFoodItem[];
  isLoading: boolean;
  error: string | null;
  selectedItems: Set<string>;
  isSelectionMode: boolean;
  hasMore: boolean;
  loadMore: () => void;
  addFoodItem: (item: Omit<SimpleFoodItem, 'id' | 'timestamp'>) => Promise<void>;
  removeFoodItem: (id: string) => Promise<RemovedItem>;
  undoRemove: (removedItem: RemovedItem) => Promise<void>;
  clearFoodLog: () => Promise<void>;
  refreshFoodLog: () => Promise<void>;
  toggleSelectionMode: () => void;
  toggleItemSelection: (id: string) => void;
  clearSelection: () => void;
  removeBatchItems: () => Promise<BatchRemovedItems | void>;
  undoBatchRemove: (batchItems: BatchRemovedItems) => Promise<void>;
  undoConfig: UndoConfig;
  setUndoTimeout: (timeout: number) => Promise<void>;
  setUndoMaxHistory: (maxHistory: number) => Promise<void>;
}

const SimpleFoodLogContext = createContext<SimpleFoodLogContextType | undefined>(undefined);

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const PAGE_SIZE = 20;

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

interface SimpleFoodLogCache {
  items: Map<string, CacheItem<SimpleFoodItem[]>>;
  totalItems: number;
  version: number;
}

// Helper function to convert SimpleFoodItem to MealDetails
const convertToMealDetails = (item: SimpleFoodItem): MealDetails => {
  const mealDate = new Date(item.timestamp);
  return {
    id: item.id,
    name: item.name,
    calories: item.calories,
    protein: item.macros.protein,
    carbs: item.macros.carbs,
    fat: item.macros.fat,
    completed: false,
    mealType: 'breakfast',
    date: mealDate,
    dayOfWeek: mealDate.getDay(),
    weekNumber: getWeekNumber(mealDate),
    timeOfDay: mealDate.toLocaleTimeString(),
    ingredients: []
  };
};

export const SimpleFoodLogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<SimpleFoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { updateMeals, meals: contextMeals, updateTotalCalories, updateTotalMacros } = useMeals();
  const [undoConfig, setUndoConfig] = useState<UndoConfig>({ timeout: 30000, maxHistory: 50 });

  // Cache ref to persist between renders
  const cacheRef = useRef<SimpleFoodLogCache>({
    items: new Map(),
    totalItems: 0,
    version: 1
  });

  // Function to invalidate cache
  const invalidateCache = useCallback(() => {
    console.log('[SimpleFoodLog] Invalidating cache');
    cacheRef.current.items.clear();
    cacheRef.current.version += 1;
    console.log('[SimpleFoodLog] Cache invalidated, new version:', cacheRef.current.version);
  }, []);

  // Function to check if cache is valid
  const isCacheValid = useCallback((key: string): boolean => {
    const cached = cacheRef.current.items.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < CACHE_TTL;
  }, []);

  // Function to get cached data
  const getCachedData = useCallback((key: string): SimpleFoodItem[] | null => {
    if (!isCacheValid(key)) return null;
    return cacheRef.current.items.get(key)?.data || null;
  }, [isCacheValid]);

  // Function to set cache data
  const setCacheData = useCallback((key: string, data: SimpleFoodItem[]) => {
    cacheRef.current.items.set(key, {
      data,
      timestamp: Date.now()
    });
  }, []);

  // Calculate and update totals
  const updateMealTotals = useCallback((currentItems: SimpleFoodItem[]) => {
    // Calculate totals for the current day
    const totals = currentItems.reduce((acc, item) => ({
      calories: acc.calories + (item.calories || 0),
      protein: acc.protein + (item.macros?.protein || 0),
      carbs: acc.carbs + (item.macros?.carbs || 0),
      fat: acc.fat + (item.macros?.fat || 0),
    }), {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    });

    console.log('SimpleFoodLog - Calculated totals:', totals);

    // Update both calories and macros in a single batch
    updateTotalCalories(totals.calories);
    updateTotalMacros({
      protein: totals.protein,
      carbs: totals.carbs,
      fat: totals.fat,
    });
  }, [updateTotalCalories, updateTotalMacros]);

  // Add debouncing to prevent rapid consecutive updates
  const debouncedUpdateMealTotals = useCallback(
    debounce((items: SimpleFoodItem[]) => {
      updateMealTotals(items);
    }, 300),
    [updateMealTotals]
  );

  // Modified loadFoodLog to support pagination and caching
  const loadFoodLog = useCallback(async (page: number = 1, forceRefresh: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const cacheKey = `page_${page}`;
      let foodItems: SimpleFoodItem[] = [];

      if (!forceRefresh) {
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          const updatedItems = page === 1 ? cachedData : [...items, ...cachedData];
          setItems(updatedItems);
          debouncedUpdateMealTotals(updatedItems);
          setIsLoading(false);
          return;
        }
      }

      const response = await simpleFoodLogService.getSimpleFoodLog(page, PAGE_SIZE);
      foodItems = response.items;
      setHasMore(response.hasMore);
      setCacheData(cacheKey, foodItems);

      const updatedItems = page === 1 ? foodItems : [...items, ...foodItems];
      setItems(updatedItems);
      debouncedUpdateMealTotals(updatedItems);
    } catch (err) {
      setError('Failed to load food log');
      console.error('Error loading food log:', err);
    } finally {
      setIsLoading(false);
    }
  }, [items, debouncedUpdateMealTotals, getCachedData, setCacheData]);

  // Load next page
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setCurrentPage(prev => prev + 1);
      loadFoodLog(currentPage + 1);
    }
  }, [isLoading, hasMore, currentPage, loadFoodLog]);

  // Refresh food log
  const refreshFoodLog = useCallback(async () => {
    setCurrentPage(1);
    await loadFoodLog(1, true);
  }, [loadFoodLog]);

  // Clear cache when unmounting
  useEffect(() => {
    return () => {
      cacheRef.current.items.clear();
    };
  }, []);

  // Initial load
  useEffect(() => {
    const initializeAndLoad = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Wait for initialization - no need to initialize firebaseCore anymore
        // Instead we directly use auth() which is already initialized
        
        // Set up Firebase auth state listener
        const unsubscribe = auth().onAuthStateChanged(async (user) => {
          if (user) {
            try {
              // Get user's food log data
              await loadFoodLog();
            } catch (err) {
              console.error('[SimpleFoodLog] Error loading food log after auth change:', err);
            }
          }
        });
        
        // Clean up listener on unmount
        return () => unsubscribe();
      } catch (err) {
        console.error('[SimpleFoodLog] Initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize food log');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAndLoad();
  }, [loadFoodLog]);

  // Load undo config on mount
  useEffect(() => {
    const loadUndoConfig = async () => {
      try {
        const config = await simpleFoodLogService.getUndoConfig();
        setUndoConfig(config);
      } catch (error) {
        console.error('Error loading undo config:', error);
      }
    };
    loadUndoConfig();
  }, []);

  // Add Firestore listener for real-time updates
  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged(async (user) => {
      if (!user) {
        setItems([]);
        setError(null);
        return;
      }

      try {
        // Get Firestore using namespace API consistently
        const db = firestore();
        const mealsRef = db.collection('users').doc(user.uid).collection('meals');
        const userMealsQuery = mealsRef.where('deleted', '==', false);

        const unsubscribeSnapshot = mealsRef.onSnapshot((snapshot) => {
          const firestoreMeals = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as SimpleFoodItem[];
          
          setItems(firestoreMeals);
          updateMealTotals(firestoreMeals);
          setCacheData(formatDateKey(new Date()), firestoreMeals);
        }, (error) => {
          console.error('Firestore snapshot error:', error);
          setError('Failed to sync with database');
        });

        return () => {
          unsubscribeSnapshot();
        };
      } catch (error) {
        console.error('Error setting up Firestore listener:', error);
        setError('Failed to connect to database');
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Listen for meal updates
  useEffect(() => {
    const handleMealUpdate = async (updatedMeals: { [key: string]: SimpleFoodItem[] }) => {
      try {
        console.log('[SimpleFoodLog] Received meal update event');
        
        // Step 1: Invalidate cache to ensure fresh data
        invalidateCache();
        
        // Step 2: Force a refresh of the food log
        await refreshFoodLog();
        
        // Step 3: Update meal totals with converted data
        const currentItems = await simpleFoodLogService.getSimpleFoodLog(1, PAGE_SIZE);
        
        // Convert items and group by date
        const mealsByDate: { [key: string]: MealDetails[] } = {};
        const dateKey = formatDateKey(new Date());
        
        // Convert SimpleFoodItems to MealDetails
        const convertedMeals = currentItems.items.map(item => {
          const mealDate = new Date(item.timestamp);
          const mealDetails = {
            id: item.id,
            name: item.name,
            calories: item.calories,
            protein: item.macros.protein,
            carbs: item.macros.carbs,
            fat: item.macros.fat,
            completed: false,
            mealType: 'breakfast',
            date: mealDate,
            dayOfWeek: mealDate.getDay(),
            weekNumber: getWeekNumber(mealDate),
            timeOfDay: mealDate.toLocaleTimeString(),
            ingredients: []
          };
          return mealDetails;
        }) as MealDetails[];
        
        // Assign converted meals to the date key
        mealsByDate[dateKey] = convertedMeals;
        
        // Convert updatedMeals to MealDetails format
        const convertedUpdatedMeals = Object.entries(updatedMeals).reduce((acc, [key, items]) => {
          acc[key] = items.map(item => {
            const mealDate = new Date(item.timestamp);
            return {
              id: item.id,
              name: item.name,
              calories: item.calories,
              protein: item.macros.protein,
              carbs: item.macros.carbs,
              fat: item.macros.fat,
              completed: false,
              mealType: 'breakfast',
              date: mealDate,
              dayOfWeek: mealDate.getDay(),
              weekNumber: getWeekNumber(mealDate),
              timeOfDay: mealDate.toLocaleTimeString(),
              ingredients: []
            };
          }) as MealDetails[];
          return acc;
        }, {} as { [key: string]: MealDetails[] });
        
        // Update meals with properly typed data
        updateMeals(convertedUpdatedMeals);
        
        console.log('[SimpleFoodLog] Successfully processed meal update event');
      } catch (error) {
        console.error('[SimpleFoodLog] Error handling meal update:', error);
        setError('Failed to update food log');
      }
    };

    // Set up event listener with cleanup
    console.log('[SimpleFoodLog] Setting up meal update event listener');
    eventEmitter.on('meals_updated', handleMealUpdate);
    
    return () => {
      console.log('[SimpleFoodLog] Cleaning up meal update event listener');
      eventEmitter.off('meals_updated', handleMealUpdate);
    };
  }, [refreshFoodLog, invalidateCache, updateMeals]);

  const addFoodItem = async (item: Omit<SimpleFoodItem, 'id' | 'timestamp'>) => {
    try {
      setError(null);
      const newItem = await simpleFoodLogService.addFoodItem(item);
      console.log('SimpleFoodLog - Adding new food item:', newItem);
      
      // Clear cache before updating state
      cacheRef.current.items.clear();
      
      // Force a refresh of the food log
      const response = await simpleFoodLogService.getSimpleFoodLog(1, PAGE_SIZE);
      const updatedItems = response.items;
      
      // Update state
      setItems(updatedItems);
      
      // Update totals with debounce
      debouncedUpdateMealTotals(updatedItems);
      
      // Reset to first page
      setCurrentPage(1);
      setHasMore(response.hasMore);
    } catch (err) {
      setError('Failed to add food item');
      console.error('Error adding food item:', err);
      throw err;
    }
  };

  // Updated removeFoodItem function
  const removeFoodItem = useCallback(async (id: string): Promise<RemovedItem> => {
    try {
      const user = auth().currentUser;
      if (!user) throw new Error('User must be authenticated');
      
      const itemToRemove = items.find(item => item.id === id);
      if (!itemToRemove) throw new Error('Item not found');
      
      await firebaseMealService.deleteMeal(id);
      
      setItems(prevItems => {
        const newItems = prevItems.filter(item => item.id !== id);
        updateMealTotals(newItems);
        
        // Convert items to MealDetails format
        const currentItems = newItems
          .filter(item => formatDateKey(new Date(item.timestamp || Date.now())) === formatDateKey(new Date()))
          .map(item => {
            const mealDate = new Date(item.timestamp || Date.now());
            return {
              id: item.id,
              name: item.name,
              calories: item.calories,
              protein: item.macros.protein,
              carbs: item.macros.carbs,
              fat: item.macros.fat,
              completed: true,
              mealType: 'breakfast',
              date: mealDate,
              dayOfWeek: mealDate.getDay(),
              weekNumber: getWeekNumber(mealDate),
              timeOfDay: mealDate.toLocaleTimeString(),
              ingredients: []
            } as MealDetails;
          });
        
        // Update meals with properly typed data
        updateMeals({ [formatDateKey(new Date())]: currentItems });
        return newItems;
      });
      
      const now = new Date();
      const removedItemObj: RemovedItem = {
        ...itemToRemove,
        removedAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + undoConfig.timeout).toISOString()
      };
      return removedItemObj;
    } catch (error) {
      console.error('Error removing food item:', error);
      throw error;
    }
  }, [items, updateMeals, updateMealTotals, undoConfig]);

  const undoRemove = async (removedItem: RemovedItem) => {
    try {
      setError(null);
      
      // Clear cache to ensure fresh data
      cacheRef.current.items.clear();
      
      // Restore the item
      const restoredItem = await simpleFoodLogService.undoRemove(removedItem);
      
      // Force refresh to get latest state
      const response = await simpleFoodLogService.getSimpleFoodLog(1, PAGE_SIZE);
      const updatedItems = response.items;
      
      // Update state
      setItems(updatedItems);
      
      // Update totals with debounce
      debouncedUpdateMealTotals(updatedItems);
      
      // Reset pagination
      setCurrentPage(1);
      setHasMore(response.hasMore);
    } catch (err) {
      setError('Failed to undo remove');
      console.error('Error undoing remove:', err);
      throw err;
    }
  };

  const clearFoodLog = async () => {
    try {
      setError(null);
      
      // Clear the food log in service
      await simpleFoodLogService.clearFoodLog();
      
      // Clear cache
      cacheRef.current.items.clear();
      
      // Update state
      setItems([]);
      
      // Update totals with debounce
      debouncedUpdateMealTotals([]);
      
      // Reset pagination
      setCurrentPage(1);
      setHasMore(false);
    } catch (err) {
      setError('Failed to clear food log');
      console.error('Error clearing food log:', err);
      throw err;
    }
  };

  // Modify removeBatchItems to handle Firestore batch deletion
  const removeBatchItems = useCallback(async (): Promise<BatchRemovedItems | void> => {
    if (selectedItems.size === 0) return;

    try {
      const user = auth().currentUser;
      if (!user) throw new Error('User must be authenticated');

      const now = new Date();
      const expiresAt = new Date(now.getTime() + undoConfig.timeout).toISOString();
      
      const itemsToRemove = items.filter(item => selectedItems.has(item.id));
      const removedItems: BatchRemovedItems = {
        items: itemsToRemove.map(item => ({
          ...item,
          removedAt: now.toISOString(),
          expiresAt
        })),
        batchId: `batch-${Date.now()}`,
        removedAt: now.toISOString(),
        expiresAt
      };

      // Delete all selected items using firebaseMealService
      await Promise.all(
        Array.from(selectedItems).map(id => firebaseMealService.deleteMeal(id))
      );

      setSelectedItems(new Set());
      setIsSelectionMode(false);

      return removedItems;
    } catch (error) {
      console.error('Error removing batch items:', error);
      throw error;
    }
  }, [items, selectedItems, undoConfig]);

  const undoBatchRemove = async (batchItems: BatchRemovedItems): Promise<void> => {
    try {
      setError(null);
      // Get the restored items as SimpleFoodItem[] from the service
      // The service handles converting RemovedItem[] to SimpleFoodItem[] internally
      const restoredItems = await simpleFoodLogService.undoBatchRemove(batchItems);
      
      // Clear cache to ensure fresh data
      cacheRef.current.items.clear();
      
      // Merge with existing items and update state
      const updatedItems = [...restoredItems, ...items];
      setItems(updatedItems);
      debouncedUpdateMealTotals(updatedItems);
    } catch (err) {
      console.error('Error undoing batch remove:', err);
      setError('Failed to undo remove');
    }
  };

  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode(prev => !prev);
    setSelectedItems(new Set());
  }, []);

  const toggleItemSelection = useCallback((id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const setUndoTimeout = async (timeout: number) => {
    try {
      const newConfig = await simpleFoodLogService.setUndoConfig({ timeout });
      setUndoConfig(newConfig);
    } catch (error) {
      console.error('Error setting undo timeout:', error);
      throw error;
    }
  };

  const setUndoMaxHistory = async (maxHistory: number) => {
    try {
      const newConfig = await simpleFoodLogService.setUndoConfig({ maxHistory });
      setUndoConfig(newConfig);
    } catch (error) {
      console.error('Error setting undo max history:', error);
      throw error;
    }
  };

  const value = {
    items,
    isLoading,
    error,
    selectedItems,
    isSelectionMode,
    hasMore,
    loadMore,
    addFoodItem,
    removeFoodItem,
    undoRemove,
    clearFoodLog,
    refreshFoodLog,
    toggleSelectionMode,
    toggleItemSelection,
    clearSelection,
    removeBatchItems,
    undoBatchRemove,
    undoConfig,
    setUndoTimeout,
    setUndoMaxHistory,
  };

  return (
    <SimpleFoodLogContext.Provider value={value}>
      {children}
    </SimpleFoodLogContext.Provider>
  );
};

export const useSimpleFoodLog = () => {
  const context = useContext(SimpleFoodLogContext);
  if (context === undefined) {
    throw new Error('useSimpleFoodLog must be used within a SimpleFoodLogProvider');
  }
  return context;
};