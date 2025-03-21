import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { DailyMealSummary, WeeklyMealSummary } from '../types/meal';

const CACHE_KEYS = {
  DAILY_SUMMARY: (userId: string, date: string) => `@meal_summary:daily:${userId}:${date}`,
  WEEKLY_SUMMARY: (userId: string, weekId: string) => `@meal_summary:weekly:${userId}:${weekId}`,
  CACHE_TIMESTAMP: (key: string) => `${key}:timestamp`,
};

const CACHE_TTL = {
  DAILY: 24 * 60 * 60 * 1000, // 24 hours
  WEEKLY: 7 * 24 * 60 * 60 * 1000, // 7 days
};

class MealCacheService {
  private static instance: MealCacheService;

  private constructor() {}

  static getInstance(): MealCacheService {
    if (!MealCacheService.instance) {
      MealCacheService.instance = new MealCacheService();
    }
    return MealCacheService.instance;
  }

  async cacheDailySummary(userId: string, date: Date, summary: DailyMealSummary): Promise<void> {
    const dateStr = format(date, 'yyyy-MM-dd');
    const key = CACHE_KEYS.DAILY_SUMMARY(userId, dateStr);
    
    await Promise.all([
      AsyncStorage.setItem(key, JSON.stringify(summary)),
      AsyncStorage.setItem(
        CACHE_KEYS.CACHE_TIMESTAMP(key),
        Date.now().toString()
      ),
    ]);
  }

  async cacheWeeklySummary(userId: string, weekId: string, summary: WeeklyMealSummary): Promise<void> {
    const key = CACHE_KEYS.WEEKLY_SUMMARY(userId, weekId);
    
    await Promise.all([
      AsyncStorage.setItem(key, JSON.stringify(summary)),
      AsyncStorage.setItem(
        CACHE_KEYS.CACHE_TIMESTAMP(key),
        Date.now().toString()
      ),
    ]);
  }

  async getDailySummaryFromCache(userId: string, date: Date): Promise<DailyMealSummary | null> {
    const dateStr = format(date, 'yyyy-MM-dd');
    const key = CACHE_KEYS.DAILY_SUMMARY(userId, dateStr);
    
    try {
      const [cachedData, timestamp] = await Promise.all([
        AsyncStorage.getItem(key),
        AsyncStorage.getItem(CACHE_KEYS.CACHE_TIMESTAMP(key)),
      ]);

      if (!cachedData || !timestamp) return null;

      const cacheAge = Date.now() - parseInt(timestamp);
      if (cacheAge > CACHE_TTL.DAILY) {
        await this.clearCache(key);
        return null;
      }

      return JSON.parse(cachedData);
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }

  async getWeeklySummaryFromCache(userId: string, weekId: string): Promise<WeeklyMealSummary | null> {
    const key = CACHE_KEYS.WEEKLY_SUMMARY(userId, weekId);
    
    try {
      const [cachedData, timestamp] = await Promise.all([
        AsyncStorage.getItem(key),
        AsyncStorage.getItem(CACHE_KEYS.CACHE_TIMESTAMP(key)),
      ]);

      if (!cachedData || !timestamp) return null;

      const cacheAge = Date.now() - parseInt(timestamp);
      if (cacheAge > CACHE_TTL.WEEKLY) {
        await this.clearCache(key);
        return null;
      }

      return JSON.parse(cachedData);
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }

  private async clearCache(key: string): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(key),
        AsyncStorage.removeItem(CACHE_KEYS.CACHE_TIMESTAMP(key)),
      ]);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  async clearAllCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const mealSummaryKeys = keys.filter(key => 
        key.startsWith('@meal_summary:')
      );
      await AsyncStorage.multiRemove(mealSummaryKeys);
    } catch (error) {
      console.error('Error clearing all cache:', error);
    }
  }
}

export const mealCacheService = MealCacheService.getInstance(); 