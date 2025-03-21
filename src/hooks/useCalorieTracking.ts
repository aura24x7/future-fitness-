import { useState, useEffect, useCallback } from 'react';
import { useOnboarding } from './useOnboarding';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateMacroDistribution } from '../utils/profileCalculations';

interface MacroData {
  carbs: number;
  protein: number;
  fats: number;
  other: number;
}

interface CalorieData {
  date: Date;
  totalCalories: number;
  targetCalories: number;
  macros: MacroData;
}

const CALORIE_DATA_KEY = '@calorie_data';

export const useCalorieTracking = () => {
  const { onboardingData } = useOnboarding();
  const [calorieData, setCalorieData] = useState<CalorieData>({
    date: new Date(),
    totalCalories: 0,
    targetCalories: 2000,
    macros: {
      carbs: 0,
      protein: 0,
      fats: 0,
      other: 0,
    },
  });

  // Load saved calorie data
  useEffect(() => {
    loadCalorieData();
  }, []);

  const loadCalorieData = async () => {
    try {
      const data = await AsyncStorage.getItem(CALORIE_DATA_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        parsed.date = new Date(parsed.date);
        setCalorieData(parsed);
      }
    } catch (error) {
      console.error('Error loading calorie data:', error);
    }
  };

  // Save calorie data when it changes
  useEffect(() => {
    saveCalorieData();
  }, [calorieData]);

  const saveCalorieData = async () => {
    try {
      await AsyncStorage.setItem(CALORIE_DATA_KEY, JSON.stringify(calorieData));
    } catch (error) {
      console.error('Error saving calorie data:', error);
    }
  };

  // Calculate target calories based on user profile
  useEffect(() => {
    if (onboardingData?.weight?.value && onboardingData?.height?.value && onboardingData?.birthday && onboardingData?.gender) {
      // Calculate age from birthday
      const today = new Date();
      const birthDate = new Date(onboardingData.birthday);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      // Calculate BMR using the Mifflin-St Jeor Equation
      let bmr;
      const weight = onboardingData.weight.value;
      const height = onboardingData.height.value;

      if (onboardingData.gender === 'MALE') {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
      } else {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
      }

      // Apply activity multiplier
      const activityMultipliers = {
        SEDENTARY: 1.2,
        LIGHTLY_ACTIVE: 1.375,
        MODERATELY_ACTIVE: 1.55,
        VERY_ACTIVE: 1.725,
        SUPER_ACTIVE: 1.9,
      };

      const tdee = bmr * (activityMultipliers[onboardingData.lifestyle || 'SEDENTARY']);

      // Calculate recommended calories based on weight goal using fixed calorie adjustments
      let targetCalories = tdee;
      if (onboardingData.weightGoal === 'LOSE_WEIGHT') {
        targetCalories = Math.max(1200, tdee - 500); // 500 calorie deficit for weight loss
      } else if (onboardingData.weightGoal === 'GAIN_WEIGHT') {
        targetCalories = tdee + 500; // 500 calorie surplus for weight gain
      }

      setCalorieData(prev => ({
        ...prev,
        targetCalories: Math.round(targetCalories),
      }));
    }
  }, [onboardingData]);

  const addMeal = useCallback((mealCalories: number, mealMacros: MacroData) => {
    setCalorieData(prev => ({
      ...prev,
      totalCalories: prev.totalCalories + mealCalories,
      macros: {
        carbs: ((prev.macros.carbs * prev.totalCalories) + (mealMacros.carbs * mealCalories)) / (prev.totalCalories + mealCalories),
        protein: ((prev.macros.protein * prev.totalCalories) + (mealMacros.protein * mealCalories)) / (prev.totalCalories + mealCalories),
        fats: ((prev.macros.fats * prev.totalCalories) + (mealMacros.fats * mealCalories)) / (prev.totalCalories + mealCalories),
        other: ((prev.macros.other * prev.totalCalories) + (mealMacros.other * mealCalories)) / (prev.totalCalories + mealCalories),
      },
    }));
  }, []);

  const setDate = useCallback((newDate: Date) => {
    const defaultMacros = onboardingData?.weightGoal 
      ? calculateMacroDistribution(calorieData.targetCalories, onboardingData.weightGoal)
      : { proteins: 0, carbs: 0, fats: 0 };

    setCalorieData(prev => ({
      ...prev,
      date: newDate,
      totalCalories: 0, // Reset calories for new date
      macros: {
        carbs: defaultMacros.carbs,
        protein: defaultMacros.proteins,
        fats: defaultMacros.fats,
        other: 0,
      },
    }));
  }, [calorieData.targetCalories, onboardingData?.weightGoal]);

  return {
    calorieData,
    addMeal,
    setDate,
  };
};
