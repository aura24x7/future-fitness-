import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { WorkoutPlan, DayPlan, Exercise, WorkoutValidationResult } from '../types/workout';
import { workoutPlanService } from '../services/workoutPlanService';
import { WorkoutService as AIWorkoutService } from '../services/ai/features/workout.service';
import { WorkoutPreferences } from '../services/ai/features/workout.service';
import * as AIWorkoutTypes from '../services/ai/features/workout.service';
import { onAuthStateChanged, initializeFirebase, getFirebaseAuth } from '../services/firebase/firebaseInit';

// Initialize auth
let auth: any = null;

// Helper function to initialize auth safely
const initAuth = async () => {
  try {
    await initializeFirebase();
    auth = getFirebaseAuth();
    return true;
  } catch (error) {
    console.error('[WorkoutContext] Failed to initialize auth:', error);
    return false;
  }
};

interface WorkoutContextType {
  workoutPlans: WorkoutPlan[];
  sharedPlans: WorkoutPlan[];
  currentPlan: WorkoutPlan | null;
  isLoading: boolean;
  error: string | null;
  fetchWorkoutPlans: () => Promise<void>;
  getWorkoutPlansForDay: (dayName: string) => Promise<WorkoutPlan[]>;
  getTodayWorkoutPlans: () => Promise<WorkoutPlan[]>;
  setCurrentPlan: (plan: WorkoutPlan | null) => void;
  createWorkoutPlan: (plan: Omit<WorkoutPlan, 'id' | 'ownerId' | 'createdAt'>) => Promise<string>;
  updateWorkoutPlan: (planId: string, updates: Partial<WorkoutPlan>) => Promise<void>;
  deleteWorkoutPlan: (planId: string) => Promise<void>;
  shareWorkoutPlan: (planId: string, targetUserId: string) => Promise<void>;
  validateWorkoutPlan: (plan: Partial<WorkoutPlan>) => WorkoutValidationResult;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const useWorkout = (): WorkoutContextType => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};

// Helper function to convert AI WorkoutPlan to app WorkoutPlan
const convertAIWorkoutPlanToAppWorkoutPlan = (aiPlan: AIWorkoutTypes.WorkoutPlan): WorkoutPlan => {
  // Create exercises for a single day
  const exercises: Exercise[] = aiPlan.exercises.map(aiExercise => ({
    exerciseName: aiExercise.name,
    sets: aiExercise.sets,
    reps: parseInt(aiExercise.reps) || 10, // Convert string reps to number
    instructions: aiExercise.instructions,
    caloriesBurned: aiExercise.calories,
    workoutDuration: aiExercise.duration,
    intensityLevel: aiExercise.difficulty.toLowerCase() as 'low' | 'medium' | 'high'
  }));

  // Create a day plan with all exercises
  const dayPlan: DayPlan = {
    dayName: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    isRestDay: false,
    exercises
  };

  // Return workout plan with required fields
  return {
    id: `wp-${Date.now()}`, // Generate a unique ID
    ownerId: 'current-user', // This should be replaced with the actual user ID
    createdAt: new Date(),
    days: [dayPlan],
    name: `Workout Plan - ${new Date().toLocaleDateString()}`,
    description: `Generated workout targeting: ${aiPlan.targetMuscleGroups.join(', ')}`,
    lastModified: new Date()
  };
};

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [sharedPlans, setSharedPlans] = useState<WorkoutPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);

  // Initialize auth when the component mounts
  useEffect(() => {
    const initialize = async () => {
      const success = await initAuth();
      setAuthInitialized(success);
    };
    
    initialize();
  }, []);

  // Fetch all workout plans for the user
  const fetchWorkoutPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let isAuthenticated = false;
      try {
        // Make sure auth is initialized
        if (!auth && authInitialized) {
          auth = getFirebaseAuth();
        }
        
        isAuthenticated = auth?.currentUser != null;
      } catch (authError) {
        console.warn('[WorkoutContext] Auth not available, using local storage fallback:', authError);
      }

      if (!isAuthenticated) {
        console.log('[WorkoutContext] User not authenticated, using fallback storage');
      }

      // Get user's workout plans
      const userPlans = await workoutPlanService.getUserWorkoutPlans();
      setWorkoutPlans(userPlans);

      // Get shared workout plans
      const shared = await workoutPlanService.getSharedWorkoutPlans();
      setSharedPlans(shared);

      setIsLoading(false);
    } catch (err: any) {
      console.error('[WorkoutContext] Error fetching workout plans:', err);
      setError('Failed to load workout plans');
      setIsLoading(false);
    }
  }, [authInitialized]);

  // Load workout plans on mount
  useEffect(() => {
    if (authInitialized) {
      fetchWorkoutPlans();
    }
  }, [fetchWorkoutPlans, authInitialized]);

  // Check for authenticated user and sync data when auth state changes
  useEffect(() => {
    if (!authInitialized) return () => {};
    
    const unsubscribe = onAuthStateChanged(async (user) => {
      if (user) {
        console.log('[WorkoutContext] User authenticated, syncing workout plans...');
        try {
          // Trigger a sync of local plans to Firebase
          await workoutPlanService.syncLocalPlansToFirebase();
          // Fetch updated workout plans
          await fetchWorkoutPlans();
        } catch (error) {
          console.error('[WorkoutContext] Error syncing workout plans after auth:', error);
        }
      } else {
        console.log('[WorkoutContext] User not authenticated');
      }
    });
    
    return () => unsubscribe();
  }, [fetchWorkoutPlans, authInitialized]);

  // Get workout plans for a specific day
  const getWorkoutPlansForDay = useCallback(async (dayName: string): Promise<WorkoutPlan[]> => {
    try {
      let isAuthenticated = false;
      try {
        if (!auth && authInitialized) {
          auth = getFirebaseAuth();
        }
        
        isAuthenticated = auth?.currentUser != null;
      } catch (authError) {
        console.warn('[WorkoutContext] Auth not available for getWorkoutPlansForDay, using local storage:', authError);
      }

      if (!isAuthenticated) {
        console.log(`[WorkoutContext] User not authenticated for getWorkoutPlansForDay(${dayName}), using fallback storage`);
      }

      return await workoutPlanService.getWorkoutPlansForDay(dayName);
    } catch (err: any) {
      console.error(`[WorkoutContext] Error fetching workout plans for ${dayName}:`, err);
      setError(`Failed to load workout plans for ${dayName}`);
      return [];
    }
  }, [authInitialized]);

  // Get workout plans for today
  const getTodayWorkoutPlans = useCallback(async (): Promise<WorkoutPlan[]> => {
    try {
      let isAuthenticated = false;
      try {
        if (!auth && authInitialized) {
          auth = getFirebaseAuth();
        }
        
        isAuthenticated = auth?.currentUser != null;
      } catch (authError) {
        console.warn('[WorkoutContext] Auth not available for getTodayWorkoutPlans, using local storage:', authError);
      }

      if (!isAuthenticated) {
        console.log('[WorkoutContext] User not authenticated for getTodayWorkoutPlans, using fallback storage');
      }

      return await workoutPlanService.getTodayWorkoutPlans();
    } catch (err: any) {
      console.error('[WorkoutContext] Error fetching today\'s workout plans:', err);
      setError('Failed to load today\'s workout plans');
      return [];
    }
  }, [authInitialized]);

  // Create a new workout plan
  const createWorkoutPlan = async (plan: Omit<WorkoutPlan, 'id' | 'ownerId' | 'createdAt'>): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);
      
      let isAuthenticated = false;
      try {
        if (!auth && authInitialized) {
          auth = getFirebaseAuth();
        }
        
        isAuthenticated = auth?.currentUser != null;
      } catch (authError) {
        console.warn('[WorkoutContext] Auth not available for createWorkoutPlan, using local storage:', authError);
      }

      if (!isAuthenticated) {
        console.log('[WorkoutContext] User not authenticated for createWorkoutPlan, using fallback storage');
      }
      
      const planId = await workoutPlanService.createWorkoutPlan(plan);
      await fetchWorkoutPlans();
      
      return planId;
    } catch (err: any) {
      console.error('[WorkoutContext] Error creating workout plan:', err);
      setError('Failed to create workout plan');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing workout plan
  const updateWorkoutPlan = async (planId: string, updates: Partial<WorkoutPlan>): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      let isAuthenticated = false;
      try {
        if (!auth && authInitialized) {
          auth = getFirebaseAuth();
        }
        
        isAuthenticated = auth?.currentUser != null;
      } catch (authError) {
        console.warn('[WorkoutContext] Auth not available for updateWorkoutPlan, using local storage:', authError);
      }

      if (!isAuthenticated) {
        console.log('[WorkoutContext] User not authenticated for updateWorkoutPlan, using fallback storage');
      }
      
      await workoutPlanService.updateWorkoutPlan(planId, updates);
      await fetchWorkoutPlans();
      
      // If the current plan is being updated, refresh it
      if (currentPlan && currentPlan.id === planId) {
        const updatedPlan = await workoutPlanService.getWorkoutPlan(planId);
        setCurrentPlan(updatedPlan);
      }
    } catch (err: any) {
      console.error('[WorkoutContext] Error updating workout plan:', err);
      setError('Failed to update workout plan');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a workout plan
  const deleteWorkoutPlan = async (planId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      let isAuthenticated = false;
      try {
        if (!auth && authInitialized) {
          auth = getFirebaseAuth();
        }
        
        isAuthenticated = auth?.currentUser != null;
      } catch (authError) {
        console.warn('[WorkoutContext] Auth not available for deleteWorkoutPlan, using local storage:', authError);
      }

      if (!isAuthenticated) {
        console.log('[WorkoutContext] User not authenticated for deleteWorkoutPlan, using fallback storage');
      }
      
      await workoutPlanService.deleteWorkoutPlan(planId);
      
      // If the current plan is being deleted, set it to null
      if (currentPlan && currentPlan.id === planId) {
        setCurrentPlan(null);
      }
      
      // Refresh the workout plans
      await fetchWorkoutPlans();
    } catch (err: any) {
      console.error('[WorkoutContext] Error deleting workout plan:', err);
      setError('Failed to delete workout plan');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Share a workout plan with another user
  const shareWorkoutPlan = async (planId: string, targetUserId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      let isAuthenticated = false;
      try {
        if (!auth && authInitialized) {
          auth = getFirebaseAuth();
        }
        
        isAuthenticated = auth?.currentUser != null;
      } catch (authError) {
        console.warn('[WorkoutContext] Auth not available for shareWorkoutPlan, using local storage:', authError);
      }

      if (!isAuthenticated) {
        console.log('[WorkoutContext] User not authenticated for shareWorkoutPlan, using fallback storage');
      }
      
      await workoutPlanService.shareWorkoutPlan(planId, targetUserId);
      await fetchWorkoutPlans();
    } catch (err: any) {
      console.error('[WorkoutContext] Error sharing workout plan:', err);
      setError('Failed to share workout plan');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Validate a workout plan
  const validateWorkoutPlan = (plan: Partial<WorkoutPlan>): WorkoutValidationResult => {
    const errors = [];
    
    // Basic validation rules
    if (!plan.name || plan.name.trim() === '') {
      errors.push({ field: 'name', message: 'Plan name is required' });
    }
    
    if (!plan.days || plan.days.length === 0) {
      errors.push({ field: 'days', message: 'At least one day must be configured' });
    } else {
      // Check if non-rest days have exercises
      plan.days.forEach((day, index) => {
        if (!day.isRestDay && (!day.exercises || day.exercises.length === 0)) {
          errors.push({ 
            field: `days[${index}].exercises`, 
            message: `${day.dayName} is not a rest day but has no exercises` 
          });
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const value = {
    workoutPlans,
    sharedPlans,
    currentPlan,
    isLoading,
    error,
    fetchWorkoutPlans,
    getWorkoutPlansForDay,
    getTodayWorkoutPlans,
    setCurrentPlan,
    createWorkoutPlan,
    updateWorkoutPlan,
    deleteWorkoutPlan,
    shareWorkoutPlan,
    validateWorkoutPlan,
  };

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
}; 