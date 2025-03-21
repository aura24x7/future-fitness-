import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeightLog, WeightGoal, WeightStats, WeightSettings, WeightChartData, WeightChartConfig, WeeklyProgress } from '../types/weight';
import { format, differenceInDays, eachDayOfInterval, isWithinInterval, eachWeekOfInterval } from 'date-fns';
import { auth, firestore } from '../firebase/firebaseInitTypes';
import { collection, query, where, orderBy, getDocs, getDoc, setDoc, updateDoc, doc, Timestamp, limit } from 'firebase/firestore';
import { mealAggregationService } from './mealAggregationService';

const STORAGE_KEYS = {
  WEIGHT_LOGS: '@weight_logs',
  WEIGHT_GOAL: '@weight_goal',
  WEIGHT_SETTINGS: '@weight_settings'
};

class WeightService {
  private readonly COLLECTION = 'weight_goals';

  async getWeightLogs(): Promise<WeightLog[]> {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn('[WeightService] No authenticated user');
        return [];
      }

      // Get logs from Firestore
      const logsCollectionRef = collection(firestore, 'weight_logs');
      
      try {
        // Try with ordered query first
        const q = query(
          logsCollectionRef,
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc')
        );

        const snapshot = await getDocs(q);
        const logs = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Safely convert timestamp
            timestamp: data.timestamp?.toDate() || new Date(),
            weight: Number(data.weight) || 0
          } as WeightLog;
        });

        // Cache logs locally
        await AsyncStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(logs));
        console.log('[WeightService] Retrieved logs:', logs.length);
        return logs;
      } catch (queryError) {
        // If index error occurs, use basic query as fallback
        if (queryError instanceof Error && queryError.message.includes('index')) {
          console.warn('[WeightService] Index not ready, using basic query fallback');
          const basicQuery = query(
            logsCollectionRef,
            where('userId', '==', user.uid)
          );
          
          const snapshot = await getDocs(basicQuery);
          const logs = snapshot.docs
            .map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                // Safely convert timestamp with fallback
                timestamp: data.timestamp?.toDate() || new Date(),
                weight: Number(data.weight) || 0
              } as WeightLog;
            })
            // Ensure proper sorting
            .sort((a, b) => {
              const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : 0;
              const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : 0;
              return bTime - aTime;
            });

          // Cache logs locally
          await AsyncStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(logs));
          console.log('[WeightService] Retrieved logs (fallback):', logs.length);
          return logs;
        }
        // If it's not an index error, rethrow
        throw queryError;
      }
    } catch (error) {
      console.error('[WeightService] Error getting weight logs:', error);
      // Try to get from local cache if Firestore fails
      try {
        const logsString = await AsyncStorage.getItem(STORAGE_KEYS.WEIGHT_LOGS);
        const logs = logsString ? JSON.parse(logsString) : [];
        console.log('[WeightService] Using cached logs:', logs.length);
        return logs;
      } catch (cacheError) {
        console.error('[WeightService] Cache retrieval failed:', cacheError);
        return [];
      }
    }
  }

  private async saveWeightLogs(logs: WeightLog[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(logs));
    } catch (error) {
      console.error('Error saving weight logs:', error);
      throw error;
    }
  }

  async addWeightLog(weight: number, notes?: string): Promise<WeightLog> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('[WeightService] No authenticated user');
      }

      // Create new log with correct userId
      const newLog: WeightLog = {
        id: Date.now().toString(),
        userId: user.uid,
        timestamp: new Date(),
        weight,
        notes
      };
      
      // Save to Firestore first
      const logsRef = collection(firestore, 'weight_logs');
      const docRef = doc(logsRef);
      await setDoc(docRef, {
        ...newLog,
        timestamp: Timestamp.fromDate(newLog.timestamp)
      });

      // Update local cache
      const logs = await this.getWeightLogs();
      logs.push(newLog);
      await this.saveWeightLogs(logs);

      console.log('[WeightService] Weight log added:', newLog);
      return newLog;
    } catch (error) {
      console.error('[WeightService] Error adding weight log:', error);
      throw error;
    }
  }

  private calculateWeeklyStats(logs: WeightLog[]): { 
    weeklyAverage: number;
    weeklyChange: number;
    totalChange: number;
  } | null {
    if (logs.length === 0) return null;

    // Sort logs by timestamp
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Group by week and calculate averages
    const weeklyAverages = new Map<string, number>();
    sortedLogs.forEach(log => {
      const logDate = new Date(log.timestamp);
      const weekStart = new Date(logDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      
      const existing = weeklyAverages.get(weekKey);
      if (existing) {
        weeklyAverages.set(weekKey, (existing + log.weight) / 2);
      } else {
        weeklyAverages.set(weekKey, log.weight);
      }
    });

    const averages = Array.from(weeklyAverages.values());
    if (averages.length < 2) return null;

    const latestWeekAvg = averages[averages.length - 1];
    const previousWeekAvg = averages[averages.length - 2];
    const firstWeekAvg = averages[0];

    return {
      weeklyAverage: Number(latestWeekAvg.toFixed(1)),
      weeklyChange: Number((latestWeekAvg - previousWeekAvg).toFixed(1)),
      totalChange: Number((latestWeekAvg - firstWeekAvg).toFixed(1))
    };
  }

  private getWeekBoundaries(date: Date): { start: Date; end: Date } {
    // Adjust so that the week starts on Monday and ends on Sunday
    const day = date.getDay();
    // If day is Sunday (0), set diff to -6 to get Monday of the current week, otherwise diff = 1 - day
    const diff = day === 0 ? -6 : 1 - day;

    const start = new Date(date);
    start.setDate(date.getDate() + diff);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  private async getCalorieData(startDate: Date, endDate: Date): Promise<Map<string, number>> {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('[WeightService] No authenticated user');
        return new Map();
      }

      // Get meals within the date range
      const mealsRef = collection(firestore, `users/${user.uid}/meals`);
      
      // Normalize dates to start and end of day to ensure we capture all meals
      const normalizedStart = new Date(startDate);
      normalizedStart.setHours(0, 0, 0, 0);
      const normalizedEnd = new Date(endDate);
      normalizedEnd.setHours(23, 59, 59, 999);
      
      // Convert normalized dates to Firestore Timestamps
      const startTimestamp = Timestamp.fromDate(normalizedStart);
      const endTimestamp = Timestamp.fromDate(normalizedEnd);
      
      console.log('[WeightService] Querying meals with timestamps:', {
        start: normalizedStart.toISOString(),
        end: normalizedEnd.toISOString(),
        path: `users/${user.uid}/meals`
      });

      try {
        const mealsQuery = query(
          mealsRef,
          where('timestamp', '>=', startTimestamp),
          where('timestamp', '<=', endTimestamp)
        );

        const mealsSnapshot = await getDocs(mealsQuery);
        console.log('[WeightService] Found meals:', mealsSnapshot.size);

        const calorieMap = new Map<string, number>();
        
        // Initialize all days in the range with 0 calories
        const allDates = eachDayOfInterval({ start: startDate, end: endDate });
        allDates.forEach((date: Date) => {
          calorieMap.set(format(date, 'yyyy-MM-dd'), 0);
        });

        // Process each meal and aggregate calories by date
        mealsSnapshot.forEach(doc => {
          const mealData = doc.data();
          let mealDate: Date | null = null;

          // Handle different timestamp formats
          if (mealData.timestamp instanceof Timestamp) {
            mealDate = mealData.timestamp.toDate();
          } else if (typeof mealData.timestamp === 'string') {
            mealDate = new Date(mealData.timestamp);
          }

          if (mealDate && mealData.calories) {
            const dateKey = format(mealDate, 'yyyy-MM-dd');
            const currentCalories = calorieMap.get(dateKey) || 0;
            const newCalories = currentCalories + Number(mealData.calories);
            calorieMap.set(dateKey, newCalories);
            
            console.log('[WeightService] Added calories for', dateKey, ':', {
              meal: doc.id,
              calories: mealData.calories,
              currentTotal: newCalories,
              mealTimestamp: mealDate.toISOString()
            });
          }
        });

        // Calculate summary statistics
        const validDays = Array.from(calorieMap.values()).filter(c => c > 0).length;
        const totalCalories = Array.from(calorieMap.values()).reduce((sum, c) => sum + c, 0);
        const averageCalories = validDays > 0 ? Math.round(totalCalories / validDays) : 0;

        console.log('[WeightService] Calorie data summary:', {
          totalDays: calorieMap.size,
          validDays,
          averageCalories,
          totalCalories,
          daysNeededForValidity: Math.max(0, 5 - validDays),
          data: Object.fromEntries(calorieMap)
        });

        return calorieMap;
      } catch (queryError) {
        // If index error occurs, try fallback query
        if (queryError instanceof Error && queryError.message.includes('index')) {
          console.warn('[WeightService] Index not ready, using basic query fallback');
          const basicQuery = query(collection(firestore, `users/${user.uid}/meals`));
          const snapshot = await getDocs(basicQuery);
          
          // Filter meals manually
          const filteredMeals = snapshot.docs.filter(doc => {
            const data = doc.data();
            const timestamp = data.timestamp instanceof Timestamp ? 
              data.timestamp.toDate() : 
              new Date(data.timestamp);
            return timestamp >= normalizedStart && timestamp <= normalizedEnd;
          });

          console.log('[WeightService] Found meals (fallback):', filteredMeals.length);
          
          // Process meals same as above
          const calorieMap = new Map<string, number>();
          const allDates = eachDayOfInterval({ start: startDate, end: endDate });
          allDates.forEach((date: Date) => {
            calorieMap.set(format(date, 'yyyy-MM-dd'), 0);
          });

          filteredMeals.forEach(doc => {
            const mealData = doc.data();
            const mealDate = mealData.timestamp instanceof Timestamp ? 
              mealData.timestamp.toDate() : 
              new Date(mealData.timestamp);

            if (mealDate && mealData.calories) {
              const dateKey = format(mealDate, 'yyyy-MM-dd');
              const currentCalories = calorieMap.get(dateKey) || 0;
              const newCalories = currentCalories + Number(mealData.calories);
              calorieMap.set(dateKey, newCalories);
            }
          });

          return calorieMap;
        }
        throw queryError;
      }
    } catch (error) {
      console.error('[WeightService] Error getting calorie data:', error);
      return new Map();
    }
  }

  private calculateWeeklyCalorieAverage(
    calorieMap: Map<string, number>,
    weekStart: Date
  ): number | undefined {
    console.log('[WeightService] Calculating weekly calorie average for week starting:', weekStart);
    
    const { start, end } = this.getWeekBoundaries(weekStart);
    const weekDates = eachDayOfInterval({ start, end });

    let totalCalories = 0;
    let daysWithData = 0;

    weekDates.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      const calories = calorieMap.get(dateKey) || 0;
      
      if (calories > 0) {
        totalCalories += calories;
        daysWithData++;
      }
      console.log('[WeightService] Day:', dateKey, 'Calories:', calories, 'Valid:', calories > 0);
    });

    const average = daysWithData > 0 ? Math.round(totalCalories / daysWithData) : 0;
    
    console.log('[WeightService] Weekly calorie calculation:', {
      totalCalories,
      daysWithData,
      average,
      isValid: daysWithData >= 5
    });

    return daysWithData >= 5 ? average : 0;
  }

  private async processWeightLogs(
    logs: WeightLog[],
    startDate: Date,
    endDate: Date
  ): Promise<WeightChartData[]> {
    // Get calorie data for the period
    const calorieMap = await this.getCalorieData(startDate, endDate);
    const userProfile = await this.getUserProfile();

    if (logs.length === 0) {
      return []; // Return empty array for new users
    }

    // Sort logs by timestamp
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Group logs by week
    const weeklyData = new Map<string, { weights: number[]; date: Date }>();
    sortedLogs.forEach(log => {
      const logDate = new Date(log.timestamp);
      const { start: weekStart } = this.getWeekBoundaries(logDate);
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      const weekData = weeklyData.get(weekKey) || { weights: [], date: weekStart };
      weekData.weights.push(log.weight);
      weeklyData.set(weekKey, weekData);
    });

    // Convert to chart data
    return Array.from(weeklyData.entries()).map(([weekKey, data]) => {
      const avgWeight = data.weights.reduce((sum, w) => sum + w, 0) / data.weights.length;
      const calories = this.calculateWeeklyCalorieAverage(calorieMap, data.date);

      return {
        date: data.date,
        weight: Number(avgWeight.toFixed(1)),
        calories: calories,
        isActual: true
      };
    });
  }

  async getWeightStats(): Promise<WeightStats | null> {
    try {
      const [logs, goal] = await Promise.all([
        this.getWeightLogs(),
        this.getWeightGoal()
      ]);

      if (logs.length === 0) {
        return null;
      }

      // Calculate weekly stats
      const weeklyStats = this.calculateWeeklyStats(logs);
      if (!weeklyStats) return null;

      const currentWeight = weeklyStats.weeklyAverage;
      const startWeight = goal?.startWeight || logs[0].weight;
      const targetWeight = goal?.targetWeight || currentWeight;

      // Calculate progress percentage
      const totalWeightToLose = Math.abs(targetWeight - startWeight);
      const weightLost = Math.abs(currentWeight - startWeight);
      const totalProgress = totalWeightToLose === 0 ? 0 : (weightLost / totalWeightToLose) * 100;

      // Calculate projected date if goal exists
      let projectedDate: Date | undefined;
      if (goal && weeklyStats.weeklyChange !== 0) {
        const remainingWeight = Math.abs(targetWeight - currentWeight);
        const weeksToGoal = remainingWeight / Math.abs(weeklyStats.weeklyChange);
        projectedDate = new Date();
        projectedDate.setDate(projectedDate.getDate() + (weeksToGoal * 7));
      }

      return {
        currentWeight,
        startWeight,
        targetWeight,
        totalProgress,
        weeklyChange: weeklyStats.weeklyChange,
        monthlyChange: weeklyStats.weeklyChange * 4, // Approximate monthly change
        projectedDate
      };
    } catch (error) {
      console.error('Error getting weight stats:', error);
      return null;
    }
  }

  async getWeightGoal(): Promise<WeightGoal | null> {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn('No authenticated user');
        return null;
      }

      // Try to get from Firebase first
      const goalDocRef = doc(firestore, this.COLLECTION, user.uid);
      const goalDoc = await getDoc(goalDocRef);

      if (goalDoc.exists()) {
        const data = goalDoc.data();
        // Convert Firestore Timestamps to Dates
        return {
          ...data,
          startDate: data.startDate.toDate(),
          targetDate: data.targetDate.toDate(),
        } as WeightGoal;
      }

      // Try AsyncStorage next
      const goalString = await AsyncStorage.getItem(STORAGE_KEYS.WEIGHT_GOAL);
      if (goalString) {
        const goal = JSON.parse(goalString);
        // Save to Firebase for future use
        await this.setWeightGoal(goal);
        return goal;
      }

      // Only use mock data in development if no real data exists
      if (process.env.NODE_ENV === 'development') {
        console.log('[DEV ONLY] Generating mock weight goal');
        const mockGoal: WeightGoal = {
          id: 'mock_goal',
          userId: user.uid,
          startWeight: 85,
          targetWeight: 75,
          startDate: new Date(new Date().setDate(new Date().getDate() - 14)),
          targetDate: new Date(new Date().setDate(new Date().getDate() + 76)),
          weeklyGoal: 0.5,
          milestones: []
        };

        // Save mock data to Firebase to prevent regeneration
        await this.setWeightGoal(mockGoal);
        return mockGoal;
      }

      return null;
    } catch (error) {
      console.error('Error getting weight goal:', error);
      return null;
    }
  }

  async setWeightGoal(goal: Omit<WeightGoal, 'id' | 'userId'>): Promise<WeightGoal> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const newGoal: WeightGoal = {
        ...goal,
        id: Date.now().toString(),
        userId: user.uid,
      };

      // Save to Firebase
      const goalDocRef = doc(firestore, this.COLLECTION, user.uid);
      await setDoc(goalDocRef, {
        ...newGoal,
        startDate: Timestamp.fromDate(new Date(newGoal.startDate)),
        targetDate: Timestamp.fromDate(new Date(newGoal.targetDate)),
      });

      // Also save to AsyncStorage for backward compatibility
      await AsyncStorage.setItem(STORAGE_KEYS.WEIGHT_GOAL, JSON.stringify(newGoal));
      
      console.log('Weight goal saved:', newGoal);
      return newGoal;
    } catch (error) {
      console.error('Error setting weight goal:', error);
      throw error;
    }
  }

  async getWeightSettings(): Promise<WeightSettings> {
    try {
      const settingsString = await AsyncStorage.getItem(STORAGE_KEYS.WEIGHT_SETTINGS);
      return settingsString ? JSON.parse(settingsString) : {
        unit: 'kg',
        weeklyGoal: 0.5,
        reminderEnabled: false
      };
    } catch (error) {
      console.error('Error getting weight settings:', error);
      throw error;
    }
  }

  async updateWeightSettings(settings: Partial<WeightSettings>): Promise<WeightSettings> {
    try {
      const currentSettings = await this.getWeightSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      await AsyncStorage.setItem(STORAGE_KEYS.WEIGHT_SETTINGS, JSON.stringify(updatedSettings));
      return updatedSettings;
    } catch (error) {
      console.error('Error updating weight settings:', error);
      throw error;
    }
  }

  async getChartData(config: WeightChartConfig): Promise<WeightChartData[]> {
    try {
      const [logs, goal, userProfile] = await Promise.all([
        this.getWeightLogs(),
        this.getWeightGoal(),
        this.getUserProfile()
      ]);

      if (!goal) {
        console.warn('No weight goal found');
        return [];
      }

      // Process actual weight logs
      const actualLine = await this.processWeightLogs(logs, config.startDate, config.endDate);

      // Get weekly calories from actual data
      const weeklyCalories = actualLine
        .map(data => data.calories || 0);

      // Calculate target weight line with calorie data
      const targetLine = this.calculateTargetWeightLine(
        goal.startWeight,
        goal.targetWeight,
        goal.startDate,
        goal.targetDate,
        weeklyCalories,
        userProfile?.dailyCalorieGoal || 2000
      );

      // Merge target and actual data
      return this.mergeChartData(targetLine, actualLine);
    } catch (error) {
      console.error('Error getting chart data:', error);
      return [];
    }
  }

  private calculateAdjustedWeeklyLoss(
    currentWeight: number,
    targetWeight: number,
    totalWeeks: number,
    actualCalories: number,
    tdee: number
  ): number {
    // 7700 calories = 1kg weight change
    const expectedWeeklyDeficit = (targetWeight - currentWeight) * 7700 / totalWeeks;
    const actualWeeklyDeficit = (tdee - actualCalories) * 7;
    
    // Use actual deficit if it's better than expected, else use expected
    return actualWeeklyDeficit > expectedWeeklyDeficit ? 
      actualWeeklyDeficit / 7700 :
      expectedWeeklyDeficit / 7700;
  }

  private calculateTargetWeightLine(
    startWeight: number,
    targetWeight: number,
    startDate: Date,
    targetDate: Date,
    weeklyCalories: number[],
    tdee: number
  ): WeightChartData[] {
    const totalWeeks = Math.ceil(differenceInDays(targetDate, startDate) / 7);
    
    return eachWeekOfInterval({ start: startDate, end: targetDate })
      .map((weekStart, index) => {
        const weeklyCal = weeklyCalories[index] || 0;
        const adjustedLoss = this.calculateAdjustedWeeklyLoss(
          startWeight, 
          targetWeight,
          totalWeeks,
          weeklyCal,
          tdee
        );
        
        return {
          date: weekStart,
          targetWeight: Number((startWeight - (adjustedLoss * index)).toFixed(1))
        };
      });
  }

  private mergeChartData(
    targetLine: WeightChartData[],
    actualLine: WeightChartData[]
  ): WeightChartData[] {
    // Create a map of actual weights and calorie data by week start date string
    const actualDataMap = new Map(
      actualLine.map(data => [
        format(data.date, 'yyyy-MM-dd'),
        {
          weight: data.weight,
          calories: data.calories
        }
      ])
    );

    // Merge target line with actual data
    return targetLine.map(data => {
      const dateKey = format(data.date, 'yyyy-MM-dd');
      const actualData = actualDataMap.get(dateKey);
      
      return {
        date: data.date,
        targetWeight: data.targetWeight,
        weight: actualData?.weight,
        calories: actualData?.calories,
        isActual: !!actualData?.weight
      };
    });
  }

  private async getUserProfile(): Promise<{ dailyCalorieGoal: number; tdee: number } | null> {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      // Try to get actual profile first
      const profileDocRef = doc(firestore, 'user_profiles', user.uid);
      const profileDoc = await getDoc(profileDocRef);
      
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        return {
          dailyCalorieGoal: data.dailyCalorieGoal || 2000,
          tdee: data.tdee || 2000
        };
      }

      // Only use mock data in development if no real data exists
      if (process.env.NODE_ENV === 'development') {
        console.log('[DEV ONLY] Generating mock user profile');
        const mockProfile = {
          dailyCalorieGoal: 1800,
          tdee: 2300
        };

        // Save mock profile to prevent regeneration
        await setDoc(profileDocRef, mockProfile);
        return mockProfile;
      }

      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async getWeeklyProgress(): Promise<WeeklyProgress> {
    try {
      console.log('[WeightService] Getting weekly progress...');
      const logs = await this.getWeightLogs();
      const goal = await this.getWeightGoal();
      const userProfile = await this.getUserProfile();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('No authenticated user');
      }

      console.log('[WeightService] Data retrieved:', {
        hasLogs: logs.length > 0,
        hasGoal: !!goal,
        hasProfile: !!userProfile
      });

      if (!logs.length || !goal || !userProfile) {
        console.log('[WeightService] Missing required data');
        return {
          startWeight: goal?.startWeight || 0,
          currentWeight: 0,
          targetWeight: goal?.targetWeight || 0,
          progressPercentage: 0,
          weeklyChange: 0,
          weeksCompleted: 0,
          totalWeeks: goal ? differenceInDays(goal.targetDate, goal.startDate) / 7 : 0,
          caloriesDeficit: 0,
          isDataValid: false,
          validDays: 0,
          startDate: null
        };
      }

      // Get current weight from latest log
      const sortedLogs = [...logs].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      console.log('[WeightService] Weight logs:', {
        total: logs.length,
        latest: sortedLogs[0]
      });

      const currentWeight = sortedLogs[0].weight;

      // Get the first meal date to determine the effective start date
      const mealsRef = collection(firestore, `users/${user.uid}/meals`);
      const firstMealQuery = query(
        mealsRef,
        orderBy('timestamp', 'asc'),
        limit(1)
      );
      
      console.log('[WeightService] Querying first meal from:', `users/${user.uid}/meals`);
      const firstMealSnapshot = await getDocs(firstMealQuery);
      let firstMealDate: Date | null = null;
      
      if (!firstMealSnapshot.empty) {
        const firstMealData = firstMealSnapshot.docs[0].data();
        // Enhanced timestamp validation and conversion
        try {
          if (firstMealData.timestamp instanceof Timestamp) {
            // Ensure the timestamp is valid before converting
            if (firstMealData.timestamp.seconds >= 0 && 
                firstMealData.timestamp.seconds < 8640000000000) {
              firstMealDate = firstMealData.timestamp.toDate();
            } else {
              console.warn('[WeightService] Invalid timestamp seconds:', firstMealData.timestamp.seconds);
            }
          } else if (typeof firstMealData.timestamp === 'string') {
            // Validate string timestamp format before parsing
            const timestampMs = Date.parse(firstMealData.timestamp);
            if (!isNaN(timestampMs) && timestampMs >= 0 && timestampMs < 8640000000000000) {
              firstMealDate = new Date(firstMealData.timestamp);
            } else {
              console.warn('[WeightService] Invalid string timestamp:', firstMealData.timestamp);
            }
          } else if (firstMealData.timestamp && typeof firstMealData.timestamp === 'object') {
            // Handle potential custom timestamp objects
            const seconds = firstMealData.timestamp.seconds || 0;
            if (seconds >= 0 && seconds < 8640000000000) {
              firstMealDate = new Date(seconds * 1000);
            } else {
              console.warn('[WeightService] Invalid custom timestamp:', firstMealData.timestamp);
            }
          } else {
            console.warn('[WeightService] Unrecognized timestamp format:', typeof firstMealData.timestamp);
          }
        } catch (timestampError) {
          console.error('[WeightService] Error converting timestamp:', timestampError);
        }
        
        if (firstMealDate) {
          console.log('[WeightService] First meal found:', {
            date: firstMealDate.toISOString(),
            mealId: firstMealSnapshot.docs[0].id,
            calories: firstMealData.calories
          });
        } else {
          console.warn('[WeightService] Could not determine valid date from first meal');
        }
      }

      // Use the first meal date if available and valid, otherwise fallback to goal start date
      let effectiveStartDate: Date;
      if (firstMealDate && !isNaN(firstMealDate.getTime())) {
        effectiveStartDate = new Date(firstMealDate);
      } else {
        effectiveStartDate = new Date(goal.startDate);
      }
      
      // Ensure a valid date using current date as fallback
      if (isNaN(effectiveStartDate.getTime())) {
        console.warn('[WeightService] Detected invalid start date, using fallback');
        effectiveStartDate = new Date();
      }
      
      effectiveStartDate.setHours(12, 0, 0, 0); // Normalize to noon

      console.log('[WeightService] Effective start date:', effectiveStartDate.toISOString());

      // Get current week boundaries
      const now = new Date();
      now.setHours(12, 0, 0, 0); // Normalize to noon

      // Calculate the last completed week
      const today = new Date(now);
      const dayOfWeek = today.getDay();
      const lastCompletedWeekEnd = new Date(today);
      lastCompletedWeekEnd.setDate(today.getDate() - dayOfWeek);
      lastCompletedWeekEnd.setHours(23, 59, 59, 999);

      const lastCompletedWeekStart = new Date(lastCompletedWeekEnd);
      lastCompletedWeekStart.setDate(lastCompletedWeekEnd.getDate() - 6);
      lastCompletedWeekStart.setHours(0, 0, 0, 0);

      console.log('[WeightService] Week boundaries:', {
        start: lastCompletedWeekStart.toISOString(),
        end: lastCompletedWeekEnd.toISOString()
      });

      // Use the later of lastCompletedWeekStart and effectiveStartDate for querying calorie data
      const effectiveQueryStart = new Date(Math.max(lastCompletedWeekStart.getTime(), effectiveStartDate.getTime()));
      
      console.log('[WeightService] Using effective calorie query start:', effectiveQueryStart.toISOString());

      // Get calorie data for the completed week using the adjusted start date
      const calorieData = await this.getCalorieData(effectiveQueryStart, lastCompletedWeekEnd);
      
      // Calculate valid days (days with actual calorie data)
      const validDays = Array.from(calorieData.values()).filter(c => c > 0).length;
      console.log('[WeightService] Calorie data for completed week:', {
        validDays,
        entries: Object.fromEntries(calorieData)
      });

      // Calculate average calories
      const avgCalories = this.calculateWeeklyCalorieAverage(calorieData, lastCompletedWeekStart) || 0;
      console.log('[WeightService] Average calories:', avgCalories);

      // Calculate progress percentage
      const progressPercentage = this.calculateProgressPercentage(
        goal.startWeight,
        currentWeight,
        goal.targetWeight
      );

      // Safely calculate weeks completed with validation
      const daysDiff = differenceInDays(lastCompletedWeekEnd, effectiveStartDate);
      const weeksCompleted = daysDiff >= 0 ? Math.floor(daysDiff / 7) : 0;

      console.log('[WeightService] Progress metrics:', {
        weeksCompleted,
        progressPercentage,
        validDays
      });

      // Calculate weekly change and deficit only if we have enough data
      const weeklyChange = validDays >= 5 ? this.calculateAdjustedWeeklyLoss(
        goal.startWeight,
        goal.targetWeight,
        Math.max(1, differenceInDays(goal.targetDate, effectiveStartDate) / 7), // Ensure non-zero divisor
        avgCalories,
        userProfile.tdee
      ) : 0;

      const caloriesDeficit = validDays >= 5 ? 
        (userProfile.tdee - avgCalories) * 7 : 
        0;

      // Calculate total weeks safely
      const totalWeeksDiff = differenceInDays(goal.targetDate, effectiveStartDate);
      const totalWeeks = totalWeeksDiff > 0 ? totalWeeksDiff / 7 : 1; // Ensure positive value

      const result: WeeklyProgress = {
        startWeight: goal.startWeight,
        currentWeight,
        targetWeight: goal.targetWeight,
        progressPercentage: Math.max(0, Math.min(100, progressPercentage)),
        weeklyChange,
        weeksCompleted,
        totalWeeks,
        caloriesDeficit,
        isDataValid: validDays >= 5 || (!!firstMealDate && differenceInDays(now, firstMealDate) < 5),
        validDays,
        startDate: firstMealDate && !isNaN(firstMealDate.getTime()) ? firstMealDate : null
      };

      console.log('[WeightService] Weekly progress calculated:', result);
      return result;
    } catch (error) {
      console.error('[WeightService] Error calculating weekly progress:', error);
      return {
        startWeight: 0,
        currentWeight: 0,
        targetWeight: 0,
        progressPercentage: 0,
        weeklyChange: 0,
        weeksCompleted: 0,
        totalWeeks: 0,
        caloriesDeficit: 0,
        isDataValid: false,
        validDays: 0,
        startDate: null
      };
    }
  }

  private calculateProgressPercentage(startWeight: number, currentWeight: number, targetWeight: number): number {
    const totalWeightToLose = Math.abs(targetWeight - startWeight);
    const weightLost = Math.abs(currentWeight - startWeight);
    return totalWeightToLose === 0 ? 0 : (weightLost / totalWeightToLose) * 100;
  }
}

// Export singleton instance
export const weightService = new WeightService();