import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from '@react-native-firebase/firestore';
import { WeightLog } from '../types/weight';
import { ActivityLog } from '../types/activity';
import { MealLog } from '../types/meal';
import { SyncOptions } from '../types/sync';
import { MealStorageService } from './mealStorageService';
import SyncService from './syncService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Timestamp } from '@react-native-firebase/firestore';

interface CorrelationResult {
  correlation: number;
  significance: number;
  dataPoints: number;
}

interface MacroImpact {
  protein: CorrelationResult;
  carbs: CorrelationResult;
  fat: CorrelationResult;
}

interface AnalyticsInsight {
  type: 'correlation' | 'pattern' | 'recommendation';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
  timestamp: Date;
}

export enum MealAnalyticsEvents {
  SYNC_OPERATION = 'meal_sync_operation',
  SYNC_CONFLICT = 'meal_sync_conflict',
  SYNC_ERROR = 'meal_sync_error',
  STORAGE_USAGE = 'meal_storage_usage',
  CACHE_HIT = 'meal_cache_hit',
  CACHE_MISS = 'meal_cache_miss',
  QUERY_PERFORMANCE = 'meal_query_performance',
}

interface StorageUsageData {
  totalDocuments: number;
  totalSize: number;
  collectionName: string;
  syncOptions?: SyncOptions;
}

interface UserProfile {
  dailyCalorieGoal: number;
  dailyWaterGoal: number;
  tdee: number;
}

interface DailyTotals {
  calories: number;
  caloriesBurned: number;
  waterIntake: number;
  dailyCalorieGoal: number;
  dailyWaterGoal: number;
  mealCount: number;
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private mealStorageService: MealStorageService;
  private syncService: SyncService;

  private constructor() {
    this.mealStorageService = MealStorageService.getInstance();
    this.syncService = SyncService.getInstance();
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  async refreshData(): Promise<void> {
    try {
      console.log('[Analytics] Starting data refresh');
      
      // Clear analytics cache first to prevent stale data
      await this.clearCache();
      
      // Force a full sync of meal data
      await this.mealStorageService.loadUserMeals();
      
      // Get fresh data from Firestore
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      // Fetch and recalculate all relevant data
      const [weightLogs, mealLogs] = await Promise.all([
        this.getWeightLogs(thirtyDaysAgo, now),
        this.getMealLogs(thirtyDaysAgo, now)
      ]);

      // Calculate and cache daily totals
      const dailyTotals = await this.calculateDailyTotals(mealLogs);
      await this.cacheDailyTotals(dailyTotals);

      // Calculate correlations and insights
      if (weightLogs.length > 0 && mealLogs.length > 0) {
        const [weightCalorieCorrelation, macroImpact] = await Promise.all([
          this.analyzeWeightCalorieCorrelation(),
          this.analyzeMacroImpact()
        ]);

        // Cache the results
        const userId = auth().currentUser?.uid;
        if (userId) {
          const analyticsData = {
            weightCalorieCorrelation,
            macroImpact,
            lastUpdated: new Date().toISOString()
          };
          await AsyncStorage.setItem(
            `@analytics_results_${userId}`,
            JSON.stringify(analyticsData)
          );
        }
      }
      
      console.log('[Analytics] Data refresh completed');
    } catch (error) {
      console.error('[Analytics] Error refreshing data:', error);
      throw error;
    }
  }

  private async clearCache(): Promise<void> {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');
      
      const cacheKeys = [
        `@analytics_daily_${userId}`,
        `@analytics_weekly_${userId}`,
        `@analytics_monthly_${userId}`
      ];
      
      await Promise.all(cacheKeys.map(key => AsyncStorage.removeItem(key)));
    } catch (error) {
      console.error('[Analytics] Error clearing cache:', error);
    }
  }

  private async calculateDailyTotals(mealLogs: MealLog[]): Promise<Record<string, any>> {
    const dailyTotals: Record<string, any> = {};
    
    for (const meal of mealLogs) {
      const date = meal.timestamp instanceof Timestamp 
        ? meal.timestamp.toDate().toISOString().split('T')[0]
        : new Date(meal.timestamp).toISOString().split('T')[0];
      
      if (!dailyTotals[date]) {
        dailyTotals[date] = {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          mealCount: 0
        };
      }
      
      dailyTotals[date].calories += meal.calories || 0;
      dailyTotals[date].protein += meal.macros?.proteins || 0;
      dailyTotals[date].carbs += meal.macros?.carbs || 0;
      dailyTotals[date].fat += meal.macros?.fats || 0;
      dailyTotals[date].mealCount += 1;
    }
    
    return dailyTotals;
  }

  private async cacheDailyTotals(dailyTotals: Record<string, any>): Promise<void> {
    const userId = auth().currentUser?.uid;
    if (!userId) return;
    
    try {
      await AsyncStorage.setItem(
        `@analytics_daily_${userId}`,
        JSON.stringify({
          totals: dailyTotals,
          lastUpdated: new Date().toISOString()
        })
      );
    } catch (error) {
      console.error('[Analytics] Error caching daily totals:', error);
    }
  }

  async analyzeWeightCalorieCorrelation(days: number = 30): Promise<CorrelationResult> {
    try {
      const user = auth().currentUser;
      if (!user) throw new Error('User not authenticated');

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get weight logs
      const weightLogs = await this.getWeightLogs(startDate, endDate);
      const mealLogs = await this.getMealLogs(startDate, endDate);

      if (weightLogs.length < 2 || mealLogs.length < 2) {
        return {
          correlation: 0,
          significance: 0,
          dataPoints: 0,
        };
      }

      // Calculate correlation
      const correlation = this.calculateCorrelation(
        weightLogs.map(log => log.weight),
        mealLogs.map(log => log.calories)
      );

      return {
        correlation,
        significance: this.getSignificanceLevel(correlation),
        dataPoints: weightLogs.length,
      };
    } catch (error) {
      console.error('Error analyzing weight-calorie correlation:', error);
      throw new Error('Failed to analyze weight-calorie correlation');
    }
  }

  async analyzeMacroImpact(days: number = 30): Promise<MacroImpact> {
    try {
      const user = auth().currentUser;
      if (!user) throw new Error('User not authenticated');

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const weightLogs = await this.getWeightLogs(startDate, endDate);
      const mealLogs = await this.getMealLogs(startDate, endDate);

      if (weightLogs.length < 2 || mealLogs.length < 2) {
        return {
          protein: this.getDefaultCorrelation('protein'),
          carbs: this.getDefaultCorrelation('carbs'),
          fat: this.getDefaultCorrelation('fat'),
        };
      }

      const weightChanges = weightLogs.map(log => log.weight);
      const proteinIntake = mealLogs.map(log => log.macros.proteins);
      const carbsIntake = mealLogs.map(log => log.macros.carbs);
      const fatIntake = mealLogs.map(log => log.macros.fats);

      return {
        protein: {
          correlation: this.calculateCorrelation(weightChanges, proteinIntake),
          significance: this.getSignificanceLevel(this.calculateCorrelation(weightChanges, proteinIntake)),
          dataPoints: weightChanges.length,
        },
        carbs: {
          correlation: this.calculateCorrelation(weightChanges, carbsIntake),
          significance: this.getSignificanceLevel(this.calculateCorrelation(weightChanges, carbsIntake)),
          dataPoints: weightChanges.length,
        },
        fat: {
          correlation: this.calculateCorrelation(weightChanges, fatIntake),
          significance: this.getSignificanceLevel(this.calculateCorrelation(weightChanges, fatIntake)),
          dataPoints: weightChanges.length,
        },
      };
    } catch (error) {
      console.error('Error analyzing macro impact:', error);
      throw new Error('Failed to analyze macro impact');
    }
  }

  async generateSmartGoalRecommendations(): Promise<AnalyticsInsight[]> {
    try {
      const user = auth().currentUser;
      if (!user) throw new Error('User not authenticated');

      const insights: AnalyticsInsight[] = [];
      const macroImpact = await this.analyzeMacroImpact();
      const weightCalorieCorrelation = await this.analyzeWeightCalorieCorrelation();

      // Generate insights based on correlations
      if (weightCalorieCorrelation.correlation !== 0) {
        insights.push({
          type: 'correlation',
          title: 'Calorie Impact on Weight',
          description: this.getCorrelationDescription('weight', 'calorie intake', weightCalorieCorrelation.correlation),
          impact: weightCalorieCorrelation.correlation > 0 ? 'positive' : 'negative',
          confidence: Math.abs(weightCalorieCorrelation.correlation),
          timestamp: new Date(),
        });
      }

      // Add macro-specific insights
      Object.entries(macroImpact).forEach(([macro, result]) => {
        if (result.correlation !== 0) {
          insights.push({
            type: 'correlation',
            title: `${macro.charAt(0).toUpperCase() + macro.slice(1)} Impact Analysis`,
            description: this.getCorrelationDescription('weight', `${macro} intake`, result.correlation),
            impact: result.correlation > 0 ? 'positive' : 'negative',
            confidence: Math.abs(result.correlation),
            timestamp: new Date(),
          });
        }
      });

      return insights;
    } catch (error) {
      console.error('Error generating smart goal recommendations:', error);
      throw new Error('Failed to generate goal recommendations');
    }
  }

  private async getWeightLogs(startDate: Date, endDate: Date): Promise<WeightLog[]> {
    const user = auth().currentUser;
    if (!user) throw new Error('User not authenticated');

    const weightLogsRef = collection(firestore(), 'weight_logs');
    const q = query(
      weightLogsRef,
      where('userId', '==', user.uid),
      where('timestamp', '>=', startDate),
      where('timestamp', '<=', endDate),
      orderBy('timestamp', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as WeightLog[];
  }

  private async getMealLogs(startDate: Date, endDate: Date): Promise<MealLog[]> {
    const user = auth().currentUser;
    if (!user) throw new Error('User not authenticated');

    const mealLogsRef = collection(firestore(), 'meal_logs');
    const q = query(
      mealLogsRef,
      where('userId', '==', user.uid),
      where('timestamp', '>=', startDate),
      where('timestamp', '<=', endDate),
      orderBy('timestamp', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as MealLog[];
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private getSignificanceLevel(correlation: number): number {
    const absCorrelation = Math.abs(correlation);
    if (absCorrelation >= 0.7) return 1;
    if (absCorrelation >= 0.4) return 0.5;
    return 0;
  }

  private getCorrelationDescription(variable1: string, variable2: string, correlation: number): string {
    const strength = Math.abs(correlation);
    const direction = correlation > 0 ? 'positive' : 'negative';
    let description = `There is a ${this.getSignificanceLevel(correlation)} ${direction} correlation between ${variable1} and ${variable2}. `;

    if (strength >= 0.7) {
      description += `This suggests a strong relationship between the two variables.`;
    } else if (strength >= 0.4) {
      description += `This suggests a moderate relationship between the two variables.`;
    } else {
      description += `This suggests a weak relationship between the two variables.`;
    }

    return description;
  }

  private getDefaultCorrelation(macro: string): CorrelationResult {
    return {
      correlation: 0,
      significance: 0,
      dataPoints: 0,
    };
  }

  async logSyncOperation(params: {
    operation: 'create' | 'update' | 'delete';
    success: boolean;
    duration: number;
  }): Promise<void> {
    // Implementation of logSyncOperation
  }

  async logSyncConflict(params: {
    resolution: 'local_win' | 'remote_win';
    documentType: string;
  }): Promise<void> {
    // Implementation of logSyncConflict
  }

  async logSyncError(params: {
    operation: string;
    errorCode: string;
    errorMessage: string;
  }): Promise<void> {
    // Implementation of logSyncError
  }

  async logStorageUsage(params: StorageUsageData): Promise<void> {
    // Implementation of logStorageUsage
  }

  async logCacheHit(params: {
    cacheType: 'daily' | 'weekly';
    age: number;
  }): Promise<void> {
    // Implementation of logCacheHit
  }

  async logCacheMiss(params: {
    cacheType: 'daily' | 'weekly';
    reason: 'not_found' | 'expired' | 'error';
  }): Promise<void> {
    // Implementation of logCacheMiss
  }

  async logQueryPerformance(params: {
    queryType: string;
    duration: number;
    resultCount: number;
    filters?: Record<string, any>;
  }): Promise<void> {
    // Implementation of logQueryPerformance
  }

  private async getUserProfile(): Promise<UserProfile | null> {
    try {
      const user = auth().currentUser;
      if (!user) return null;

      const userRef = doc(firestore(), 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) return null;

      const data = userDoc.data();
      return {
        dailyCalorieGoal: data.dailyCalorieGoal || 2000,
        dailyWaterGoal: data.dailyWaterGoal || 2000,
        tdee: data.tdee || 2000
      };
    } catch (error) {
      console.error('[Analytics] Error getting user profile:', error);
      return null;
    }
  }

  async getDailyTotals(date: Date): Promise<DailyTotals | null> {
    try {
      const user = auth().currentUser;
      if (!user) {
        console.warn('[Analytics] No authenticated user');
        return null;
      }

      // Get user's profile for goals
      const userProfile = await this.getUserProfile();
      
      // Get meals for the day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const [meals, activities] = await Promise.all([
        this.getMealLogs(startOfDay, endOfDay),
        this.getActivityLogs(startOfDay, endOfDay)
      ]);

      // Calculate totals
      const dailyTotals: DailyTotals = {
        calories: meals.reduce((sum, meal) => sum + meal.calories, 0),
        caloriesBurned: activities.reduce((sum, activity) => sum + activity.caloriesBurned, 0),
        waterIntake: meals.reduce((sum, meal) => sum + (meal.hydration?.water || 0), 0),
        dailyCalorieGoal: userProfile?.dailyCalorieGoal || 2000,
        dailyWaterGoal: userProfile?.dailyWaterGoal || 2000,
        mealCount: meals.length
      };

      return dailyTotals;
    } catch (error) {
      console.error('[Analytics] Error getting daily totals:', error);
      return null;
    }
  }

  private async getActivityLogs(startDate: Date, endDate: Date): Promise<ActivityLog[]> {
    const user = auth().currentUser;
    if (!user) throw new Error('User not authenticated');

    const activityLogsRef = collection(firestore(), 'activity_logs');
    const q = query(
      activityLogsRef,
      where('userId', '==', user.uid),
      where('timestamp', '>=', startDate),
      where('timestamp', '<=', endDate),
      orderBy('timestamp', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as ActivityLog[];
  }
}

export const analyticsService = AnalyticsService.getInstance(); 