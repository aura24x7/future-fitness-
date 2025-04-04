import { useMemo } from 'react';
import { useMeals } from '../contexts/MealContext';
import { useSimpleFoodLog } from '../contexts/SimpleFoodLogContext';
import { transformDailyToGiftedStackedBar } from '../utils/transforms/giftedChartTransforms';
import { eachDayOfInterval, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, format } from 'date-fns';
import { DailyMealSummary, MealType } from '../types/meal';

export type TimeRange = 'weekly' | 'monthly' | '6months';

export const useAnalytics = () => {
  const { dailySummaries, weeklySummaries } = useMeals();
  const { items } = useSimpleFoodLog();

  const getDateRangeForTimeRange = (range: TimeRange) => {
    const today = new Date();
    switch (range) {
      case 'weekly':
        return {
          start: startOfWeek(today, { weekStartsOn: 1 }),
          end: endOfWeek(today, { weekStartsOn: 1 })
        };
      case 'monthly':
        return {
          start: startOfMonth(today),
          end: endOfMonth(today)
        };
      case '6months':
        return {
          start: subDays(today, 180),
          end: today
        };
      default:
        return {
          start: startOfWeek(today, { weekStartsOn: 1 }),
          end: endOfWeek(today, { weekStartsOn: 1 })
        };
    }
  };

  const getAnalyticsData = (timeRange: TimeRange) => {
    const dateRange = getDateRangeForTimeRange(timeRange);
    const summaries: Record<string, DailyMealSummary> = {};
    
    Object.entries(dailySummaries).forEach(([date, summary]) => {
      if (summary) {
        summaries[date] = {
          date: summary.date,
          dayOfWeek: summary.dayOfWeek,
          totalCalories: summary.totalCalories || 0,
          totalProtein: summary.totalProtein || 0,
          totalCarbs: summary.totalCarbs || 0,
          totalFat: summary.totalFat || 0,
          meals: summary.meals.map(meal => ({
            ...meal,
            id: meal.id || Date.now().toString(),
            mealType: (meal.mealType || 'SNACK') as MealType,
            date: format(meal.date || new Date(), 'yyyy-MM-dd'),
            dayOfWeek: meal.dayOfWeek || 0,
            weekNumber: meal.weekNumber || 1,
            timeOfDay: meal.timeOfDay || '12:00',
            calories: meal.calories || 0,
            protein: meal.protein || 0,
            carbs: meal.carbs || 0,
            fat: meal.fat || 0
          }))
        };
      }
    });
    
    return transformDailyToGiftedStackedBar(
      summaries, 
      dateRange,
      timeRange === '6months' ? 'monthly' : timeRange
    );
  };

  const getAverages = (timeRange: TimeRange) => {
    const dateRange = getDateRangeForTimeRange(timeRange);
    const days = eachDayOfInterval(dateRange);
    
    const totals = days.reduce((acc, day) => {
      const dateKey = day.toISOString().split('T')[0];
      const summary = dailySummaries[dateKey];
      
      if (!summary || !summary.totalCalories) return acc;
      
      return {
        calories: acc.calories + summary.totalCalories,
        protein: acc.protein + summary.totalProtein,
        carbs: acc.carbs + summary.totalCarbs,
        fat: acc.fat + summary.totalFat,
        daysWithData: acc.daysWithData + 1
      };
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      daysWithData: 0
    });

    const daysCount = totals.daysWithData || 1;
    
    return {
      averageCalories: Math.round(totals.calories / daysCount),
      averageMacros: {
        protein: Math.round(totals.protein / daysCount),
        carbs: Math.round(totals.carbs / daysCount),
        fat: Math.round(totals.fat / daysCount)
      },
      adherenceRate: (totals.daysWithData / days.length) * 100
    };
  };

  const getProgressMetrics = (timeRange: TimeRange) => {
    const dateRange = getDateRangeForTimeRange(timeRange);
    const days = eachDayOfInterval(dateRange);
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    
    const metrics = days.reduce((acc, day, index) => {
      const dateKey = day.toISOString().split('T')[0];
      const summary = dailySummaries[dateKey];
      
      const isOnTarget = summary && summary.totalCalories > 0;
      
      if (isOnTarget) {
        tempStreak++;
        if (index === days.length - 1 || isSameDay(day, new Date())) {
          currentStreak = tempStreak;
        }
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
      
      return {
        daysOnTarget: acc.daysOnTarget + (isOnTarget ? 1 : 0),
        totalDays: acc.totalDays + 1
      };
    }, {
      daysOnTarget: 0,
      totalDays: 0
    });
    
    return {
      consistency: (metrics.daysOnTarget / metrics.totalDays) * 100,
      currentStreak,
      maxStreak
    };
  };

  return {
    getAnalyticsData,
    getAverages,
    getProgressMetrics
  };
}; 