import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutPlan } from './geminiService';

const WORKOUT_STORAGE_KEY = '@workout_plan';
const WORKOUT_STATS_KEY = '@workout_stats';

interface WorkoutStats {
  totalCaloriesBurned: number;
  totalDuration: number;
  lastUpdated: string;
}

class WorkoutTrackingService {
  private static instance: WorkoutTrackingService;

  private constructor() {}

  public static getInstance(): WorkoutTrackingService {
    if (!WorkoutTrackingService.instance) {
      WorkoutTrackingService.instance = new WorkoutTrackingService();
    }
    return WorkoutTrackingService.instance;
  }

  async saveWorkoutPlan(plan: WorkoutPlan[]): Promise<void> {
    try {
      await AsyncStorage.setItem(WORKOUT_STORAGE_KEY, JSON.stringify(plan));
      await this.updateWorkoutStats(plan);
    } catch (error) {
      console.error('Error saving workout plan:', error);
      throw error;
    }
  }

  async loadWorkoutPlan(): Promise<WorkoutPlan[]> {
    try {
      const savedPlan = await AsyncStorage.getItem(WORKOUT_STORAGE_KEY);
      return savedPlan ? JSON.parse(savedPlan) : [];
    } catch (error) {
      console.error('Error loading workout plan:', error);
      throw error;
    }
  }

  async updateWorkoutStats(plan: WorkoutPlan[]): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const stats: WorkoutStats = {
        totalCaloriesBurned: this.calculateTotalCaloriesBurned(plan),
        totalDuration: this.calculateTotalDuration(plan),
        lastUpdated: today
      };
      await AsyncStorage.setItem(WORKOUT_STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Error updating workout stats:', error);
      throw error;
    }
  }

  async getTodayWorkoutStats(): Promise<WorkoutStats> {
    try {
      const stats = await AsyncStorage.getItem(WORKOUT_STATS_KEY);
      if (!stats) {
        return {
          totalCaloriesBurned: 0,
          totalDuration: 0,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      const parsedStats: WorkoutStats = JSON.parse(stats);
      const today = new Date().toISOString().split('T')[0];
      
      // Reset stats if they're not from today
      if (parsedStats.lastUpdated !== today) {
        const newStats: WorkoutStats = {
          totalCaloriesBurned: 0,
          totalDuration: 0,
          lastUpdated: today
        };
        await AsyncStorage.setItem(WORKOUT_STATS_KEY, JSON.stringify(newStats));
        return newStats;
      }
      
      return parsedStats;
    } catch (error) {
      console.error('Error getting workout stats:', error);
      throw error;
    }
  }

  private calculateTotalCaloriesBurned(plan: WorkoutPlan[]): number {
    return plan.reduce((total, day) => {
      return total + (day.exercises?.reduce((dayTotal, exercise) => {
        return dayTotal + (exercise.completed ? exercise.calories : 0);
      }, 0) || 0);
    }, 0);
  }

  private calculateTotalDuration(plan: WorkoutPlan[]): number {
    return plan.reduce((total, day) => {
      return total + (day.exercises?.reduce((dayTotal, exercise) => {
        return dayTotal + (exercise.completed ? exercise.duration : 0);
      }, 0) || 0);
    }, 0);
  }
}

export const workoutTrackingService = WorkoutTrackingService.getInstance();
