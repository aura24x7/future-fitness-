import { useMemo } from 'react';
import useWeightTrackingData from './useWeightTrackingData';

// Constant for calories to weight conversion
// 3500 kcal = 1 lb of fat, converted to kg (1 lb = 0.45359237 kg)
const CONVERSION_FACTOR = 3500 / 0.45359237; // Calories per kg

export interface WeeklyTrackingData {
  weekIndex: number;
  weekDates: string[];
  totalCalories: number;
  recommendedTotal: number;
  surplus: number;
  estimatedWeightChange: number;
}

// Helper function to safely parse dates from various formats
const safelyParseDate = (date: any): Date | null => {
  try {
    // Handle Date objects
    if (date instanceof Date && !isNaN(date.getTime())) {
      return date;
    }
    
    // Handle Firebase timestamps with toDate method
    if (date && typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
      const converted = date.toDate();
      return isNaN(converted.getTime()) ? null : converted;
    }
    
    // Handle string dates
    if (typeof date === 'string') {
      const parsed = new Date(date);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    
    // Handle number timestamps
    if (typeof date === 'number' && isFinite(date)) {
      const parsed = new Date(date);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    
    // Handle timestamp objects with seconds
    if (date && typeof date === 'object' && 'seconds' in date) {
      const seconds = date.seconds;
      if (typeof seconds === 'number' && isFinite(seconds)) {
        const parsed = new Date(seconds * 1000);
        return isNaN(parsed.getTime()) ? null : parsed;
      }
    }
  } catch (error) {
    console.error('Error parsing date:', error);
  }
  
  return null;
};

// Format date as YYYY-MM-DD
const formatDateYYYYMMDD = (date: Date | null): string => {
  try {
    if (!date || isNaN(date.getTime())) {
      return '';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export const useWeightTracking = (recommendedDailyCalories = 2000): {
  weeklyData: WeeklyTrackingData[];
  loading: boolean;
  error: string | null;
} => {
  const { mealData, weightLogs, loading, error } = useWeightTrackingData();
  
  const weeklyData = useMemo(() => {
    // If we're still loading or have errors, return empty array
    if (loading || error) {
      return [];
    }
    
    try {
      // Process actual weight logs if we have them
      let actualWeightChange = 0;
      let weeklyWeightChange = 0;
      
      if (weightLogs && weightLogs.length > 1) {
        // Sort logs by date (oldest to newest)
        const sortedLogs = [...weightLogs].sort((a, b) => {
          const dateA = safelyParseDate(a.timestamp);
          const dateB = safelyParseDate(b.timestamp);
          
          if (!dateA || !dateB) return 0;
          return dateA.getTime() - dateB.getTime();
        });
        
        // Calculate total weight change
        const firstWeight = sortedLogs[0].weight;
        const lastWeight = sortedLogs[sortedLogs.length - 1].weight;
        actualWeightChange = lastWeight - firstWeight;
        
        // Calculate weekly change (simplified)
        const firstDate = safelyParseDate(sortedLogs[0].timestamp);
        const lastDate = safelyParseDate(sortedLogs[sortedLogs.length - 1].timestamp);
        
        if (firstDate && lastDate) {
          const daysDiff = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
          const weeksDiff = daysDiff / 7;
          weeklyWeightChange = actualWeightChange / Math.max(1, weeksDiff);
        }
      }

      // Process meal data (even if we have weight logs, as we want to show calorie info)
      // Aggregate meal data by date
      const dailyCalories: { [date: string]: number } = {};
      
      if (mealData && mealData.length > 0) {
        mealData.forEach((meal) => {
          try {
            const mealDate = safelyParseDate(meal.timestamp);
            if (!mealDate) return;
            
            const dateKey = formatDateYYYYMMDD(mealDate);
            if (!dateKey) return;
            
            // Validate calories
            const calories = typeof meal.calories === 'number' && !isNaN(meal.calories) 
              ? meal.calories 
              : 0;
              
            if (!dailyCalories[dateKey]) {
              dailyCalories[dateKey] = 0;
            }
            
            dailyCalories[dateKey] += calories;
          } catch (error) {
            console.error('Error processing meal:', error);
          }
        });
      }
      
      // Get unique dates and sort them
      const dates = Object.keys(dailyCalories).sort();
      
      // If we have no data at all, return empty array
      if (dates.length === 0) {
        return [];
      }
      
      // Group data into weeks
      const weeks: WeeklyTrackingData[] = [];
      let currentWeek: string[] = [];
      let weekIndex = 0;
      
      for (let i = 0; i < dates.length; i++) {
        currentWeek.push(dates[i]);
        
        // If we've reached 7 days or the end of the dates, create a week
        if (currentWeek.length === 7 || i === dates.length - 1) {
          const weekTotal = currentWeek.reduce((sum, date) => sum + (dailyCalories[date] || 0), 0);
          const recommended = recommendedDailyCalories * currentWeek.length;
          const surplus = weekTotal - recommended;
          
          // Calculate estimated weight change based on calorie surplus/deficit
          // 3500 calorie deficit = 1 pound (0.45 kg) of fat loss
          const estimatedChange = surplus / CONVERSION_FACTOR;
          
          weeks.push({
            weekIndex: weekIndex + 1,
            weekDates: [...currentWeek],
            totalCalories: weekTotal,
            recommendedTotal: recommended,
            surplus,
            // If we have actual weight data, prefer that for the most recent week
            estimatedWeightChange: weekIndex === 0 && weightLogs.length > 1 ? weeklyWeightChange : estimatedChange
          });
          
          // Reset for next week
          currentWeek = [];
          weekIndex++;
        }
      }
      
      // Sort weeks by most recent first
      const sortedWeeks = weeks.sort((a, b) => b.weekIndex - a.weekIndex);
      
      // Safety check: If we have no weekly data, create a placeholder week
      // to avoid "No data available" messages
      if (sortedWeeks.length === 0) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 6);
        
        const placeholderDates = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          placeholderDates.push(formatDateYYYYMMDD(date));
        }
        
        sortedWeeks.push({
          weekIndex: 1,
          weekDates: placeholderDates,
          totalCalories: 0,
          recommendedTotal: recommendedDailyCalories * 7,
          surplus: -recommendedDailyCalories * 7,
          estimatedWeightChange: -(recommendedDailyCalories * 7) / CONVERSION_FACTOR
        });
      }
      
      return sortedWeeks;
    } catch (error) {
      console.error('Error processing weight tracking data:', error);
      return [];
    }
  }, [mealData, weightLogs, loading, error, recommendedDailyCalories]);

  return {
    weeklyData,
    loading,
    error
  };
};

export default useWeightTracking; 