import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { ExerciseProgress, WorkoutCompletion } from '../types/workout';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ensure Firebase is properly initialized
import '../firebase/firebaseInit';

// Storage keys for offline fallback
const PROGRESS_STORAGE_KEY = '@exercise_progress';
const COMPLETION_STORAGE_KEY = '@workout_completion';

class ExerciseProgressService {
  private static instance: ExerciseProgressService;
  private progressCollection: any = null;
  private completionCollection: any = null;
  private initialized = false;
  private useLocalStorage = false;

  private constructor() {}

  public static getInstance(): ExerciseProgressService {
    if (!ExerciseProgressService.instance) {
      ExerciseProgressService.instance = new ExerciseProgressService();
    }
    return ExerciseProgressService.instance;
  }

  private async initialize() {
    if (this.initialized) return;

    try {
      console.log('[ExerciseProgressService] Initializing...');
      
      try {
        // Get Firestore instance
        const db = firestore();
        if (db) {
          this.progressCollection = db.collection('exerciseProgress');
          this.completionCollection = db.collection('workoutCompletions');
          this.useLocalStorage = false;
        } else {
          throw new Error('Firestore instance not available');
        }
      } catch (error) {
        console.warn('[ExerciseProgressService] Firebase initialization failed, using AsyncStorage fallback:', error);
        this.useLocalStorage = true;
      }
      
      this.initialized = true;
      console.log('[ExerciseProgressService] Initialized successfully. Using local storage:', this.useLocalStorage);
    } catch (error) {
      console.error('[ExerciseProgressService] Initialization failed:', error);
      throw error;
    }
  }

  private getProgressCollection() {
    if (!this.initialized) {
      throw new Error('[ExerciseProgressService] Service not initialized');
    }
    return this.progressCollection;
  }

  private getCompletionCollection() {
    if (!this.initialized) {
      throw new Error('[ExerciseProgressService] Service not initialized');
    }
    return this.completionCollection;
  }

  private getCurrentUserId(): string {
    if (this.useLocalStorage) {
      return 'mock-user-id';
    }
    
    try {
      const user = auth().currentUser;
      if (!user) {
        console.warn('[ExerciseProgressService] User not authenticated, falling back to mock user');
        // Switch to local storage mode when user is not authenticated
        this.useLocalStorage = true;
        return 'mock-user-id';
      }
      return user.uid;
    } catch (error) {
      console.warn('[ExerciseProgressService] Auth error, falling back to mock user:', error);
      // Switch to local storage mode when auth has an error
      this.useLocalStorage = true;
      return 'mock-user-id';
    }
  }

  // Local storage helpers
  private async getLocalProgress(): Promise<ExerciseProgress[]> {
    const data = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
    
    if (!data) return [];
    
    try {
      // Parse JSON and ensure numeric values are correctly converted
      const parsedData = JSON.parse(data);
      
      // Process each exercise progress to ensure proper types
      return parsedData.map((progress: any) => ({
        ...progress,
        actualSets: Number(progress.actualSets) || 0,
        actualReps: Number(progress.actualReps) || 0,
        actualWeight: Number(progress.actualWeight) || 0,
        completed: typeof progress.completed === 'string' 
          ? progress.completed === 'true' || progress.completed === '$true'
          : Boolean(progress.completed),
        date: progress.date ? new Date(progress.date) : new Date(),
        completedAt: progress.completedAt ? new Date(progress.completedAt) : new Date(),
      }));
    } catch (error) {
      console.error('[ExerciseProgressService] Error parsing local progress:', error);
      return [];
    }
  }

  private async getLocalCompletions(): Promise<WorkoutCompletion[]> {
    const data = await AsyncStorage.getItem(COMPLETION_STORAGE_KEY);
    
    if (!data) return [];
    
    try {
      // Parse JSON and ensure numeric values are correctly converted
      const parsedData = JSON.parse(data);
      
      // Process each workout completion to ensure proper types
      return parsedData.map((completion: any) => ({
        ...completion,
        totalExercises: Number(completion.totalExercises) || 0,
        completedExercises: Number(completion.completedExercises) || 0,
        duration: Number(completion.duration) || 0,
        caloriesBurned: Number(completion.caloriesBurned) || 0,
        completedDate: completion.completedDate ? new Date(completion.completedDate) : new Date(),
      }));
    } catch (error) {
      console.error('[ExerciseProgressService] Error parsing local completions:', error);
      return [];
    }
  }

  // Exercise Progress CRUD operations
  async trackExerciseProgress(progress: Omit<ExerciseProgress, 'id'>): Promise<string> {
    await this.initialize();
    
    try {
      const userId = this.getCurrentUserId();
      
      // Normalize data before storing to ensure proper types
      const normalizedProgress: ExerciseProgress = {
        ...progress,
        userId,
        completedAt: new Date(),
        // Ensure numeric values are stored as numbers
        actualSets: Number(progress.actualSets) || 0,
        actualReps: Number(progress.actualReps) || 0,
        actualWeight: Number(progress.actualWeight) || 0,
        completed: Boolean(progress.completed),
        // Ensure dates are proper Date objects
        date: progress.date instanceof Date ? progress.date : new Date(),
      };

      if (this.useLocalStorage) {
        const progressList = await this.getLocalProgress();
        const id = `local-progress-${Date.now()}`;
        const progressWithId = { ...normalizedProgress, id };
        progressList.push(progressWithId);
        await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progressList));
        return id;
      }

      const docRef = await this.getProgressCollection().add(normalizedProgress);
      await this.getProgressCollection().doc(docRef.id).update({ id: docRef.id });
      return docRef.id;
    } catch (error) {
      console.error('[ExerciseProgressService] Error tracking exercise progress:', error);
      throw error;
    }
  }

  async getExerciseProgress(exerciseId: string, planId: string): Promise<ExerciseProgress[]> {
    try {
      await this.initialize();

      // Validate inputs
      if (!exerciseId || !planId) {
        console.warn('[ExerciseProgressService] Invalid input, exerciseId or planId is missing');
        return [];
      }
      
      // Get user ID safely
      let userId: string;
      try {
        userId = this.getCurrentUserId();
      } catch (error) {
        console.warn('[ExerciseProgressService] User not authenticated, returning empty progress');
        return [];
      }
      
      if (this.useLocalStorage) {
        const progressList = await this.getLocalProgress();
        return progressList.filter(
          p => p.exerciseId === exerciseId && p.planId === planId && p.userId === userId
        );
      }

      try {
        const snapshot = await this.getProgressCollection()
          .where('exerciseId', '==', exerciseId)
          .where('planId', '==', planId)
          .where('userId', '==', userId)
          .orderBy('date', 'desc')
          .get();
          
        return snapshot.docs.map((doc: any) => doc.data() as ExerciseProgress);
      } catch (firebaseError) {
        console.error('[ExerciseProgressService] Firebase query error:', firebaseError);
        return [];
      }
    } catch (error) {
      console.error('[ExerciseProgressService] Failed to get exercise progress:', error);
      return [];
    }
  }

  async updateExerciseProgress(progressId: string, updates: Partial<ExerciseProgress>): Promise<void> {
    await this.initialize();
    
    const userId = this.getCurrentUserId();
    
    if (this.useLocalStorage) {
      const progressList = await this.getLocalProgress();
      const index = progressList.findIndex(p => p.id === progressId && p.userId === userId);
      
      if (index === -1) {
        throw new Error('Exercise progress not found');
      }
      
      progressList[index] = { ...progressList[index], ...updates };
      await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progressList));
      return;
    }

    const doc = await this.getProgressCollection().doc(progressId).get();
    if (!doc.exists) {
      throw new Error('Exercise progress not found');
    }
    
    const data = doc.data();
    if (data.userId !== userId) {
      throw new Error('Not authorized to update this progress');
    }
    
    await this.getProgressCollection().doc(progressId).update(updates);
  }

  // Workout Completion CRUD operations
  async recordWorkoutCompletion(completion: Omit<WorkoutCompletion, 'id'>): Promise<string> {
    await this.initialize();
    
    const userId = this.getCurrentUserId();
    const newCompletion: WorkoutCompletion = {
      ...completion,
      userId,
    };

    if (this.useLocalStorage) {
      const completions = await this.getLocalCompletions();
      const id = `local-completion-${Date.now()}`;
      const completionWithId = { ...newCompletion, id };
      completions.push(completionWithId);
      await AsyncStorage.setItem(COMPLETION_STORAGE_KEY, JSON.stringify(completions));
      return id;
    }

    const docRef = await this.getCompletionCollection().add(newCompletion);
    await this.getCompletionCollection().doc(docRef.id).update({ id: docRef.id });
    return docRef.id;
  }

  async getWorkoutCompletions(planId: string): Promise<WorkoutCompletion[]> {
    await this.initialize();
    
    const userId = this.getCurrentUserId();
    
    if (this.useLocalStorage) {
      const completions = await this.getLocalCompletions();
      return completions.filter(c => c.planId === planId && c.userId === userId);
    }

    const snapshot = await this.getCompletionCollection()
      .where('planId', '==', planId)
      .where('userId', '==', userId)
      .orderBy('completedDate', 'desc')
      .get();
      
    return snapshot.docs.map((doc: any) => doc.data() as WorkoutCompletion);
  }

  async getWeeklyStats(startDate: Date, endDate: Date): Promise<{
    totalWorkouts: number;
    totalCalories: number;
    totalDuration: number;
    completionRate: number;
  }> {
    await this.initialize();
    
    const userId = this.getCurrentUserId();
    
    if (this.useLocalStorage) {
      const completions = await this.getLocalCompletions();
      const weekCompletions = completions.filter(c => {
        const date = new Date(c.completedDate);
        return c.userId === userId && 
               date >= startDate && 
               date <= endDate;
      });
      
      const totalWorkouts = weekCompletions.length;
      const totalCalories = weekCompletions.reduce((sum, c) => sum + c.caloriesBurned, 0);
      const totalDuration = weekCompletions.reduce((sum, c) => sum + c.duration, 0);
      const completionRate = weekCompletions.reduce((sum, c) => 
        sum + (c.completedExercises / c.totalExercises), 0) / (totalWorkouts || 1);
      
      return {
        totalWorkouts,
        totalCalories,
        totalDuration,
        completionRate: Math.round(completionRate * 100) / 100,
      };
    }

    const startTimestamp = firestore.Timestamp.fromDate(startDate);
    const endTimestamp = firestore.Timestamp.fromDate(endDate);
    
    const snapshot = await this.getCompletionCollection()
      .where('userId', '==', userId)
      .where('completedDate', '>=', startTimestamp)
      .where('completedDate', '<=', endTimestamp)
      .get();
      
    const completions = snapshot.docs.map((doc: any) => doc.data() as WorkoutCompletion);
    
    const totalWorkouts = completions.length;
    const totalCalories = completions.reduce((sum: number, c: WorkoutCompletion) => sum + c.caloriesBurned, 0);
    const totalDuration = completions.reduce((sum: number, c: WorkoutCompletion) => sum + c.duration, 0);
    const completionRate = completions.reduce((sum: number, c: WorkoutCompletion) => 
      sum + (c.completedExercises / c.totalExercises), 0) / (totalWorkouts || 1);
    
    return {
      totalWorkouts,
      totalCalories,
      totalDuration,
      completionRate: Math.round(completionRate * 100) / 100,
    };
  }

  async getDailyStats(date: Date): Promise<{
    workouts: WorkoutCompletion[];
    totalCalories: number;
    totalDuration: number;
  }> {
    await this.initialize();
    
    const userId = this.getCurrentUserId();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    if (this.useLocalStorage) {
      const completions = await this.getLocalCompletions();
      const dayCompletions = completions.filter(c => {
        const completionDate = new Date(c.completedDate);
        return c.userId === userId && 
               completionDate >= startOfDay && 
               completionDate <= endOfDay;
      });
      
      return {
        workouts: dayCompletions,
        totalCalories: dayCompletions.reduce((sum: number, c: WorkoutCompletion) => sum + c.caloriesBurned, 0),
        totalDuration: dayCompletions.reduce((sum: number, c: WorkoutCompletion) => sum + c.duration, 0),
      };
    }

    const startTimestamp = firestore.Timestamp.fromDate(startOfDay);
    const endTimestamp = firestore.Timestamp.fromDate(endOfDay);
    
    const snapshot = await this.getCompletionCollection()
      .where('userId', '==', userId)
      .where('completedDate', '>=', startTimestamp)
      .where('completedDate', '<=', endTimestamp)
      .get();
      
    const completions = snapshot.docs.map((doc: any) => doc.data() as WorkoutCompletion);
    
    return {
      workouts: completions,
      totalCalories: completions.reduce((sum: number, c: WorkoutCompletion) => sum + c.caloriesBurned, 0),
      totalDuration: completions.reduce((sum: number, c: WorkoutCompletion) => sum + c.duration, 0),
    };
  }
}

export const exerciseProgressService = ExerciseProgressService.getInstance(); 