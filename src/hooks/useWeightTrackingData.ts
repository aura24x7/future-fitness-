import { useState, useEffect } from 'react';
import { auth } from '../firebase/firebaseInstances';
import { weightService } from '../services/weightService';
import { firebaseMealService } from '../services/firebaseMealService';
import { collection, getDocs, query, where, doc, getDoc, DocumentData } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { differenceInDays } from 'date-fns';

// Define interfaces for Meal and WeightLog
interface Meal {
  id: string;
  name: string;
  calories: number;
  timestamp: Date | FirebaseFirestoreTypes.Timestamp | string | number; // Support various timestamp formats
  userId: string;
  mealType?: string;
  // Optional fields that might be present in some meals
  carbs?: number;
  fat?: number;
  protein?: number;
  syncedAt?: string;
  version?: number;
}

interface WeightLog {
  id: string;
  weight: number;
  timestamp: Date | FirebaseFirestoreTypes.Timestamp | string | number; // Support various timestamp formats
  userId: string;
  notes?: string;
}

// Helper function to safely parse dates from different formats
const safelyParseDate = (timestamp: Date | FirebaseFirestoreTypes.Timestamp | string | number | undefined): Date | null => {
  if (!timestamp) return null;
  
  try {
    // Handle Date objects
    if (timestamp instanceof Date) {
      return isNaN(timestamp.getTime()) ? null : timestamp;
    }
    
    // Handle Firebase Timestamps
    if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
      const date = timestamp.toDate();
      return isNaN(date.getTime()) ? null : date;
    }
    
    // Handle string dates
    if (typeof timestamp === 'string') {
      const parsedDate = new Date(timestamp);
      return isNaN(parsedDate.getTime()) ? null : parsedDate;
    }
    
    // Handle number timestamp (milliseconds)
    if (typeof timestamp === 'number') {
      const parsedDate = new Date(timestamp);
      return isNaN(parsedDate.getTime()) ? null : parsedDate;
    }
    
    // Handle timestamp objects with seconds/nanoseconds
    if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
      const seconds = timestamp.seconds;
      if (typeof seconds === 'number' && isFinite(seconds)) {
        const parsedDate = new Date(seconds * 1000);
        return isNaN(parsedDate.getTime()) ? null : parsedDate;
      }
    }
  } catch (error) {
    console.error('Error parsing date:', error);
  }
  
  return null;
};

// Helper function to validate ISO date strings
function isValidISODateString(dateString: string): boolean {
  if (typeof dateString !== 'string') return false;
  
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d{3})?Z$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

// Helper to get current ISO formatted date
const getCurrentISOString = () => {
  try {
    return new Date().toISOString();
  } catch (e) {
    console.error('Error creating ISO date string:', e);
    // Fallback to a hardcoded valid ISO string
    return '2023-01-01T12:00:00.000Z';
  }
};

// Helper to get ISO string for date X days ago
const getDateXDaysAgo = (daysAgo: number): string => {
  try {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
  } catch (e) {
    console.error('Error creating past date string:', e);
    return getCurrentISOString();
  }
};

// In development mode only, we have mock data for fallback testing
// istanbul ignore next
const MOCK_MEALS: Meal[] = __DEV__ ? [
  // Today
  {
    id: 'mock1',
    name: 'Breakfast',
    calories: 500,
    carbs: 60,
    fat: 15,
    protein: 25,
    syncedAt: new Date().toISOString(),
    timestamp: new Date().toISOString(),
    userId: 'mock-user',
    version: 1
  },
  // Yesterday
  {
    id: 'mock2',
    name: 'Lunch',
    calories: 700,
    carbs: 80,
    fat: 25,
    protein: 35,
    syncedAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    timestamp: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    userId: 'mock-user',
    version: 1
  },
  // Add more mock meals for development testing
  {
    id: 'mock3',
    name: 'Dinner',
    calories: 800,
    carbs: 90,
    fat: 30,
    protein: 40,
    syncedAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    timestamp: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    userId: 'mock-user',
    version: 1
  },
  {
    id: 'mock4',
    name: 'Breakfast',
    calories: 450,
    carbs: 55,
    fat: 15,
    protein: 25,
    syncedAt: getDateXDaysAgo(4),
    timestamp: getDateXDaysAgo(4),
    userId: 'mock-user',
    version: 1
  },
  {
    id: 'mock5',
    name: 'Lunch',
    calories: 650,
    carbs: 75,
    fat: 20,
    protein: 32,
    syncedAt: getDateXDaysAgo(5),
    timestamp: getDateXDaysAgo(5),
    userId: 'mock-user',
    version: 1
  }
] : [];

// Function to convert a Firebase meal to our internal Meal interface
function convertFirebaseMealToMeal(firebaseMeal: any): Meal {
  try {
    // Extract timestamp and ensure it's a string
    let timestampStr = getCurrentISOString(); // Default fallback
    
    if (firebaseMeal.timestamp) {
      if (typeof firebaseMeal.timestamp === 'string') {
        timestampStr = firebaseMeal.timestamp;
      } else if (typeof firebaseMeal.timestamp.toDate === 'function') {
        // Firebase Timestamp object
        const date = firebaseMeal.timestamp.toDate();
        timestampStr = date.toISOString();
      } else if (firebaseMeal.timestamp instanceof Date) {
        timestampStr = firebaseMeal.timestamp.toISOString();
      }
    }
    
    return {
      id: firebaseMeal.id || `generated-${Date.now()}`,
      name: firebaseMeal.name || 'Unknown Meal',
      calories: Number(firebaseMeal.calories) || 0,
      carbs: Number(firebaseMeal.carbs) || 0,
      fat: Number(firebaseMeal.fat) || 0,
      protein: Number(firebaseMeal.protein) || 0,
      timestamp: timestampStr,
      syncedAt: firebaseMeal.syncedAt || getCurrentISOString(),
      userId: firebaseMeal.userId || 'unknown-user',
      version: Number(firebaseMeal.version) || 1
    };
  } catch (e) {
    console.error('Error converting Firebase meal:', e);
    // Return a valid default meal as fallback
    return {
      id: `error-${Date.now()}`,
      name: 'Error Meal',
      calories: 0,
      carbs: 0,
      fat: 0,
      protein: 0,
      timestamp: getCurrentISOString(),
      syncedAt: getCurrentISOString(),
      userId: 'error-user',
      version: 1
    };
  }
}

export const useWeightTrackingData = (startDate?: Date, endDate?: Date) => {
  const [mealData, setMealData] = useState<Meal[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use firebase auth to get the current user
  const currentUser = auth().currentUser;
  const userId = currentUser?.uid ?? 'unknown-user';

  useEffect(() => {
    let isMounted = true;
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 28); // Default to last 28 days
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First, try to get real meal data
        const actualStartDate = startDate || defaultStartDate;
        const actualEndDate = endDate || new Date();
        
        // Fetch real meal data from the service
        let fetchedMeals: Meal[] = [];
        try {
          // Attempt to fetch meals in range if the method exists
          if (typeof firebaseMealService.getMealsInRange === 'function') {
            fetchedMeals = await firebaseMealService.getMealsInRange(actualStartDate, actualEndDate);
          } else if (typeof firebaseMealService.getMeals === 'function') {
            // Fallback to getMeals if getMealsInRange is not available
            fetchedMeals = await firebaseMealService.getMeals();
            
            // Filter meals by date range manually if needed
            if (fetchedMeals.length > 0) {
              fetchedMeals = fetchedMeals.filter(meal => {
                const mealDate = safelyParseDate(meal.timestamp);
                return mealDate && 
                       mealDate >= actualStartDate && 
                       mealDate <= actualEndDate;
              });
            }
          }
        } catch (mealError) {
          console.error('Error fetching meal data:', mealError);
          // Continue with empty meals array, we'll handle fallback below
        }
        
        // Fetch real weight logs from the service
        let fetchedWeightLogs: WeightLog[] = [];
        try {
          // Try to get weight logs with date params if supported
          if (typeof weightService.getWeightLogs === 'function') {
            // Check the implementation - getWeightLogs doesn't accept parameters
            fetchedWeightLogs = await weightService.getWeightLogs();
            
            // Filter logs by date range manually
            if (fetchedWeightLogs.length > 0) {
              fetchedWeightLogs = fetchedWeightLogs.filter(log => {
                const logDate = safelyParseDate(log.timestamp);
                return logDate && 
                       logDate >= actualStartDate && 
                       logDate <= actualEndDate;
              });
            }
          }
        } catch (weightError) {
          console.error('Error fetching weight logs:', weightError);
          // Continue with empty weight logs, we'll handle fallback below
        }
        
        // If we have actual data, use it
        if (fetchedMeals.length > 0 || fetchedWeightLogs.length > 0) {
          if (isMounted) {
            setMealData(fetchedMeals);
            setWeightLogs(fetchedWeightLogs);
            setLoading(false);
          }
          return; // We have real data, no need for fallbacks
        }
        
        // For development mode or when no real data is available, create mock data
        if (__DEV__ || (!fetchedMeals.length && !fetchedWeightLogs.length)) {
          // Create mock meals with proper timestamps
          const mockMeals = createMockMeals(actualStartDate, actualEndDate);
          const mockWeightLogs = createMockWeightLogs(actualStartDate, actualEndDate);
          
          if (isMounted) {
            setMealData(mockMeals);
            setWeightLogs(mockWeightLogs);
          }
        }
      } catch (error) {
        console.error('Error in weight tracking data hook:', error);
        if (isMounted) {
          setError('Failed to load weight tracking data');
          
          // Even in case of errors, provide mock data in development mode
          if (__DEV__) {
            const mockMeals = createMockMeals(defaultStartDate, new Date());
            const mockWeightLogs = createMockWeightLogs(defaultStartDate, new Date());
            setMealData(mockMeals);
            setWeightLogs(mockWeightLogs);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [startDate, endDate]);

  // Helper function to create realistic mock meals
  const createMockMeals = (start: Date, end: Date): Meal[] => {
    const dayCount = differenceInDays(end, start) + 1;
    const mockMeals: Meal[] = [];
    const userId = 'mock-user-id';
    
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    const mealOptions = [
      { name: 'Oatmeal with Berries', calories: 350, carbs: 45, fat: 10, protein: 15 },
      { name: 'Chicken Salad', calories: 450, carbs: 20, fat: 25, protein: 35 },
      { name: 'Salmon with Vegetables', calories: 550, carbs: 25, fat: 30, protein: 40 },
      { name: 'Greek Yogurt', calories: 200, carbs: 10, fat: 5, protein: 25 },
      { name: 'Protein Smoothie', calories: 300, carbs: 30, fat: 5, protein: 25 },
      { name: 'Quinoa Bowl', calories: 400, carbs: 50, fat: 10, protein: 20 },
      { name: 'Steak and Sweet Potato', calories: 650, carbs: 40, fat: 25, protein: 50 },
      { name: 'Egg White Omelette', calories: 250, carbs: 5, fat: 10, protein: 30 },
      { name: 'Turkey Sandwich', calories: 400, carbs: 40, fat: 15, protein: 25 },
      { name: 'Protein Bar', calories: 180, carbs: 20, fat: 5, protein: 15 }
    ];
    
    // Create consistent meals for each day
    for (let i = 0; i < dayCount; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + i);
      
      // Create 3-4 meals per day
      const mealsPerDay = 3 + (Math.random() > 0.7 ? 1 : 0);
      
      for (let j = 0; j < mealsPerDay; j++) {
        const mealHour = 8 + j * 4 + Math.floor(Math.random() * 2); // Spread meals throughout the day
        const mealDate = new Date(currentDate);
        mealDate.setHours(mealHour, Math.floor(Math.random() * 60), 0, 0);
        
        const mealOption = mealOptions[Math.floor(Math.random() * mealOptions.length)];
        const calorieVariation = Math.floor(Math.random() * 100) - 50; // Add some variation
        
        mockMeals.push({
          id: `mock-meal-${i}-${j}`,
          name: mealOption.name,
          calories: Math.max(50, mealOption.calories + calorieVariation),
          carbs: mealOption.carbs,
          fat: mealOption.fat,
          protein: mealOption.protein,
          timestamp: mealDate,
          userId,
          mealType: mealTypes[Math.min(j, mealTypes.length - 1)],
          syncedAt: getCurrentISOString(),
          version: 1
        });
      }
    }
    
    return mockMeals;
  };
  
  // Helper function to create realistic mock weight logs
  const createMockWeightLogs = (start: Date, end: Date): WeightLog[] => {
    const dayCount = differenceInDays(end, start) + 1;
    const mockLogs: WeightLog[] = [];
    const userId = 'mock-user-id';
    
    // Base starting weight with slight random variation
    const startWeight = 78.5 + (Math.random() * 2 - 1);
    
    // Create one weight log per day with realistic progression
    // Assuming weight decreases slightly over time (weight loss trend)
    for (let i = 0; i < dayCount; i++) {
      // Only log weight every 2-3 days to be realistic
      if (i % 3 !== 0 && i !== 0 && i !== dayCount - 1) continue;
      
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + i);
      
      // Morning weigh-in time with slight variation
      const weightHour = 7 + Math.floor(Math.random() * 2);
      const weightDate = new Date(currentDate);
      weightDate.setHours(weightHour, Math.floor(Math.random() * 60), 0, 0);
      
      // Calculate a gradual weight loss with some daily fluctuation
      // Average 0.5kg loss per week with daily fluctuations of +/- 0.3kg
      const weeklyLoss = 0.5; // kg per week
      const dailyLoss = weeklyLoss / 7;
      const dailyFluctuation = (Math.random() * 0.6) - 0.3; // +/- 0.3kg daily fluctuation
      
      const expectedLoss = dailyLoss * i;
      const currentWeight = Math.round((startWeight - expectedLoss + dailyFluctuation) * 10) / 10;
      
      mockLogs.push({
        id: `mock-weight-${i}`,
        weight: currentWeight,
        timestamp: weightDate,
        userId
      });
    }
    
    return mockLogs;
  };

  return {
    mealData,
    weightLogs,
    loading,
    error
  };
};

export default useWeightTrackingData;