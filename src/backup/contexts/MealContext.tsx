import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorageKeyForDate, isSameDay, getStartOfDay, MEALS_STORAGE_KEY } from '../utils/dateUtils';
import { debounce } from '../utils/debounce';
import { useProfile } from '../context/ProfileContext';
import { calculateMacroDistribution } from '../utils/profileCalculations';
import { generateUUID } from '../utils/uuid';

const CALORIE_TOTALS_KEY = '@calorie_totals';
const STORAGE_KEYS = {
  DAILY_SUMMARY: '@daily_summary',
  WEEKLY_SUMMARY: '@weekly_summary',
  MEALS: '@meals'
};

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
  date?: Date;
  dayOfWeek?: number;
  weekNumber?: number;
  timeOfDay?: string;
}

interface DailyMealSummary {
  date: string;
  dayOfWeek: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  meals: MealDetails[];
}

interface WeeklyMealSummary {
  weekNumber: number;
  startDate: string;
  endDate: string;
  dailySummaries: DailyMealSummary[];
  averageCalories: number;
  averageMacros: Macros;
}

interface MealContextType {
  meals: { [key: string]: MealDetails[] };
  dailySummaries: { [key: string]: DailyMealSummary };
  weeklySummaries: { [key: number]: WeeklyMealSummary };
  totalCalories: number;
  totalMacros: Macros;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  addMeal: (meal: Omit<MealDetails, 'id' | 'dayOfWeek' | 'weekNumber' | 'timeOfDay'>) => Promise<void>;
  updateMeals: (newMeals: { [key: string]: MealDetails[] }) => void;
  getDailySummary: (date: Date) => DailyMealSummary | null;
  getWeeklySummary: (weekNumber: number) => WeeklyMealSummary | null;
  getMealsByDay: (date: Date) => MealDetails[];
  updateTotalCalories: (calories: number) => void;
  updateTotalMacros: (macros: Macros) => void;
}

const MealContext = createContext<MealContextType | undefined>(undefined);

export const MealProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useProfile();
  const [meals, setMeals] = useState<{ [key: string]: MealDetails[] }>({});
  const [dailySummaries, setDailySummaries] = useState<{ [key: string]: DailyMealSummary }>({});
  const [weeklySummaries, setWeeklySummaries] = useState<{ [key: number]: WeeklyMealSummary }>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalMacros, setTotalMacros] = useState<Macros>({ protein: 0, carbs: 0, fat: 0 });
  const [isInitialized, setIsInitialized] = useState(false);

  // Load all saved data on initialization
  useEffect(() => {
    const loadAllData = async () => {
      try {
        // Load meals
        const savedMealsStr = await AsyncStorage.getItem(STORAGE_KEYS.MEALS);
        if (savedMealsStr) {
          const savedMeals = JSON.parse(savedMealsStr);
          setMeals(savedMeals);
        }

        // Load daily summaries
        const dailyKeys = await AsyncStorage.getAllKeys();
        const dailySummaryKeys = dailyKeys.filter(key => key.startsWith(STORAGE_KEYS.DAILY_SUMMARY));
        
        if (dailySummaryKeys.length > 0) {
          const dailyData = await AsyncStorage.multiGet(dailySummaryKeys);
          const loadedDailySummaries: { [key: string]: DailyMealSummary } = {};
          
          dailyData.forEach(([key, value]) => {
            if (value) {
              const dateKey = key.replace(`${STORAGE_KEYS.DAILY_SUMMARY}_`, '');
              loadedDailySummaries[dateKey] = JSON.parse(value);
            }
          });
          
          setDailySummaries(loadedDailySummaries);
        }

        // Load weekly summaries
        const weeklyKeys = dailyKeys.filter(key => key.startsWith(STORAGE_KEYS.WEEKLY_SUMMARY));
        
        if (weeklyKeys.length > 0) {
          const weeklyData = await AsyncStorage.multiGet(weeklyKeys);
          const loadedWeeklySummaries: { [key: number]: WeeklyMealSummary } = {};
          
          weeklyData.forEach(([key, value]) => {
            if (value) {
              const weekNumber = parseInt(key.replace(`${STORAGE_KEYS.WEEKLY_SUMMARY}_`, ''), 10);
              loadedWeeklySummaries[weekNumber] = JSON.parse(value);
            }
          });
          
          setWeeklySummaries(loadedWeeklySummaries);
        }

        // Calculate today's totals
        const today = new Date();
        const todayKey = formatDateKey(today);
        const todayMeals = savedMealsStr ? JSON.parse(savedMealsStr)[todayKey] || [] : [];
        const totals = calculateTotals({ [todayKey]: todayMeals });
        setTotalCalories(totals.calories);
        setTotalMacros(totals.macros);

        setIsInitialized(true);
      } catch (error) {
        console.error('Error loading meal data:', error);
        setIsInitialized(true); // Set initialized even on error to prevent infinite loading
      }
    };

    loadAllData();
  }, []);

  // Save meals whenever they change
  useEffect(() => {
    if (isInitialized) {
      AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals))
        .catch(error => console.error('Error saving meals:', error));
    }
  }, [meals, isInitialized]);

  const addMeal = useCallback(async (mealData: Omit<MealDetails, 'id' | 'dayOfWeek' | 'weekNumber' | 'timeOfDay'>) => {
    const date = mealData.date ? new Date(mealData.date) : new Date();
    const newMeal: MealDetails = {
      ...mealData,
      id: generateUUID(),
      dayOfWeek: date.getDay(),
      weekNumber: getWeekNumber(date),
      timeOfDay: date.toTimeString().split(' ')[0].slice(0, 5)
    };

    const dateKey = formatDateKey(date);
    const updatedMeals = {
      ...meals,
      [dateKey]: [...(meals[dateKey] || []), newMeal]
    };

    setMeals(updatedMeals);
    await updateDailySummary(date, updatedMeals[dateKey]);
    await updateWeeklySummary(getWeekNumber(date));
  }, [meals]);

  const updateDailySummary = useCallback(async (date: Date, dayMeals: MealDetails[]) => {
    const dateKey = formatDateKey(date);
    
    // If no meals, remove the summary
    if (!dayMeals.length) {
      const updatedDailySummaries = { ...dailySummaries };
      delete updatedDailySummaries[dateKey];
      setDailySummaries(updatedDailySummaries);
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.DAILY_SUMMARY}_${dateKey}`,
        JSON.stringify(null)
      );
      return;
    }

    const summary: DailyMealSummary = {
      date: dateKey,
      dayOfWeek: date.getDay(),
      totalCalories: dayMeals.reduce((sum, meal) => sum + meal.calories, 0),
      totalProtein: dayMeals.reduce((sum, meal) => sum + meal.protein, 0),
      totalCarbs: dayMeals.reduce((sum, meal) => sum + meal.carbs, 0),
      totalFat: dayMeals.reduce((sum, meal) => sum + meal.fat, 0),
      meals: dayMeals
    };

    setDailySummaries(prev => ({
      ...prev,
      [dateKey]: summary
    }));

    await AsyncStorage.setItem(
      `${STORAGE_KEYS.DAILY_SUMMARY}_${dateKey}`,
      JSON.stringify(summary)
    );
  }, [dailySummaries]);

  const updateWeeklySummary = useCallback(async (weekNumber: number) => {
    const weekDates = getWeekDates(weekNumber);
    const weekMeals = Object.entries(meals)
      .filter(([date]) => isDateInWeek(date, weekNumber))
      .flatMap(([_, dayMeals]) => dayMeals);

    // If no meals in the week, remove the summary
    if (!weekMeals.length) {
      const updatedWeeklySummaries = { ...weeklySummaries };
      delete updatedWeeklySummaries[weekNumber];
      setWeeklySummaries(updatedWeeklySummaries);
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.WEEKLY_SUMMARY}_${weekNumber}`,
        JSON.stringify(null)
      );
      return;
    }

    const dailySums = weekDates.map(date => 
      dailySummaries[formatDateKey(date)] || {
        date: formatDateKey(date),
        dayOfWeek: date.getDay(),
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        meals: []
      }
    );

    const summary: WeeklyMealSummary = {
      weekNumber,
      startDate: formatDateKey(weekDates[0]),
      endDate: formatDateKey(weekDates[6]),
      dailySummaries: dailySums,
      averageCalories: weekMeals.reduce((sum, meal) => sum + meal.calories, 0) / 7,
      averageMacros: {
        protein: weekMeals.reduce((sum, meal) => sum + meal.protein, 0) / 7,
        carbs: weekMeals.reduce((sum, meal) => sum + meal.carbs, 0) / 7,
        fat: weekMeals.reduce((sum, meal) => sum + meal.fat, 0) / 7
      }
    };

    setWeeklySummaries(prev => ({
      ...prev,
      [weekNumber]: summary
    }));

    await AsyncStorage.setItem(
      `${STORAGE_KEYS.WEEKLY_SUMMARY}_${weekNumber}`,
      JSON.stringify(summary)
    );
  }, [meals, dailySummaries, weeklySummaries]);

  const getMealsByDay = useCallback((date: Date) => {
    const dateKey = formatDateKey(date);
    return meals[dateKey] || [];
  }, [meals]);

  const getDailySummary = useCallback((date: Date) => {
    const dateKey = formatDateKey(date);
    return dailySummaries[dateKey] || null;
  }, [dailySummaries]);

  const getWeeklySummary = useCallback((weekNumber: number) => {
    return weeklySummaries[weekNumber] || null;
  }, [weeklySummaries]);

  const calculateTotals = useCallback((meals: { [key: string]: MealDetails[] }) => {
    const dateKey = formatDateKey(selectedDate);
    const mealsForDay = meals[dateKey] || [];
    
    console.log('MealContext - Calculating totals for date:', dateKey);
    console.log('MealContext - Meals for day:', mealsForDay);

    const totals = mealsForDay.reduce((acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      macros: {
        protein: acc.macros.protein + (meal.protein || 0),
        carbs: acc.macros.carbs + (meal.carbs || 0),
        fat: acc.macros.fat + (meal.fat || 0),
      }
    }), {
      calories: 0,
      macros: { protein: 0, carbs: 0, fat: 0 }
    });

    console.log('MealContext - Calculated totals:', totals);
    return totals;
  }, [selectedDate]);

  const saveTotals = useCallback(async (calories: number, macros: Macros) => {
    try {
      const storageKey = `${CALORIE_TOTALS_KEY}_${getStorageKeyForDate(selectedDate)}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify({ calories, macros }));
      
      if (process.env.NODE_ENV === 'development') {
        console.log('MealContext - Successfully saved totals:', { calories, macros });
      }
    } catch (error) {
      console.error('MealContext - Error saving totals:', error);
    }
  }, [selectedDate]);

  const updateTotalCalories = useCallback((calories: number) => {
    setTotalCalories(calories);
  }, []);

  const updateTotalMacros = useCallback((macros: Macros) => {
    setTotalMacros(macros);
  }, []);

  useEffect(() => {
    saveTotals(totalCalories, totalMacros);
  }, [totalCalories, totalMacros, saveTotals]);

  useEffect(() => {
    const loadSavedTotals = async () => {
      try {
        const storageKey = `${CALORIE_TOTALS_KEY}_${getStorageKeyForDate(selectedDate)}`;
        const savedTotals = await AsyncStorage.getItem(storageKey);
        if (savedTotals) {
          const { calories, macros } = JSON.parse(savedTotals);
          setTotalCalories(calories);
          setTotalMacros(macros);
        }
      } catch (error) {
        console.error('MealContext - Error loading saved totals:', error);
      }
    };
    loadSavedTotals();
  }, [selectedDate]);

  const updateMeals = useCallback(async (newMeals: { [key: string]: MealDetails[] }) => {
    try {
      // Update meals state
      setMeals(newMeals);

      // Get affected dates by comparing with current meals
      const affectedDates = new Set([
        ...Object.keys(meals),
        ...Object.keys(newMeals)
      ]);

      // Get affected weeks
      const affectedWeeks = new Set<number>();

      // Update daily summaries for all affected dates
      for (const dateKey of affectedDates) {
        const date = new Date(dateKey);
        const weekNum = getWeekNumber(date);
        affectedWeeks.add(weekNum);
        
        // Update daily summary
        await updateDailySummary(date, newMeals[dateKey] || []);
      }

      // Update weekly summaries for all affected weeks
      for (const weekNum of affectedWeeks) {
        await updateWeeklySummary(weekNum);
      }

      // Save the updated meals to storage
      await AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(newMeals));

      // Update totals for selected date
      const selectedDateKey = formatDateKey(selectedDate);
      const selectedDateMeals = newMeals[selectedDateKey] || [];
      const totals = calculateTotals({ [selectedDateKey]: selectedDateMeals });
      
      setTotalCalories(totals.calories);
      setTotalMacros(totals.macros);

      // Update cached totals for selected date
      const storageKey = `${CALORIE_TOTALS_KEY}_${getStorageKeyForDate(selectedDate)}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify({ 
        calories: totals.calories, 
        macros: totals.macros 
      }));

    } catch (error) {
      console.error('Error updating meals:', error);
      throw error;
    }
  }, [meals, selectedDate, calculateTotals, updateDailySummary, updateWeeklySummary]);

  const handleSetSelectedDate = useCallback((date: Date) => {
    const normalizedDate = getStartOfDay(date);
    if (!isSameDay(normalizedDate, selectedDate)) {
      setSelectedDate(normalizedDate);
    }
  }, [selectedDate]);

  const value = {
    meals,
    dailySummaries,
    weeklySummaries,
    totalCalories,
    totalMacros,
    selectedDate,
    setSelectedDate: handleSetSelectedDate,
    addMeal,
    updateMeals,
    getDailySummary,
    getWeeklySummary,
    getMealsByDay,
    updateTotalCalories,
    updateTotalMacros
  };

  return (
    <MealContext.Provider value={value}>
      {children}
    </MealContext.Provider>
  );
};

export const useMeals = () => {
  const context = useContext(MealContext);
  if (context === undefined) {
    throw new Error('useMeals must be used within a MealProvider');
  }
  return context;
};

// Helper functions
function getWeekNumber(date: Date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function getWeekDates(weekNumber: number) {
  const firstDayOfYear = new Date(new Date().getFullYear(), 0, 1);
  const firstDayOfWeek = new Date(firstDayOfYear.getTime() + (weekNumber - 1) * 604800000);
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    weekDates.push(new Date(firstDayOfWeek.getTime() + i * 86400000));
  }
  return weekDates;
}

function isDateInWeek(date: string, weekNumber: number) {
  const dateObject = new Date(date);
  return getWeekNumber(dateObject) === weekNumber;
}

function formatDateKey(date: Date) {
  return date.toISOString().split('T')[0];
}
