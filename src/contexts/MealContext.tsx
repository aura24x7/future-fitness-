import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorageKeyForDate, isSameDay, getStartOfDay, MEALS_STORAGE_KEY } from '../utils/dateUtils';
import { debounce } from '../utils/debounce';
import { useProfile } from '../context/ProfileContext';
import { calculateMacroDistribution } from '../utils/profileCalculations';

const CALORIE_TOTALS_KEY = '@calorie_totals';

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
  updateMeals: (newMeals: { [key: string]: MealDetails[] }) => void;
  addMeal: (meal: MealDetails) => void;
  completeMeal: (mealId: string, completed: boolean) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  updateTotalCalories: (calories: number) => void;
  updateTotalMacros: (macros: Macros) => void;
}

const MealContext = createContext<MealContextType | undefined>(undefined);

export const MealProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useProfile();
  const [meals, setMeals] = useState<{ [key: string]: MealDetails[] }>({});
  const [selectedDate, setSelectedDate] = useState<Date>(getStartOfDay(new Date()));
  const [totalCalories, setTotalCalories] = useState<number>(0);
  const [totalMacros, setTotalMacros] = useState<Macros>({
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  // Calculate recommended macros based on profile
  const recommendedMacros = React.useMemo(() => {
    if (profile?.metrics?.recommendedCalories) {
      const macros = calculateMacroDistribution(
        profile.metrics.recommendedCalories,
        profile.weightGoal || 'MAINTAIN_WEIGHT'
      );
      return {
        protein: macros.proteins,
        carbs: macros.carbs,
        fat: macros.fats
      };
    }
    return {
      protein: 0,
      carbs: 0,
      fat: 0
    };
  }, [profile?.metrics?.recommendedCalories, profile?.weightGoal]);

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
      macros: { protein: proteins, carbs, fat: fats }
    };
  }, []);

  // Load saved totals on mount
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
        console.error('Error loading saved totals:', error);
      }
    };
    loadSavedTotals();
  }, [selectedDate]);

  const saveTotals = useCallback(async (calories: number, macros: Macros) => {
    try {
      const storageKey = `${CALORIE_TOTALS_KEY}_${getStorageKeyForDate(selectedDate)}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify({ calories, macros }));
      console.log('Successfully saved totals:', { calories, macros });
    } catch (error) {
      console.error('Error saving totals:', error);
    }
  }, [selectedDate]);

  // Calculate and save totals whenever meals change
  useEffect(() => {
    const { calories, macros } = calculateTotals(meals);
    setTotalCalories(calories);
    setTotalMacros(macros);
    saveTotals(calories, macros);
  }, [meals, calculateTotals, saveTotals]);

  // Load meals for the selected date
  useEffect(() => {
    const loadMeals = async () => {
      try {
        const storageKey = getStorageKeyForDate(selectedDate);
        const savedMealsStr = await AsyncStorage.getItem(storageKey);
        
        if (savedMealsStr) {
          const savedMeals = JSON.parse(savedMealsStr);
          // Ensure proper meal type structure and IDs
          const structuredMeals = {
            breakfast: (savedMeals.breakfast || []).map((meal: MealDetails) => ({
              ...meal,
              id: meal.id || `${meal.name}-${meal.mealType}-${selectedDate.toISOString()}`,
              mealType: meal.mealType === 'snack' ? 'snacks' : meal.mealType
            })),
            lunch: (savedMeals.lunch || []).map((meal: MealDetails) => ({
              ...meal,
              id: meal.id || `${meal.name}-${meal.mealType}-${selectedDate.toISOString()}`,
              mealType: meal.mealType === 'snack' ? 'snacks' : meal.mealType
            })),
            dinner: (savedMeals.dinner || []).map((meal: MealDetails) => ({
              ...meal,
              id: meal.id || `${meal.name}-${meal.mealType}-${selectedDate.toISOString()}`,
              mealType: meal.mealType === 'snack' ? 'snacks' : meal.mealType
            })),
            snacks: (savedMeals.snacks || []).map((meal: MealDetails) => ({
              ...meal,
              id: meal.id || `${meal.name}-${meal.mealType}-${selectedDate.toISOString()}`,
              mealType: meal.mealType === 'snack' ? 'snacks' : meal.mealType
            }))
          };
          setMeals(structuredMeals);
        } else {
          // Reset meals if none found for the date
          setMeals({
            breakfast: [],
            lunch: [],
            dinner: [],
            snacks: []
          });
        }
      } catch (error) {
        console.error('Error loading meals:', error);
        // Reset meals on error
        setMeals({
          breakfast: [],
          lunch: [],
          dinner: [],
          snacks: []
        });
      }
    };

    loadMeals();
  }, [selectedDate]);

  const saveMealsToStorage = async (mealsToSave: { [key: string]: MealDetails[] }) => {
    try {
      const storageKey = getStorageKeyForDate(selectedDate);
      await AsyncStorage.setItem(storageKey, JSON.stringify(mealsToSave));
      console.log('Successfully saved meals to storage:', storageKey);
    } catch (error) {
      console.error('Error saving meals:', error);
    }
  };

  const updateMeals = useCallback(async (newMeals: { [key: string]: MealDetails[] }) => {
    try {
      // Create a deep copy and preserve existing meal states
      const currentMealStates = new Map();
      Object.entries(meals).forEach(([type, mealArray]) => {
        if (Array.isArray(mealArray)) {
          mealArray.forEach((meal: MealDetails) => {
            const mealId = meal.id || `${meal.name}-${meal.mealType}-${selectedDate.toISOString()}`;
            currentMealStates.set(mealId, meal.completed);
          });
        }
      });

      // Structure new meals while preserving completion states
      const structuredMeals = {
        breakfast: (newMeals.breakfast || []).map(meal => ({
          ...meal,
          id: meal.id || `${meal.name}-${meal.mealType}-${selectedDate.toISOString()}`,
          mealType: meal.mealType === 'snack' ? 'snacks' : meal.mealType,
          completed: currentMealStates.has(meal.id) ? currentMealStates.get(meal.id) : meal.completed || false
        })),
        lunch: (newMeals.lunch || []).map(meal => ({
          ...meal,
          id: meal.id || `${meal.name}-${meal.mealType}-${selectedDate.toISOString()}`,
          mealType: meal.mealType === 'snack' ? 'snacks' : meal.mealType,
          completed: currentMealStates.has(meal.id) ? currentMealStates.get(meal.id) : meal.completed || false
        })),
        dinner: (newMeals.dinner || []).map(meal => ({
          ...meal,
          id: meal.id || `${meal.name}-${meal.mealType}-${selectedDate.toISOString()}`,
          mealType: meal.mealType === 'snack' ? 'snacks' : meal.mealType,
          completed: currentMealStates.has(meal.id) ? currentMealStates.get(meal.id) : meal.completed || false
        })),
        snacks: (newMeals.snacks || []).map(meal => ({
          ...meal,
          id: meal.id || `${meal.name}-${meal.mealType}-${selectedDate.toISOString()}`,
          mealType: meal.mealType === 'snack' ? 'snacks' : meal.mealType,
          completed: currentMealStates.has(meal.id) ? currentMealStates.get(meal.id) : meal.completed || false
        }))
      };

      // Save to storage
      const storageKey = getStorageKeyForDate(selectedDate);
      await AsyncStorage.setItem(storageKey, JSON.stringify(structuredMeals));
      
      // Update state
      setMeals(structuredMeals);
      
      // Update totals
      const { calories, macros } = calculateTotals(structuredMeals);
      setTotalCalories(calories);
      setTotalMacros(macros);
    } catch (error) {
      console.error('Error updating meals:', error);
    }
  }, [meals, selectedDate, calculateTotals]);

  const addMeal = useCallback(async (meal: MealDetails) => {
    try {
      const mealType = meal.mealType.toLowerCase();
      const updatedMeals = {
        ...meals,
        [mealType]: [...(meals[mealType] || []), {
          ...meal,
          id: meal.id || `${meal.name}-${meal.mealType}-${selectedDate.toISOString()}`
        }]
      };
      
      await updateMeals(updatedMeals);
    } catch (error) {
      console.error('Error adding meal:', error);
    }
  }, [meals, selectedDate, updateMeals]);

  const completeMeal = useCallback(async (mealId: string, completed: boolean) => {
    try {
      // Create a deep copy of current meals
      const updatedMeals = JSON.parse(JSON.stringify(meals));
      let found = false;

      // Keep track of all meal states
      const mealStates = new Map();

      // First, collect all current meal states
      Object.entries(updatedMeals).forEach(([type, mealArray]) => {
        if (Array.isArray(mealArray)) {
          mealArray.forEach((meal: MealDetails) => {
            const mealId = meal.id || `${meal.name}-${meal.mealType}-${selectedDate.toISOString()}`;
            mealStates.set(mealId, meal.completed);
          });
        }
      });

      // Update the specific meal's completion state
      for (const mealType of ['breakfast', 'lunch', 'dinner', 'snacks']) {
        if (!Array.isArray(updatedMeals[mealType])) {
          updatedMeals[mealType] = [];
          continue;
        }

        const mealIndex = updatedMeals[mealType].findIndex((meal: MealDetails) => {
          const currentMealId = meal.id || `${meal.name}-${meal.mealType}-${selectedDate.toISOString()}`;
          return currentMealId === mealId;
        });

        if (mealIndex !== -1) {
          // Update only the target meal's completion state
          updatedMeals[mealType][mealIndex] = {
            ...updatedMeals[mealType][mealIndex],
            completed: completed
          };
          found = true;
          break;
        }
      }

      if (found) {
        // Restore all other meal states
        Object.entries(updatedMeals).forEach(([type, mealArray]) => {
          if (Array.isArray(mealArray)) {
            updatedMeals[type] = mealArray.map((meal: MealDetails) => {
              const currentId = meal.id || `${meal.name}-${meal.mealType}-${selectedDate.toISOString()}`;
              // Only update the target meal, preserve all other states
              if (currentId !== mealId) {
                return {
                  ...meal,
                  completed: mealStates.get(currentId)
                };
              }
              return meal;
            });
          }
        });

        // Save to storage
        const storageKey = getStorageKeyForDate(selectedDate);
        await AsyncStorage.setItem(storageKey, JSON.stringify(updatedMeals));
        
        // Update state
        setMeals(updatedMeals);
        
        // Update totals
        const { calories, macros } = calculateTotals(updatedMeals);
        setTotalCalories(calories);
        setTotalMacros(macros);
      } else {
        console.error('Meal not found:', mealId);
      }
    } catch (error) {
      console.error('Error completing meal:', error);
    }
  }, [meals, selectedDate, calculateTotals]);

  const handleSetSelectedDate = useCallback((date: Date) => {
    const normalizedDate = getStartOfDay(date);
    if (!isSameDay(normalizedDate, selectedDate)) {
      setSelectedDate(normalizedDate);
    }
  }, [selectedDate]);

  // Add update methods
  const updateTotalCalories = useCallback((calories: number) => {
    console.log('MealContext - Updating total calories:', calories);
    setTotalCalories(calories);
    // Don't call saveTotals here to prevent circular updates
  }, []);

  const updateTotalMacros = useCallback((macros: Macros) => {
    console.log('MealContext - Updating total macros:', macros);
    setTotalMacros(macros);
    // Don't call saveTotals here to prevent circular updates
  }, []);

  // Add a new effect to handle saving totals when either calories or macros change
  useEffect(() => {
    saveTotals(totalCalories, totalMacros);
  }, [totalCalories, totalMacros, saveTotals]);

  const value = {
    meals,
    totalCalories,
    totalMacros,
    updateMeals,
    addMeal,
    completeMeal,
    selectedDate,
    setSelectedDate: handleSetSelectedDate,
    updateTotalCalories,
    updateTotalMacros,
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
