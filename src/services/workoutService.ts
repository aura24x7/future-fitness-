import { auth, firestore } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, collection } from 'firebase/firestore';
import { WorkoutLog } from '../types/workout';

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

  private getUserWorkoutsRef(userId: string) {
    return collection(firestore, this.COLLECTION, userId, 'logs');
  }

  async migrateWorkoutData(workout: WorkoutLog): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    try {
      const date = new Date(workout.timestamp).toISOString().split('T')[0];
      const workoutsRef = this.getUserWorkoutsRef(user.uid);
      const statsDoc = doc(workoutsRef, date);

      const currentStats = await getDoc(statsDoc);
      const currentData = currentStats.exists() ? currentStats.data() : {
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

        await setDoc(statsDoc, updatedData);
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
      const workoutsRef = this.getUserWorkoutsRef(user.uid);
      const statsDoc = await getDoc(doc(workoutsRef, today));

      if (!statsDoc.exists()) {
        return {
          totalCaloriesBurned: 0,
          totalWorkouts: 0,
          completedExercises: 0,
        };
      }

      const data = statsDoc.data();
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
      const workoutsRef = this.getUserWorkoutsRef(user.uid);
      const statsDoc = doc(workoutsRef, today);

      const currentStats = await getDoc(statsDoc);
      const currentData = currentStats.exists() ? currentStats.data() : {
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

      await setDoc(statsDoc, updatedData);
    } catch (error) {
      console.error('Error logging workout:', error);
      throw new Error('Failed to log workout');
    }
  }
}

export const workoutService = WorkoutService.getInstance();
