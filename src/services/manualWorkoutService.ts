import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateUUID } from '../utils/uuid';
import { Exercise, WorkoutLog } from '../types/workout';
import { ManualWorkout } from '../types/workoutSharing';

const MANUAL_WORKOUTS_KEY = '@manual_workouts';

class ManualWorkoutService {
  private static instance: ManualWorkoutService;
  
  private constructor() {}

  public static getInstance(): ManualWorkoutService {
    if (!ManualWorkoutService.instance) {
      ManualWorkoutService.instance = new ManualWorkoutService();
    }
    return ManualWorkoutService.instance;
  }

  async createManualWorkout(workout: Omit<ManualWorkout, 'id' | 'isManual'>): Promise<ManualWorkout> {
    try {
      const workouts = await this.getManualWorkouts();
      
      const newWorkout: ManualWorkout = {
        ...workout,
        id: generateUUID(),
        isManual: true,
        lastModified: new Date().toISOString(),
        isShared: false
      };

      await AsyncStorage.setItem(
        MANUAL_WORKOUTS_KEY,
        JSON.stringify([...workouts, newWorkout])
      );

      return newWorkout;
    } catch (error) {
      console.error('Error creating manual workout:', error);
      throw new Error('Failed to create manual workout');
    }
  }

  async getManualWorkouts(): Promise<ManualWorkout[]> {
    try {
      const data = await AsyncStorage.getItem(MANUAL_WORKOUTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting manual workouts:', error);
      return [];
    }
  }

  async updateManualWorkout(workoutId: string, updates: Partial<ManualWorkout>): Promise<ManualWorkout> {
    try {
      const workouts = await this.getManualWorkouts();
      const workoutIndex = workouts.findIndex(w => w.id === workoutId);
      
      if (workoutIndex === -1) {
        throw new Error('Workout not found');
      }

      const updatedWorkout: ManualWorkout = {
        ...workouts[workoutIndex],
        ...updates,
        lastModified: new Date().toISOString()
      };

      workouts[workoutIndex] = updatedWorkout;
      await AsyncStorage.setItem(MANUAL_WORKOUTS_KEY, JSON.stringify(workouts));

      return updatedWorkout;
    } catch (error) {
      console.error('Error updating manual workout:', error);
      throw new Error('Failed to update manual workout');
    }
  }

  async deleteManualWorkout(workoutId: string): Promise<void> {
    try {
      const workouts = await this.getManualWorkouts();
      const filteredWorkouts = workouts.filter(w => w.id !== workoutId);
      await AsyncStorage.setItem(MANUAL_WORKOUTS_KEY, JSON.stringify(filteredWorkouts));
    } catch (error) {
      console.error('Error deleting manual workout:', error);
      throw new Error('Failed to delete manual workout');
    }
  }

  async getWorkoutsByDate(date: string): Promise<ManualWorkout[]> {
    try {
      const workouts = await this.getManualWorkouts();
      return workouts.filter(workout => workout.date === date);
    } catch (error) {
      console.error('Error getting workouts by date:', error);
      return [];
    }
  }

  async markExerciseComplete(workoutId: string, exerciseId: string, completed: boolean): Promise<ManualWorkout> {
    try {
      const workouts = await this.getManualWorkouts();
      const workoutIndex = workouts.findIndex(w => w.id === workoutId);
      
      if (workoutIndex === -1) {
        throw new Error('Workout not found');
      }

      const workout = workouts[workoutIndex];
      const exerciseIndex = workout.exercises.findIndex(e => e.id === exerciseId);
      
      if (exerciseIndex === -1) {
        throw new Error('Exercise not found');
      }

      workout.exercises[exerciseIndex].completed = completed;
      workout.completedExercises = workout.exercises.filter(e => e.completed).length;
      workout.completed = workout.completedExercises === workout.totalExercises;
      workout.lastModified = new Date().toISOString();

      workouts[workoutIndex] = workout;
      await AsyncStorage.setItem(MANUAL_WORKOUTS_KEY, JSON.stringify(workouts));

      return workout;
    } catch (error) {
      console.error('Error marking exercise complete:', error);
      throw new Error('Failed to mark exercise complete');
    }
  }
}

export const manualWorkoutService = ManualWorkoutService.getInstance();
