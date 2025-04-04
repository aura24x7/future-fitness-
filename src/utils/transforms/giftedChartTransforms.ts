import React from 'react';
import { DailyMealSummary } from '../../types/meal';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth, isFirstDayOfMonth } from 'date-fns';

export const MACRO_COLORS = {
  protein: '#FF6B6B',
  carbs: '#4ECDC4',
  fat: '#45B7D1'
};

export interface GiftedBarData {
  value: number;
  label: string;
  spacing?: number;
  labelWidth?: number;
  labelTextStyle?: any;
  frontColor?: string;
  sideColor?: string;
  topColor?: string;
  showGradient?: boolean;
  gradientColor?: string;
  focused?: boolean;
  onPress?: () => void;
  stacks: Array<{
    value: number;
    color: string;
    marginBottom?: number;
  }>;
}

export const transformDailyToGiftedStackedBar = (
  dailyData: Record<string, DailyMealSummary>,
  dateRange: { start: Date; end: Date },
  timeRange: 'weekly' | 'monthly' = 'weekly'
): GiftedBarData[] => {
  const days = eachDayOfInterval(dateRange);
  
  if (timeRange === 'weekly') {
    return days.map(day => transformDayData(day, dailyData));
  }
  
  // For monthly view, aggregate data by month
  const monthlyData: { [key: string]: GiftedBarData } = {};
  
  days.forEach(day => {
    const monthKey = format(day, 'MMM yyyy');
    const dateKey = format(day, 'yyyy-MM-dd');
    const dayData = dailyData[dateKey];
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        label: format(day, 'MMM'),
        value: 0,
        stacks: [
          { value: 0, color: MACRO_COLORS.protein, marginBottom: 0 },
          { value: 0, color: MACRO_COLORS.carbs, marginBottom: 0 },
          { value: 0, color: MACRO_COLORS.fat, marginBottom: 0 }
        ],
        frontColor: 'transparent'
      };
    }
    
    if (dayData && dayData.meals && dayData.meals.length > 0) {
      // Calculate macro totals from meals
      const macroTotals = dayData.meals.reduce((acc, meal) => ({
        protein: acc.protein + (meal.protein || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        fat: acc.fat + (meal.fat || 0),
        calories: acc.calories + (meal.calories || 0)
      }), { protein: 0, carbs: 0, fat: 0, calories: 0 });

      monthlyData[monthKey].value += macroTotals.calories;
      monthlyData[monthKey].stacks[0].value += Math.round(macroTotals.protein * 4);
      monthlyData[monthKey].stacks[1].value += Math.round(macroTotals.carbs * 4);
      monthlyData[monthKey].stacks[2].value += Math.round(macroTotals.fat * 9);
    }
  });
  
  return Object.values(monthlyData);
};

const transformDayData = (day: Date, dailyData: Record<string, DailyMealSummary>): GiftedBarData => {
  const dateKey = format(day, 'yyyy-MM-dd');
  const dayData = dailyData[dateKey];

  // Default empty stacks with 0 values but proper structure
  const emptyStacks = [
    { value: 0, color: MACRO_COLORS.protein, marginBottom: 0 },
    { value: 0, color: MACRO_COLORS.carbs, marginBottom: 0 },
    { value: 0, color: MACRO_COLORS.fat, marginBottom: 0 }
  ];

  if (!dayData || !dayData.meals || dayData.meals.length === 0) {
    return {
      label: format(day, 'EEE'),
      value: 0,
      stacks: emptyStacks,
      frontColor: 'transparent',
    };
  }

  // Calculate macro totals from meals
  const macroTotals = dayData.meals.reduce((acc, meal) => ({
    protein: acc.protein + (meal.protein || 0),
    carbs: acc.carbs + (meal.carbs || 0),
    fat: acc.fat + (meal.fat || 0),
    calories: acc.calories + (meal.calories || 0)
  }), { protein: 0, carbs: 0, fat: 0, calories: 0 });

  // Calculate macro calories
  const proteinCals = Math.round(macroTotals.protein * 4);
  const carbsCals = Math.round(macroTotals.carbs * 4);
  const fatCals = Math.round(macroTotals.fat * 9);
  
  // Use the actual total calories from meals
  const totalCalories = macroTotals.calories;
  
  // Calculate proportions to match the total calories
  const calculatedTotal = proteinCals + carbsCals + fatCals;
  let adjustedProteinCals = proteinCals;
  let adjustedCarbsCals = carbsCals;
  let adjustedFatCals = fatCals;

  if (calculatedTotal !== totalCalories && calculatedTotal > 0) {
    const ratio = totalCalories / calculatedTotal;
    adjustedProteinCals = Math.round(proteinCals * ratio);
    adjustedCarbsCals = Math.round(carbsCals * ratio);
    // Adjust fat calories to ensure the total matches exactly
    adjustedFatCals = totalCalories - adjustedProteinCals - adjustedCarbsCals;
  }

  return {
    label: format(day, 'EEE'),
    value: totalCalories,
    stacks: [
      { value: adjustedProteinCals, color: MACRO_COLORS.protein, marginBottom: 0 },
      { value: adjustedCarbsCals, color: MACRO_COLORS.carbs, marginBottom: 0 },
      { value: adjustedFatCals, color: MACRO_COLORS.fat, marginBottom: 0 }
    ],
    frontColor: 'transparent',
  };
}; 