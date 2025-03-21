import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { simpleFoodLogService, SimpleFoodItem, RemovedItem, BatchRemovedItems } from '../services/simpleFoodLogService';
import { useMeals } from './MealContext';
import { debounce } from 'lodash';
import EventEmitter from '../utils/EventEmitter';
import { getStorageKeyForDate } from '../utils/dateUtils';

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
  version: number;
}

interface SimpleFoodLogCache {
  items: Map<string, CacheItem<SimpleFoodItem[]>>;
  totalItems: number;
  version: number;
}

export const SimpleFoodLogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<SimpleFoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { updateTotalCalories, updateTotalMacros } = useMeals();
  const [undoConfig, setUndoConfig] = useState<UndoConfig>({ timeout: 30000, maxHistory: 50 });
  
  // Cache ref to persist between renders
  const cacheRef = useRef<SimpleFoodLogCache>({
    items: new Map(),
    totalItems: 0,
    version: 1
  });

  // Function to invalidate entire cache
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
    
    const isExpired = Date.now() - cached.timestamp >= CACHE_TTL;
    const isVersionMatch = cached.version === cacheRef.current.version;
    
    if (isExpired || !isVersionMatch) {
      console.log('[SimpleFoodLog] Cache invalid:', { 
        key, 
        isExpired, 
        isVersionMatch,
        cachedVersion: cached.version,
        currentVersion: cacheRef.current.version
      });
      return false;
    }
    
    return true;
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
      timestamp: Date.now(),
      version: cacheRef.current.version
    });
    console.log('[SimpleFoodLog] Cache updated:', { 
      key, 
      itemCount: data.length,
      version: cacheRef.current.version
    });
  }, []);

  // Calculate and update totals
  const updateMealTotals = useCallback((currentItems: SimpleFoodItem[]) => {
    // Calculate totals for the current day
    const totals = currentItems.reduce((acc, item) => ({
      calories: acc.calories + (item.calories || 0),
      protein: acc.protein + (item.protein || 0),
      carbs: acc.carbs + (item.carbs || 0),
      fat: acc.fat + (item.fat || 0),
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
          console.log('[SimpleFoodLog] Using cached data:', { 
            page, 
            itemCount: cachedData.length,
            version: cacheRef.current.version
          });
          setItems(prevItems => page === 1 ? cachedData : [...prevItems, ...cachedData]);
          setIsLoading(false);
          return;
        }
      }

      const response = await simpleFoodLogService.getSimpleFoodLog(page, PAGE_SIZE);
      foodItems = response.items;
      setHasMore(response.hasMore);
      
      // Only cache if not first page to ensure fresh data for latest meals
      if (page > 1) {
        setCacheData(cacheKey, foodItems);
      }

      setItems(prevItems => page === 1 ? foodItems : [...prevItems, ...foodItems]);
      debouncedUpdateMealTotals(foodItems);
    } catch (err) {
      setError('Failed to load food log');
      console.error('[SimpleFoodLog] Error loading food log:', err);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedUpdateMealTotals, getCachedData, setCacheData]);

  // Load next page
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setCurrentPage(prev => prev + 1);
      loadFoodLog(currentPage + 1);
    }
  }, [isLoading, hasMore, currentPage, loadFoodLog]);

  // Refresh food log
  const refreshFoodLog = useCallback(async () => {
    console.log('[SimpleFoodLog] Refreshing food log');
    invalidateCache();
    setCurrentPage(1);
    await loadFoodLog(1, true);
  }, [loadFoodLog, invalidateCache]);

  // Clear cache when unmounting
  useEffect(() => {
    return () => {
      cacheRef.current.items.clear();
    };
  }, []);

  // Initial load
  useEffect(() => {
    loadFoodLog();
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

  // Listen for meal updates
  useEffect(() => {
    const handleMealUpdate = async (updatedMeals: { [key: string]: SimpleFoodItem[] }) => {
      try {
        console.log('[SimpleFoodLog] Received meal update event');
        
        // Step 1: Invalidate cache to ensure fresh data
        invalidateCache();
        
        // Step 2: Force a refresh of the food log
        await refreshFoodLog();
        
        // Step 3: Update meal totals
        const currentItems = await simpleFoodLogService.getSimpleFoodLog(1, PAGE_SIZE);
        debouncedUpdateMealTotals(currentItems.items);
        
        console.log('[SimpleFoodLog] Successfully processed meal update event');
      } catch (error) {
        console.error('[SimpleFoodLog] Error handling meal update:', error);
        setError('Failed to update food log');
      }
    };

    // Set up event listener with cleanup
    console.log('[SimpleFoodLog] Setting up meal update event listener');
    const cleanup = EventEmitter.addListener('meals_updated', handleMealUpdate);
    
    return () => {
      console.log('[SimpleFoodLog] Cleaning up meal update event listener');
      cleanup();
    };
  }, [refreshFoodLog, invalidateCache, debouncedUpdateMealTotals]);

  // Add new effect for handling deletion events
  useEffect(() => {
    const handleMealDeleted = async (mealId: string) => {
      try {
        console.log('[SimpleFoodLog] Received meal deleted event:', mealId);
        
        // Step 1: Invalidate cache
        invalidateCache();
        
        // Step 2: Update local state
        setItems(prevItems => {
          const updatedItems = prevItems.filter(item => item.id !== mealId);
          
          // Step 3: Update meal totals
          debouncedUpdateMealTotals(updatedItems);
          
          return updatedItems;
        });
        
        console.log('[SimpleFoodLog] Successfully processed meal deleted event');
      } catch (error) {
        console.error('[SimpleFoodLog] Error handling meal deleted event:', error);
        setError('Failed to process meal deletion');
      }
    };

    // Set up event listener with cleanup
    console.log('[SimpleFoodLog] Setting up meal deleted event listener');
    const cleanup = EventEmitter.addListener('meal_deleted', handleMealDeleted);
    
    return () => {
      console.log('[SimpleFoodLog] Cleaning up meal deleted event listener');
      cleanup();
    };
  }, [invalidateCache, debouncedUpdateMealTotals]);

  const addFoodItem = async (item: Omit<SimpleFoodItem, 'id' | 'timestamp'>) => {
    try {
      setError(null);
      const newItem = await simpleFoodLogService.addFoodItem(item);
      console.log('SimpleFoodLog - Adding new food item:', newItem);
      const updatedItems = [newItem, ...items];
      setItems(updatedItems);
      debouncedUpdateMealTotals(updatedItems);
    } catch (err) {
      setError('Failed to add food item');
      console.error('Error adding food item:', err);
      throw err;
    }
  };

  const removeFoodItem = async (id: string) => {
    try {
      setError(null);
      setIsLoading(true);

      console.log('[SimpleFoodLog] Starting food item removal:', id);
      
      // Step 1: Remove from Firebase and get the removed item
      const removedItem = await simpleFoodLogService.removeFoodItem(id);
      
      console.log('[SimpleFoodLog] Successfully removed from Firebase:', id);
      
      // Step 2: Update local state
      setItems(prevItems => {
        const updatedItems = prevItems.filter(item => item.id !== id);
        
        // Step 3: Update meal totals immediately
        debouncedUpdateMealTotals(updatedItems);
        
        return updatedItems;
      });

      // Step 4: Clear cache to ensure fresh data
      invalidateCache();
      
      // Step 5: Emit both meal_deleted and meals_updated events
      EventEmitter.emit('meal_deleted', id);
      EventEmitter.emit('meals_updated', { [getStorageKeyForDate(new Date())]: [] });
      
      console.log('[SimpleFoodLog] Successfully completed food item removal:', id);
      
      return removedItem;
    } catch (err) {
      console.error('[SimpleFoodLog] Error removing food item:', err);
      setError('Failed to remove food item');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const undoRemove = async (removedItem: RemovedItem) => {
    try {
      setError(null);
      const restoredItem = await simpleFoodLogService.undoRemove(removedItem);
      const updatedItems = [restoredItem, ...items];
      setItems(updatedItems);
      debouncedUpdateMealTotals(updatedItems);
    } catch (err) {
      setError('Failed to undo remove');
      console.error('Error undoing remove:', err);
      throw err;
    }
  };

  const clearFoodLog = async () => {
    try {
      setError(null);
      await simpleFoodLogService.clearFoodLog();
      setItems([]);
      debouncedUpdateMealTotals([]);
    } catch (err) {
      setError('Failed to clear food log');
      console.error('Error clearing food log:', err);
      throw err;
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(prev => !prev);
    if (!isSelectionMode) {
      setSelectedItems(new Set());
    }
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
    setIsSelectionMode(false);
  };

  const removeBatchItems = async () => {
    if (selectedItems.size === 0) return;

    try {
      setError(null);
      const itemsToRemove = Array.from(selectedItems);
      const batchRemovedItems = await simpleFoodLogService.removeBatchItems(itemsToRemove);
      const updatedItems = items.filter(item => !selectedItems.has(item.id));
      setItems(updatedItems);
      debouncedUpdateMealTotals(updatedItems);
      clearSelection();
      return batchRemovedItems;
    } catch (err) {
      setError('Failed to remove selected items');
      console.error('Error removing batch items:', err);
      throw err;
    }
  };

  const undoBatchRemove = async (batchItems: BatchRemovedItems) => {
    try {
      setError(null);
      const restoredItems = await simpleFoodLogService.undoBatchRemove(batchItems);
      const updatedItems = [...restoredItems, ...items];
      setItems(updatedItems);
      debouncedUpdateMealTotals(updatedItems);
    } catch (err) {
      setError('Failed to undo batch remove');
      console.error('Error undoing batch remove:', err);
      throw err;
    }
  };

  const setUndoTimeout = async (timeout: number) => {
    try {
      await localStorage.setItem('undoTimeout', timeout.toString());
      setUndoConfig(prev => ({ ...prev, timeout }));
    } catch (err) {
      console.error('Error setting undo timeout:', err);
      throw err;
    }
  };

  const setUndoMaxHistory = async (maxHistory: number) => {
    try {
      await localStorage.setItem('undoMaxHistory', maxHistory.toString());
      setUndoConfig(prev => ({ ...prev, maxHistory }));
    } catch (err) {
      console.error('Error setting undo max history:', err);
      throw err;
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
  if (!context) {
    throw new Error('useSimpleFoodLog must be used within a SimpleFoodLogProvider');
  }
  return context;
}; 