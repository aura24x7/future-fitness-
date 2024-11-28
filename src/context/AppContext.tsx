import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserData {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  height: number;
  weight: number;
  goals: string[];
  dietaryPreferences: string[];
  workoutPreferences: string[];
}

export interface Workout {
  id: string;
  name: string;
  type: string;
  exercises: Exercise[];
  duration: number;
  caloriesBurned: number;
  date: Date;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  completed: boolean;
}

export interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: Date;
}

interface AppContextType {
  // User
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
  updateUserProfile: (updates: Partial<UserData>) => void;
  
  // Workouts
  workouts: Workout[];
  addWorkout: (workout: Workout) => void;
  updateWorkout: (id: string, updates: Partial<Workout>) => void;
  deleteWorkout: (id: string) => void;
  
  // Meals
  meals: Meal[];
  addMeal: (meal: Meal) => void;
  updateMeal: (id: string, updates: Partial<Meal>) => void;
  deleteMeal: (id: string) => void;
  
  // Progress
  getWeightProgress: () => { date: Date; weight: number }[];
  getCaloriesBurnedProgress: () => { date: Date; calories: number }[];
  
  // Stats
  getTotalWorkouts: () => number;
  getTotalCaloriesBurned: () => number;
  getDailyCaloriesConsumed: (date: Date) => number;
  
  // Loading State
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // User Management
  const updateUserProfile = (updates: Partial<UserData>) => {
    if (userData) {
      setUserData({ ...userData, ...updates });
      // TODO: Sync with backend
    }
  };

  // Workout Management
  const addWorkout = (workout: Workout) => {
    setWorkouts([...workouts, workout]);
    // TODO: Sync with backend
  };

  const updateWorkout = (id: string, updates: Partial<Workout>) => {
    setWorkouts(workouts.map(w => w.id === id ? { ...w, ...updates } : w));
    // TODO: Sync with backend
  };

  const deleteWorkout = (id: string) => {
    setWorkouts(workouts.filter(w => w.id !== id));
    // TODO: Sync with backend
  };

  // Meal Management
  const addMeal = (meal: Meal) => {
    setMeals([...meals, meal]);
    // TODO: Sync with backend
  };

  const updateMeal = (id: string, updates: Partial<Meal>) => {
    setMeals(meals.map(m => m.id === id ? { ...m, ...updates } : m));
    // TODO: Sync with backend
  };

  const deleteMeal = (id: string) => {
    setMeals(meals.filter(m => m.id !== id));
    // TODO: Sync with backend
  };

  // Progress Tracking
  const getWeightProgress = () => {
    // TODO: Implement actual weight progress tracking
    return [];
  };

  const getCaloriesBurnedProgress = () => {
    // TODO: Implement actual calories burned tracking
    return [];
  };

  // Stats Calculations
  const getTotalWorkouts = () => workouts.length;

  const getTotalCaloriesBurned = () => 
    workouts.reduce((total, workout) => total + workout.caloriesBurned, 0);

  const getDailyCaloriesConsumed = (date: Date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return meals
      .filter(meal => meal.date >= dayStart && meal.date <= dayEnd)
      .reduce((total, meal) => total + meal.calories, 0);
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // TODO: Load data from backend
        // const user = await api.getUserData();
        // const userWorkouts = await api.getWorkouts();
        // const userMeals = await api.getMeals();
        
        // setUserData(user);
        // setWorkouts(userWorkouts);
        // setMeals(userMeals);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  return (
    <AppContext.Provider
      value={{
        userData,
        setUserData,
        updateUserProfile,
        workouts,
        addWorkout,
        updateWorkout,
        deleteWorkout,
        meals,
        addMeal,
        updateMeal,
        deleteMeal,
        getWeightProgress,
        getCaloriesBurnedProgress,
        getTotalWorkouts,
        getTotalCaloriesBurned,
        getDailyCaloriesConsumed,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
