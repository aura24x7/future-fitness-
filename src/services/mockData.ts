import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutLog } from '../types/workout';

// Mock user data
export const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
};

// Storage keys
const STORAGE_KEYS = {
  USER: 'user',
  MEALS: 'meals',
  WATER: 'water',
  WORKOUTS: 'workouts',
};

// Mock authentication
export const mockAuth = {
  login: async (email: string, password: string) => {
    if (email && password) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
      return mockUser;
    }
    throw new Error('Invalid credentials');
  },

  register: async (name: string, email: string, password: string) => {
    if (name && email && password) {
      const newUser = { ...mockUser, name, email };
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      return newUser;
    }
    throw new Error('Invalid registration data');
  },

  logout: async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  },

  getCurrentUser: async () => {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  },
};

// Mock meal tracking
export const mockMealService = {
  analyzeMeal: async (description: string) => {
    // Mock meal analysis
    return {
      calories: Math.floor(Math.random() * 500) + 200,
      protein: Math.floor(Math.random() * 30) + 10,
      carbs: Math.floor(Math.random() * 50) + 20,
      fat: Math.floor(Math.random() * 20) + 5,
    };
  },

  trackMeal: async (mealData: any) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const existingMealsStr = await AsyncStorage.getItem(STORAGE_KEYS.MEALS);
      const meals = existingMealsStr ? JSON.parse(existingMealsStr) : {};
      
      if (!meals[today]) {
        meals[today] = [];
      }
      
      const newMeal = {
        ...mealData,
        timestamp: new Date().toISOString(),
      };
      
      meals[today].push(newMeal);
      await AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
      return newMeal;
    } catch (error) {
      console.error('Error tracking meal:', error);
      throw new Error('Failed to track meal');
    }
  },

  updateMeal: async (mealData: any) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const existingMealsStr = await AsyncStorage.getItem(STORAGE_KEYS.MEALS);
      const meals = existingMealsStr ? JSON.parse(existingMealsStr) : {};
      
      if (!meals[today]) {
        throw new Error('No meals found for today');
      }
      
      const mealIndex = meals[today].findIndex((meal: any) => meal.id === mealData.id);
      if (mealIndex === -1) {
        throw new Error('Meal not found');
      }
      
      meals[today][mealIndex] = {
        ...mealData,
        timestamp: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
      return meals[today][mealIndex];
    } catch (error) {
      console.error('Error updating meal:', error);
      throw new Error('Failed to update meal');
    }
  },

  getTodayMeals: async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const mealsStr = await AsyncStorage.getItem(STORAGE_KEYS.MEALS);
      const meals = mealsStr ? JSON.parse(mealsStr) : {};
      return meals[today] || [];
    } catch (error) {
      console.error('Error getting meals:', error);
      return [];
    }
  },

  deleteMeal: async (mealId: string) => {
    const mealsJson = await AsyncStorage.getItem(STORAGE_KEYS.MEALS);
    let meals = mealsJson ? JSON.parse(mealsJson) : {};
    
    // Remove the meal with the specified ID
    for (const date in meals) {
      meals[date] = meals[date].filter((meal: any) => meal.id !== mealId);
    }
    
    // Save the updated meals back to AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
    
    return meals;
  },
};

// Mock water tracking
export const mockWaterService = {
  trackWater: async (amount: number) => {
    const today = new Date().toISOString().split('T')[0];
    const existingWater = await AsyncStorage.getItem(STORAGE_KEYS.WATER) || '{}';
    const water = JSON.parse(existingWater);
    
    water[today] = (water[today] || 0) + amount;
    await AsyncStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(water));
    return water[today];
  },

  getTodayWater: async () => {
    const today = new Date().toISOString().split('T')[0];
    const water = await AsyncStorage.getItem(STORAGE_KEYS.WATER) || '{}';
    const parsedWater = JSON.parse(water);
    return parsedWater[today] || 0;
  },
};

// Mock workout service
export const mockWorkoutService = {
  getTodayWorkouts: async (): Promise<WorkoutLog[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return [
      {
        id: '1',
        name: 'Morning Strength Training',
        exercises: [
          { id: '1-1', name: 'Bench Press', sets: 3, reps: 10, weight: 135, completed: false },
          { id: '1-2', name: 'Squats', sets: 3, reps: 12, weight: 185, completed: false },
          { id: '1-3', name: 'Pull-ups', sets: 3, reps: 8, weight: 0, completed: false },
        ],
        duration: 45,
        calories: 320,
        baseCalories: 320,
        timestamp: new Date().setHours(8, 30),
        type: 'strength',
        date: new Date().toISOString().split('T')[0],
        completed: false,
        completedExercises: 0,
        totalExercises: 3
      },
      {
        id: '2',
        name: 'Evening Cardio',
        exercises: [
          { id: '2-1', name: 'Treadmill Run', sets: 1, reps: 1, weight: 0, completed: false },
          { id: '2-2', name: 'Jump Rope', sets: 3, reps: 100, weight: 0, completed: false },
        ],
        duration: 30,
        calories: 250,
        baseCalories: 250,
        timestamp: new Date().setHours(18, 0),
        type: 'cardio',
        date: new Date().toISOString().split('T')[0],
        completed: false,
        completedExercises: 0,
        totalExercises: 2
      },
    ];
  },

  deleteWorkout: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  },

  updateWorkoutExercise: async (workoutId: string, exerciseId: string, completed: boolean) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  },
};
