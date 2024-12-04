import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorageKeyForDate, isSameDay, getStartOfDay, MEALS_STORAGE_KEY } from '../utils/dateUtils';
import { debounce } from '../utils/debounce';

export interface Macros {
  proteins: number;
  carbs: number;
  fats: number;
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
  updateMeals: (newMeals: { [key: string]: MealDetails[] }) => void;
  addMeal: (meal: MealDetails) => void;
  completeMeal: (mealId: string, completed: boolean) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const MealContext = createContext<MealContextType | undefined>(undefined);

export const MealProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [meals, setMeals] = useState<{ [key: string]: MealDetails[] }>({});
  const [selectedDate, setSelectedDate] = useState<Date>(getStartOfDay(new Date()));
  const [totalCalories, setTotalCalories] = useState<number>(0);
  const [totalMacros, setTotalMacros] = useState<Macros>({
    proteins: 0,
    carbs: 0,
    fats: 0,
  });

  const calculateTotals = useCallback((mealsToCalculate: { [key: string]: MealDetails[] }) => {
    let calories = 0;
    let proteins = 0;
    let carbs = 0;
    let fats = 0;

    Object.values(mealsToCalculate).flat().forEach((meal: MealDetails) => {
      if (meal.completed) {
        calories += meal.calories || 0;
        proteins += meal.protein || 0;
        carbs += meal.carbs || 0;
        fats += meal.fat || 0;
      }
    });

    return {
      calories,
      macros: { proteins, carbs, fats }
    };
  }, []);

  // Update totals whenever meals change
  useEffect(() => {
    const { calories, macros } = calculateTotals(meals);
    setTotalCalories(calories);
    setTotalMacros(macros);
  }, [meals, calculateTotals]);

  // Load meals for the selected date
  useEffect(() => {
    const loadMeals = async () => {
      try {
        const storageKey = getStorageKeyForDate(selectedDate);
        const savedMealsStr = await AsyncStorage.getItem(storageKey);
        const savedMeals = savedMealsStr ? JSON.parse(savedMealsStr) : {};
        
        setMeals(savedMeals);
      } catch (error) {
        console.error('Error loading meals:', error);
      }
    };

    if (selectedDate) {
      loadMeals();
    }
  }, [selectedDate]);

  const debouncedSaveMeals = useCallback(
    debounce(async (mealsToSave: { [key: string]: MealDetails[] }) => {
      try {
        const storageKey = getStorageKeyForDate(selectedDate);
        await AsyncStorage.setItem(storageKey, JSON.stringify(mealsToSave));
      } catch (error) {
        console.error('Error saving meals:', error);
      }
    }, 300),
    [selectedDate]
  );

  const updateMeals = useCallback((newMeals: { [key: string]: MealDetails[] }) => {
    setMeals(newMeals);
    debouncedSaveMeals(newMeals);
    
    // Immediately calculate and update totals
    const { calories, macros } = calculateTotals(newMeals);
    setTotalCalories(calories);
    setTotalMacros(macros);
  }, [debouncedSaveMeals, calculateTotals]);

  const addMeal = useCallback((meal: MealDetails) => {
    setMeals(prevMeals => {
      const storageKey = getStorageKeyForDate(selectedDate);
      const updatedMeals = {
        ...prevMeals,
        [storageKey]: [...(prevMeals[storageKey] || []), meal]
      };
      
      // Save meals and update totals
      debouncedSaveMeals(updatedMeals);
      return updatedMeals;
    });
  }, [selectedDate, debouncedSaveMeals]);

  const completeMeal = useCallback((mealId: string, completed: boolean) => {
    setMeals(prevMeals => {
      const storageKey = getStorageKeyForDate(selectedDate);
      const currentMeals = prevMeals[storageKey] || [];
      const updatedMeals = {
        ...prevMeals,
        [storageKey]: currentMeals.map(meal =>
          meal.id === mealId ? { ...meal, completed } : meal
        )
      };
      
      // Save meals and update totals
      debouncedSaveMeals(updatedMeals);
      return updatedMeals;
    });
  }, [selectedDate, debouncedSaveMeals]);

  const handleSetSelectedDate = useCallback((date: Date) => {
    const normalizedDate = getStartOfDay(date);
    if (!isSameDay(normalizedDate, selectedDate)) {
      setSelectedDate(normalizedDate);
    }
  }, [selectedDate]);

  return (
    <MealContext.Provider
      value={{
        meals,
        totalCalories,
        totalMacros,
        updateMeals,
        addMeal,
        completeMeal,
        selectedDate,
        setSelectedDate: handleSetSelectedDate,
      }}
    >
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
