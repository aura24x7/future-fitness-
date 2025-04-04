import { DailyNutrition, WeeklyNutrition, MonthlyNutrition } from '../../types/analytics';
import { format, parseISO, startOfWeek, eachDayOfInterval, endOfWeek } from 'date-fns';

// Types for Victory chart data
export interface VictoryBarData {
  x: string | number;
  y: number;
  y0?: number;
  fill?: string;
  label?: string;
}

export interface StackedBarData {
  protein: VictoryBarData[];
  carbs: VictoryBarData[];
  fat: VictoryBarData[];
}

export interface ChartDataset {
  data: VictoryBarData[];
  color: string;
}

// Color constants for consistency
export const MACRO_COLORS = {
  protein: '#FF6B6B',
  carbs: '#4ECDC4',
  fat: '#45B7D1'
};

/**
 * Transforms daily nutrition data into stacked bar chart format
 */
export const transformDailyToStackedBar = (
  dailyData: Record<string, DailyNutrition>,
  dateRange: { start: Date; end: Date }
): StackedBarData => {
  const days = eachDayOfInterval(dateRange);
  
  const initialData: StackedBarData = {
    protein: [],
    carbs: [],
    fat: []
  };

  return days.reduce((acc, day) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const dayData = dailyData[dateKey];

    if (dayData && dayData.macros) {
      // Calculate calorie values for each macro
      const proteinCals = Math.round(dayData.macros.protein * 4); // 4 calories per gram of protein
      const carbsCals = Math.round(dayData.macros.carbs * 4);     // 4 calories per gram of carbs
      const fatCals = Math.round(dayData.macros.fat * 9);         // 9 calories per gram of fat

      // Add data points for each macro
      acc.protein.push({
        x: format(day, 'EEE'),
        y: proteinCals,
        y0: carbsCals + fatCals,
        fill: MACRO_COLORS.protein,
        label: `${Math.round(proteinCals)}cal`
      });

      acc.carbs.push({
        x: format(day, 'EEE'),
        y: carbsCals,
        y0: fatCals,
        fill: MACRO_COLORS.carbs,
        label: `${Math.round(carbsCals)}cal`
      });

      acc.fat.push({
        x: format(day, 'EEE'),
        y: fatCals,
        y0: 0,
        fill: MACRO_COLORS.fat,
        label: `${Math.round(fatCals)}cal`
      });
    } else {
      // Add empty data points for days without data
      const emptyPoint = {
        x: format(day, 'EEE'),
        y: 0,
        y0: 0,
        label: '0cal'
      };
      acc.protein.push({ ...emptyPoint, fill: MACRO_COLORS.protein });
      acc.carbs.push({ ...emptyPoint, fill: MACRO_COLORS.carbs });
      acc.fat.push({ ...emptyPoint, fill: MACRO_COLORS.fat });
    }

    return acc;
  }, initialData);
};

/**
 * Transforms weekly nutrition data into stacked bar chart format
 */
export const transformWeeklyToStackedBar = (
  weeklyData: WeeklyNutrition
): StackedBarData => {
  const startDay = parseISO(weeklyData.startDate);
  const days = eachDayOfInterval({
    start: startDay,
    end: endOfWeek(startDay)
  });

  return {
    protein: days.map(day => ({
      x: format(day, 'EEE'),
      y: weeklyData.averageMacros.protein * 4,
      fill: MACRO_COLORS.protein,
      label: `${Math.round(weeklyData.averageMacros.protein * 4)}cal`
    })),
    carbs: days.map(day => ({
      x: format(day, 'EEE'),
      y: weeklyData.averageMacros.carbs * 4,
      fill: MACRO_COLORS.carbs,
      label: `${Math.round(weeklyData.averageMacros.carbs * 4)}cal`
    })),
    fat: days.map(day => ({
      x: format(day, 'EEE'),
      y: weeklyData.averageMacros.fat * 9,
      fill: MACRO_COLORS.fat,
      label: `${Math.round(weeklyData.averageMacros.fat * 9)}cal`
    }))
  };
};

/**
 * Transforms monthly nutrition data into stacked bar chart format
 */
export const transformMonthlyToStackedBar = (
  monthlyData: MonthlyNutrition
): ChartDataset[] => {
  return [
    {
      data: [{
        x: 'Protein',
        y: monthlyData.macroPercentages.protein,
        fill: MACRO_COLORS.protein,
        label: `${Math.round(monthlyData.macroPercentages.protein)}%`
      }],
      color: MACRO_COLORS.protein
    },
    {
      data: [{
        x: 'Carbs',
        y: monthlyData.macroPercentages.carbs,
        fill: MACRO_COLORS.carbs,
        label: `${Math.round(monthlyData.macroPercentages.carbs)}%`
      }],
      color: MACRO_COLORS.carbs
    },
    {
      data: [{
        x: 'Fat',
        y: monthlyData.macroPercentages.fat,
        fill: MACRO_COLORS.fat,
        label: `${Math.round(monthlyData.macroPercentages.fat)}%`
      }],
      color: MACRO_COLORS.fat
    }
  ];
};

/**
 * Get domain padding for bar charts based on data
 */
export const getBarChartDomainPadding = (data: VictoryBarData[]): number => {
  const maxValue = Math.max(...data.map(d => (d.y + (d.y0 || 0))));
  return Math.ceil(maxValue * 0.1); // 10% padding
}; 