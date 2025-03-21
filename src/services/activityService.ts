import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  ActivityLog, 
  ActivityStats, 
  ActivitySettings, 
  ActivityType,
  DEFAULT_ACTIVITY_TYPES,
  ACTIVITY_MULTIPLIERS,
  ActivityLevel 
} from '../types/activity';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

const STORAGE_KEYS = {
  ACTIVITY_LOGS: '@activity_logs',
  ACTIVITY_SETTINGS: '@activity_settings',
  CUSTOM_ACTIVITY_TYPES: '@custom_activity_types'
};

class ActivityService {
  // Activity Log Management
  async getActivityLogs(startDate?: Date, endDate?: Date): Promise<ActivityLog[]> {
    try {
      const logsString = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
      const logs: ActivityLog[] = logsString ? JSON.parse(logsString) : [];

      if (!startDate || !endDate) return logs;

      return logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= startDate && logDate <= endDate;
      });
    } catch (error) {
      console.error('Error getting activity logs:', error);
      return [];
    }
  }

  private async saveActivityLogs(logs: ActivityLog[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
    } catch (error) {
      console.error('Error saving activity logs:', error);
      throw error;
    }
  }

  async addActivityLog(
    level: ActivityLevel,
    duration: number,
    type: ActivityType,
    notes?: string
  ): Promise<ActivityLog> {
    try {
      const logs = await this.getActivityLogs();
      const caloriesBurned = this.calculateCaloriesBurned(duration, type.metValue);
      
      const newLog: ActivityLog = {
        id: Date.now().toString(),
        userId: 'current_user', // TODO: Get from auth context
        timestamp: new Date(),
        level,
        duration,
        type,
        caloriesBurned,
        notes
      };

      logs.push(newLog);
      await this.saveActivityLogs(logs);
      return newLog;
    } catch (error) {
      console.error('Error adding activity log:', error);
      throw error;
    }
  }

  // Activity Stats Calculation
  async getActivityStats(date: Date = new Date()): Promise<ActivityStats> {
    try {
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      const weekStart = startOfWeek(date);
      const weekEnd = endOfWeek(date);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      const [dailyLogs, weeklyLogs, monthlyLogs] = await Promise.all([
        this.getActivityLogs(dayStart, dayEnd),
        this.getActivityLogs(weekStart, weekEnd),
        this.getActivityLogs(monthStart, monthEnd),
      ]);

      const activityCounts = new Map<string, number>();
      let totalMinutes = 0;
      let totalIntensityScore = 0;

      weeklyLogs.forEach(log => {
        activityCounts.set(log.type.name, (activityCounts.get(log.type.name) || 0) + 1);
        totalMinutes += log.duration;
        totalIntensityScore += this.getIntensityScore(log.level);
      });

      const mostFrequentActivity = Array.from(activityCounts.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

      const averageIntensity = this.getAverageIntensity(totalIntensityScore / weeklyLogs.length);

      return {
        dailyCaloriesBurned: this.sumCaloriesBurned(dailyLogs),
        weeklyCaloriesBurned: this.sumCaloriesBurned(weeklyLogs),
        monthlyCaloriesBurned: this.sumCaloriesBurned(monthlyLogs),
        activityStreak: await this.calculateActivityStreak(),
        mostFrequentActivity,
        totalActiveMinutes: totalMinutes,
        averageIntensity,
      };
    } catch (error) {
      console.error('Error getting activity stats:', error);
      throw error;
    }
  }

  // Settings Management
  async getActivitySettings(): Promise<ActivitySettings> {
    try {
      const settingsString = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVITY_SETTINGS);
      return settingsString ? JSON.parse(settingsString) : {
        defaultDuration: 30,
        reminderEnabled: false,
        weeklyGoal: {
          minutes: 150, // WHO recommended minimum
          calories: 2000,
        },
      };
    } catch (error) {
      console.error('Error getting activity settings:', error);
      throw error;
    }
  }

  async updateActivitySettings(settings: Partial<ActivitySettings>): Promise<ActivitySettings> {
    try {
      const currentSettings = await this.getActivitySettings();
      const updatedSettings = { ...currentSettings, ...settings };
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITY_SETTINGS, JSON.stringify(updatedSettings));
      return updatedSettings;
    } catch (error) {
      console.error('Error updating activity settings:', error);
      throw error;
    }
  }

  // Activity Types Management
  async getActivityTypes(): Promise<ActivityType[]> {
    try {
      const customTypesString = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_ACTIVITY_TYPES);
      const customTypes = customTypesString ? JSON.parse(customTypesString) : [];
      return [...DEFAULT_ACTIVITY_TYPES, ...customTypes];
    } catch (error) {
      console.error('Error getting activity types:', error);
      return DEFAULT_ACTIVITY_TYPES;
    }
  }

  // Helper Methods
  private calculateCaloriesBurned(duration: number, metValue: number): number {
    // Formula: Calories = Duration (hours) × MET × Weight (kg)
    const weight = 70; // TODO: Get from user profile
    return Math.round((duration / 60) * metValue * weight);
  }

  private sumCaloriesBurned(logs: ActivityLog[]): number {
    return logs.reduce((sum, log) => sum + log.caloriesBurned, 0);
  }

  private async calculateActivityStreak(): Promise<number> {
    const logs = await this.getActivityLogs();
    if (logs.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    
    while (true) {
      const dayStart = startOfDay(currentDate);
      const dayEnd = endOfDay(currentDate);
      const hasActivity = logs.some(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= dayStart && logDate <= dayEnd;
      });

      if (!hasActivity) break;
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  }

  private getIntensityScore(level: ActivityLevel): number {
    const scores: Record<ActivityLevel, number> = {
      sedentary: 1,
      light: 2,
      moderate: 3,
      high: 4,
      very_high: 5,
    };
    return scores[level];
  }

  private getAverageIntensity(score: number): ActivityLevel {
    if (score <= 1.5) return 'sedentary';
    if (score <= 2.5) return 'light';
    if (score <= 3.5) return 'moderate';
    if (score <= 4.5) return 'high';
    return 'very_high';
  }
}

export const activityService = new ActivityService(); 