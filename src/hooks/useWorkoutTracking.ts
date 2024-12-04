import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exercise, Workout } from '../types/workout';

const WORKOUTS_STORAGE_KEY = '@workouts';

export const useWorkoutTracking = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  // Load workouts from storage
  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const storedWorkouts = await AsyncStorage.getItem(WORKOUTS_STORAGE_KEY);
      if (storedWorkouts) {
        setWorkouts(JSON.parse(storedWorkouts));
      }
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveWorkouts = async (updatedWorkouts: Workout[]) => {
    try {
      await AsyncStorage.setItem(WORKOUTS_STORAGE_KEY, JSON.stringify(updatedWorkouts));
    } catch (error) {
      console.error('Error saving workouts:', error);
    }
  };

  const addWorkout = useCallback(async (workout: Workout) => {
    const updatedWorkouts = [...workouts, workout];
    setWorkouts(updatedWorkouts);
    await saveWorkouts(updatedWorkouts);
  }, [workouts]);

  const updateWorkout = useCallback(async (updatedWorkout: Workout) => {
    const updatedWorkouts = workouts.map(workout => 
      workout.id === updatedWorkout.id ? updatedWorkout : workout
    );
    setWorkouts(updatedWorkouts);
    await saveWorkouts(updatedWorkouts);
  }, [workouts]);

  const deleteWorkout = useCallback(async (workoutId: string) => {
    const updatedWorkouts = workouts.filter(workout => workout.id !== workoutId);
    setWorkouts(updatedWorkouts);
    await saveWorkouts(updatedWorkouts);
  }, [workouts]);

  const completeExercise = useCallback(async (workoutId: string, exerciseId: string) => {
    const updatedWorkouts = workouts.map(workout => {
      if (workout.id === workoutId) {
        const updatedExercises = workout.exercises.map(exercise => 
          exercise.id === exerciseId 
            ? { ...exercise, completed: !exercise.completed }
            : exercise
        );
        return { ...workout, exercises: updatedExercises };
      }
      return workout;
    });
    setWorkouts(updatedWorkouts);
    await saveWorkouts(updatedWorkouts);
  }, [workouts]);

  return {
    workouts,
    loading,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    completeExercise,
  };
};
