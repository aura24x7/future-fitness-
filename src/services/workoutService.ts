import { firestore } from '../firebase/firebaseInit';
import { getAuth } from 'firebase/auth';
import { collection, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

// Get typed auth instance
const auth = getAuth();

// Define WorkoutLog interface if it's not exported from '../types/workout'
interface WorkoutLog {
  id?: string;
  timestamp: number;
  duration: number;
  caloriesBurned: number;
  type: string;
  exercises: any[];
  notes?: string;
}

class WorkoutService {
  private static instance: WorkoutService;
  private readonly COLLECTION = 'workouts';

  private constructor() {}

  static getInstance(): WorkoutService {
    if (!WorkoutService.instance) {
      WorkoutService.instance = new WorkoutService();
    }
    return WorkoutService.instance;
  }

  private getUserWorkoutsCollection(userId: string) {
    return collection(firestore, this.COLLECTION, userId, 'logs');
  }

  async migrateWorkoutData(workout: WorkoutLog): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    try {
      const date = new Date(workout.timestamp).toISOString().split('T')[0];
      const logsCollection = this.getUserWorkoutsCollection(user.uid);
      const statsDocRef = doc(logsCollection, date);

      const statsDocSnap = await getDoc(statsDocRef);
      const currentData = statsDocSnap.exists() ? statsDocSnap.data() : {
        totalCaloriesBurned: 0,
        totalWorkouts: 0,
        completedExercises: 0,
        workouts: [],
      };

      // Only add workout if it doesn't exist
      const workoutExists = currentData.workouts.some(
        (w: WorkoutLog) => w.timestamp === workout.timestamp
      );

      if (!workoutExists) {
        const updatedData = {
          totalCaloriesBurned: currentData.totalCaloriesBurned + (workout.caloriesBurned || 0),
          totalWorkouts: currentData.totalWorkouts + 1,
          completedExercises: currentData.completedExercises + workout.exercises.length,
          workouts: [...currentData.workouts, workout],
        };

        await setDoc(statsDocRef, updatedData);
      }
    } catch (error) {
      console.error('Error migrating workout:', error);
      throw new Error('Failed to migrate workout data');
    }
  }

  async getTodayWorkoutStats(): Promise<{
    totalCaloriesBurned: number;
    totalWorkouts: number;
    completedExercises: number;
  }> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    try {
      const today = new Date().toISOString().split('T')[0];
      const logsCollection = this.getUserWorkoutsCollection(user.uid);
      const statsDocRef = doc(logsCollection, today);
      const statsDocSnap = await getDoc(statsDocRef);

      if (!statsDocSnap.exists()) {
        return {
          totalCaloriesBurned: 0,
          totalWorkouts: 0,
          completedExercises: 0,
        };
      }

      const data = statsDocSnap.data();
      return {
        totalCaloriesBurned: data.totalCaloriesBurned || 0,
        totalWorkouts: data.totalWorkouts || 0,
        completedExercises: data.completedExercises || 0,
      };
    } catch (error) {
      console.error('Error getting workout stats:', error);
      throw new Error('Failed to get workout stats');
    }
  }

  async logWorkout(workout: WorkoutLog): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    try {
      const today = new Date().toISOString().split('T')[0];
      const logsCollection = this.getUserWorkoutsCollection(user.uid);
      const statsDocRef = doc(logsCollection, today);
      
      const statsDocSnap = await getDoc(statsDocRef);
      const currentData = statsDocSnap.exists() ? statsDocSnap.data() : {
        totalCaloriesBurned: 0,
        totalWorkouts: 0,
        completedExercises: 0,
        workouts: [],
      };

      const updatedData = {
        totalCaloriesBurned: currentData.totalCaloriesBurned + (workout.caloriesBurned || 0),
        totalWorkouts: currentData.totalWorkouts + 1,
        completedExercises: currentData.completedExercises + workout.exercises.length,
        workouts: [...currentData.workouts, workout],
      };

      await setDoc(statsDocRef, updatedData);
    } catch (error) {
      console.error('Error logging workout:', error);
      throw new Error('Failed to log workout');
    }
  }
}

export const workoutService = WorkoutService.getInstance();
