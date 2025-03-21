import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorageKeyForDate, isSameDay, getStartOfDay, MEALS_STORAGE_KEY } from '../utils/dateUtils';
import { debounce } from '../utils/debounce';
import {
  MacroNutrients,
  UserNutritionGoals,
  NutritionProgress,
  isValidNutritionGoals,
  calculateNutritionProgress
} from '../types/calorie';
import { useCalorieTracking } from '../hooks/useCalorieTracking';
import EventEmitter from '../utils/EventEmitter';

const CALORIE_TOTALS_KEY = '@calorie_totals';
const NUTRITION_GOALS_KEY = '@nutrition_goals';

// Default nutrition goals
const DEFAULT_NUTRITION_GOALS: UserNutritionGoals = {
  dailyCalories: 0,
  macros: {
    protein: { value: 0, unit: 'g' },
    carbs: { value: 0, unit: 'g' },
    fat: { value: 0, unit: 'g' }
  }
};

// Version key for data migration
const DATA_VERSION_KEY = '@meal_data_version';
const CURRENT_DATA_VERSION = '1.0.0';

export interface Macros {
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealDetails {
  id?: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  completed: boolean;
  mealType: string;
  ingredients?: string[];
}

interface MealContextType {
  meals: { [key: string]: MealDetails[] };
  totalCalories: number;
  totalMacros: Macros;
  nutritionGoals: UserNutritionGoals;
  nutritionProgress: NutritionProgress;
  isLoadingGoals: boolean;
  updateMeals: (newMeals: { [key: string]: MealDetails[] }) => void;
  addMeal: (meal: MealDetails) => void;
  completeMeal: (mealId: string, completed: boolean) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  updateTotalCalories: (calories: number) => void;
  updateTotalMacros: (macros: Macros) => void;
  updateNutritionGoals: (goals: UserNutritionGoals) => Promise<void>;
}

const MealContext = createContext<MealContextType | undefined>(undefined);

export const MealProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [meals, setMeals] = useState<{ [key: string]: MealDetails[] }>({});
  const [selectedDate, setSelectedDate] = useState<Date>(getStartOfDay(new Date()));
  const [totalCalories, setTotalCalories] = useState<number>(0);
  const [totalMacros, setTotalMacros] = useState<Macros>({
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  
  // Add useCalorieTracking hook at the component level
  const { calorieData, isLoading: isCalorieDataLoading, isInitialized: isCalorieDataInitialized } = useCalorieTracking();
  
  // New state for nutrition goals
  const [nutritionGoals, setNutritionGoals] = useState<UserNutritionGoals>(DEFAULT_NUTRITION_GOALS);
  const [nutritionProgress, setNutritionProgress] = useState<NutritionProgress>({
    calories: { consumed: 0, target: DEFAULT_NUTRITION_GOALS.dailyCalories, percentage: 0, exceeded: false },
    macros: {
      protein: { current: 0, target: DEFAULT_NUTRITION_GOALS.macros.protein.value, percentage: 0, exceeded: false },
      carbs: { current: 0, target: DEFAULT_NUTRITION_GOALS.macros.carbs.value, percentage: 0, exceeded: false },
      fat: { current: 0, target: DEFAULT_NUTRITION_GOALS.macros.fat.value, percentage: 0, exceeded: false }
    }
  });
  const [isLoadingGoals, setIsLoadingGoals] = useState(true);

  // Update nutrition goals when calorie data changes
  useEffect(() => {
    const updateNutritionGoalsFromCalorieData = async () => {
      if (isCalorieDataInitialized && calorieData.targetCalories > 0) {
        const newGoals: UserNutritionGoals = {
          dailyCalories: calorieData.targetCalories,
          macros: {
            protein: { value: Math.round((calorieData.targetCalories * 0.30) / 4), unit: 'g' },
            carbs: { value: Math.round((calorieData.targetCalories * 0.45) / 4), unit: 'g' },
            fat: { value: Math.round((calorieData.targetCalories * 0.25) / 9), unit: 'g' }
          },
          lastUpdated: new Date()
        };
        
        try {
          await AsyncStorage.setItem(NUTRITION_GOALS_KEY, JSON.stringify(newGoals));
          setNutritionGoals(newGoals);
          setIsLoadingGoals(false);
        } catch (error) {
          console.error('Error updating nutrition goals:', error);
        }
      }
    };

    updateNutritionGoalsFromCalorieData();
  }, [calorieData.targetCalories, isCalorieDataInitialized]);

  // Migration helper functions
  const migrateNutritionGoals = useCallback(async (oldData: any): Promise<UserNutritionGoals> => {
    // If we have calorie data and it's initialized, use that
    if (isCalorieDataInitialized && calorieData.targetCalories > 0) {
      return {
        dailyCalories: calorieData.targetCalories,
        macros: {
          protein: { value: Math.round((calorieData.targetCalories * 0.30) / 4), unit: 'g' },
          carbs: { value: Math.round((calorieData.targetCalories * 0.45) / 4), unit: 'g' },
          fat: { value: Math.round((calorieData.targetCalories * 0.25) / 9), unit: 'g' }
        },
        lastUpdated: new Date()
      };
    }

    // If no old data exists, return default goals
    if (!oldData) return DEFAULT_NUTRITION_GOALS;

    try {
      // Handle old calorie goals format
      if (oldData.daily && typeof oldData.daily === 'number') {
        return {
          dailyCalories: oldData.daily,
          macros: {
            protein: { value: Math.round(oldData.daily * 0.3 / 4), unit: 'g' },
            carbs: { value: Math.round(oldData.daily * 0.45 / 4), unit: 'g' },
            fat: { value: Math.round(oldData.daily * 0.25 / 9), unit: 'g' }
          },
          lastUpdated: new Date()
        };
      }

      // Handle old macro format
      if (oldData.macros) {
        const { protein, carbs, fat } = oldData.macros;
        return {
          dailyCalories: oldData.dailyCalories || DEFAULT_NUTRITION_GOALS.dailyCalories,
          macros: {
            protein: { value: protein || DEFAULT_NUTRITION_GOALS.macros.protein.value, unit: 'g' },
            carbs: { value: carbs || DEFAULT_NUTRITION_GOALS.macros.carbs.value, unit: 'g' },
            fat: { value: fat || DEFAULT_NUTRITION_GOALS.macros.fat.value, unit: 'g' }
          },
          lastUpdated: new Date()
        };
      }

      return DEFAULT_NUTRITION_GOALS;
    } catch (error) {
      console.error('Error migrating nutrition goals:', error);
      return DEFAULT_NUTRITION_GOALS;
    }
  }, [calorieData.targetCalories, isCalorieDataInitialized]);

  // Data migration check
  useEffect(() => {
    const checkAndMigrateData = async () => {
      try {
        const dataVersion = await AsyncStorage.getItem(DATA_VERSION_KEY);
        
        // If no version exists or version is old, perform migration
        if (!dataVersion || dataVersion !== CURRENT_DATA_VERSION) {
          setIsLoadingGoals(true);
          
          // Load old nutrition goals data
          const oldGoalsData = await AsyncStorage.getItem(NUTRITION_GOALS_KEY);
          let oldGoals = null;
          try {
            oldGoals = oldGoalsData ? JSON.parse(oldGoalsData) : null;
          } catch (e) {
            console.warn('Error parsing old goals data:', e);
          }

          // Migrate goals
          const migratedGoals = await migrateNutritionGoals(oldGoals);
          
          // Save migrated data
          await AsyncStorage.setItem(NUTRITION_GOALS_KEY, JSON.stringify(migratedGoals));
          setNutritionGoals(migratedGoals);
          
          // Update version
          await AsyncStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
          
          setIsLoadingGoals(false);
        }
      } catch (error) {
        console.error('Error in data migration:', error);
        setIsLoadingGoals(false);
      }
    };

    checkAndMigrateData();
  }, []);

  // Update nutrition progress whenever totals or goals change
  useEffect(() => {
    if (!isLoadingGoals && isCalorieDataInitialized) {
      const progress = calculateNutritionProgress(
        { calories: totalCalories, macros: totalMacros },
        nutritionGoals
      );
      setNutritionProgress(progress);
    }
  }, [totalCalories, totalMacros, nutritionGoals, isLoadingGoals, isCalorieDataInitialized]);

  // Save nutrition goals
  const updateNutritionGoals = useCallback(async (goals: UserNutritionGoals) => {
    try {
      if (!isValidNutritionGoals(goals)) {
        throw new Error('Invalid nutrition goals');
      }
      await AsyncStorage.setItem(NUTRITION_GOALS_KEY, JSON.stringify(goals));
      setNutritionGoals(goals);
    } catch (error) {
      console.error('Error saving nutrition goals:', error);
      throw error;
    }
  }, []);

  const calculateTotals = useCallback((mealsToCalculate: { [key: string]: MealDetails[] }) => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    // Calculate totals from completed meals
    Object.values(mealsToCalculate).flat().forEach((meal: MealDetails) => {
      if (meal.completed) {
        calories += meal.calories || 0;
        protein += meal.protein || 0;
        carbs += meal.carbs || 0;
        fat += meal.fat || 0;
      }
    });

    return {
      calories,
      macros: {
        protein,
        carbs,
        fat
      }
    };
  }, []);

  // Load saved totals
  useEffect(() => {
    const loadSavedTotals = async () => {
      try {
        const savedTotalsString = await AsyncStorage.getItem(CALORIE_TOTALS_KEY);
        if (savedTotalsString) {
          const savedTotals = JSON.parse(savedTotalsString);
          setTotalCalories(savedTotals.calories || 0);
          setTotalMacros(savedTotals.macros || { protein: 0, carbs: 0, fat: 0 });
        }
      } catch (error) {
        console.error('Error loading saved totals:', error);
      }
    };

    loadSavedTotals();
  }, []);

  // Load meals
  useEffect(() => {
    const loadMeals = async () => {
      try {
        const savedMealsString = await AsyncStorage.getItem(MEALS_STORAGE_KEY);
        if (savedMealsString) {
          const savedMeals = JSON.parse(savedMealsString);
          setMeals(savedMeals);

          // Calculate totals for today's meals
          const todayKey = getStorageKeyForDate(new Date());
          const todayMeals = savedMeals[todayKey] || [];
          const { calories, macros } = calculateTotals({ [todayKey]: todayMeals });
          setTotalCalories(calories);
          setTotalMacros(macros);
        }
      } catch (error) {
        console.error('Error loading meals:', error);
      }
    };

    loadMeals();
  }, [calculateTotals]);

  // Save meals to storage
  const saveMealsToStorage = useCallback(async (mealsToSave: { [key: string]: MealDetails[] }) => {
    try {
      await AsyncStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(mealsToSave));
    } catch (error) {
      console.error('Error saving meals:', error);
    }
  }, []);

  // Debounced save function
  const debouncedSaveMeals = useCallback(
    debounce((mealsToSave: { [key: string]: MealDetails[] }) => {
      saveMealsToStorage(mealsToSave);
    }, 1000),
    []
  );

  // Update meals
  const updateMeals = useCallback((newMeals: { [key: string]: MealDetails[] }) => {
    setMeals(newMeals);
    debouncedSaveMeals(newMeals);

    // Recalculate totals for today
    const todayKey = getStorageKeyForDate(new Date());
    const todayMeals = newMeals[todayKey] || [];
    const { calories, macros } = calculateTotals({ [todayKey]: todayMeals });
    setTotalCalories(calories);
    setTotalMacros(macros);
  }, [calculateTotals, debouncedSaveMeals]);

  // Add meal
  const addMeal = useCallback(async (meal: MealDetails) => {
    try {
      const dateKey = getStorageKeyForDate(selectedDate);
      const updatedMeals = {
        ...meals,
        [dateKey]: [...(meals[dateKey] || []), meal]
      };
      
      // Update state immediately
      setMeals(updatedMeals);
      
      // Calculate and update totals immediately
      const newTotals = calculateTotals(updatedMeals);
      setTotalCalories(newTotals.calories);
      setTotalMacros({
        protein: newTotals.macros.protein,
        carbs: newTotals.macros.carbs,
        fat: newTotals.macros.fat
      });

      // Persist to storage
      await AsyncStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(updatedMeals));
      
      // Emit update event for other components
      EventEmitter.emit('meals_updated', updatedMeals);
    } catch (error) {
      console.error('Error adding meal:', error);
      throw error;
    }
  }, [meals, selectedDate, calculateTotals]);

  // Add effect to reload meals when date changes
  useEffect(() => {
    const loadMealsForDate = async () => {
      try {
        const savedMeals = await AsyncStorage.getItem(MEALS_STORAGE_KEY);
        if (savedMeals) {
          const parsedMeals = JSON.parse(savedMeals);
          setMeals(parsedMeals);
          
          // Recalculate totals for the selected date
          const dateKey = getStorageKeyForDate(selectedDate);
          const mealsForDate = { [dateKey]: parsedMeals[dateKey] || [] };
          const newTotals = calculateTotals(mealsForDate);
          setTotalCalories(newTotals.calories);
          setTotalMacros({
            protein: newTotals.macros.protein,
            carbs: newTotals.macros.carbs,
            fat: newTotals.macros.fat
          });
        }
      } catch (error) {
        console.error('Error loading meals for date:', error);
      }
    };

    loadMealsForDate();
  }, [selectedDate]);

  // Add effect to handle meal deletion events
  useEffect(() => {
    const handleMealDeleted = async (mealId: string) => {
      try {
        console.log('[MealContext] Received meal deleted event:', mealId);
        
        // Step 1: Update meals state
        setMeals(prevMeals => {
          const updatedMeals = { ...prevMeals };
          
          // Find and remove the meal from all date entries
          Object.keys(updatedMeals).forEach(dateKey => {
            updatedMeals[dateKey] = updatedMeals[dateKey].filter(meal => meal.id !== mealId);
          });
          
          return updatedMeals;
        });
        
        // Step 2: Recalculate totals for today
        const todayKey = getStorageKeyForDate(new Date());
        const todayMeals = meals[todayKey]?.filter(meal => meal.id !== mealId) || [];
        const newTotals = calculateTotals({ [todayKey]: todayMeals });
        
        // Step 3: Update totals
        setTotalCalories(newTotals.calories);
        setTotalMacros({
          protein: newTotals.macros.protein,
          carbs: newTotals.macros.carbs,
          fat: newTotals.macros.fat
        });
        
        console.log('[MealContext] Successfully processed meal deleted event');
      } catch (error) {
        console.error('[MealContext] Error handling meal deleted event:', error);
      }
    };

    // Set up event listener with cleanup
    console.log('[MealContext] Setting up meal deleted event listener');
    const cleanup = EventEmitter.addListener('meal_deleted', handleMealDeleted);
    
    return () => {
      console.log('[MealContext] Cleaning up meal deleted event listener');
      cleanup();
    };
  }, [meals, calculateTotals]);

  // Update the completeMeal function to handle deletion properly
  const completeMeal = useCallback((mealId: string, completed: boolean) => {
    const dateKey = getStorageKeyForDate(selectedDate);
    setMeals(prevMeals => {
      const updatedMeals = {
        ...prevMeals,
        [dateKey]: prevMeals[dateKey]?.map(meal => 
          meal.id === mealId ? { ...meal, completed } : meal
        ) || []
      };
      
      // Save meals to storage
      debouncedSaveMeals(updatedMeals);
      
      // If the meal is being uncompleted, we need to update totals
      if (!completed && isSameDay(selectedDate, new Date())) {
        const meal = prevMeals[dateKey]?.find(m => m.id === mealId);
        if (meal) {
          setTotalCalories(prev => prev - (meal.calories || 0));
          setTotalMacros(prev => ({
            protein: prev.protein - (meal.protein || 0),
            carbs: prev.carbs - (meal.carbs || 0),
            fat: prev.fat - (meal.fat || 0)
          }));
        }
      }
      
      return updatedMeals;
    });
  }, [selectedDate, debouncedSaveMeals]);

  // Update total calories
  const updateTotalCalories = useCallback((calories: number) => {
    setTotalCalories(calories);
  }, []);

  // Update total macros
  const updateTotalMacros = useCallback((macros: Macros) => {
    setTotalMacros(macros);
  }, []);

  const value = {
    meals,
    totalCalories,
    totalMacros,
    nutritionGoals,
    nutritionProgress,
    isLoadingGoals,
    updateMeals,
    addMeal,
    completeMeal,
    selectedDate,
    setSelectedDate,
    updateTotalCalories,
    updateTotalMacros,
    updateNutritionGoals,
  };

  return <MealContext.Provider value={value}>{children}</MealContext.Provider>;
};

export const useMeals = () => {
  const context = useContext(MealContext);
  if (context === undefined) {
    throw new Error('useMeals must be used within a MealProvider');
  }
  return context;
}; 