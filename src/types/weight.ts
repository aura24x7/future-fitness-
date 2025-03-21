export interface WeightLog {
  id: string;
  userId: string;
  timestamp: Date;
  weight: number;
  notes?: string;
}

export interface WeightGoal {
  id: string;
  userId: string;
  startWeight: number;
  targetWeight: number;
  startDate: Date;
  targetDate: Date;
  weeklyGoal: number;  // Expected weekly change
  milestones: WeightMilestone[];
}

export interface WeightMilestone {
  id: string;
  weight: number;
  targetDate: Date;
  achieved: boolean;
  achievedDate?: Date;
}

export interface WeightStats {
  currentWeight: number;
  startWeight: number;
  targetWeight: number;
  totalProgress: number;
  weeklyChange: number;
  monthlyChange: number;
  projectedDate?: Date;
}

export type WeightUnit = 'kg' | 'lbs';

export interface WeightSettings {
  unit: WeightUnit;
  weeklyGoal: number;
  reminderEnabled: boolean;
  reminderTime?: string;
}

export interface WeightChartData {
  date: Date;
  weight?: number;
  targetWeight?: number;
  calories?: number;
  isActual?: boolean;
}

export interface WeightChartConfig {
  startDate: Date;
  endDate: Date;
  timeRange: 'week' | 'twoMonths' | 'sixMonths';
}

export interface WeeklyProgress {
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  progressPercentage: number;
  weeklyChange: number;
  weeksCompleted: number;
  totalWeeks: number;
  caloriesDeficit: number;
  isDataValid: boolean;
  validDays: number;
  startDate: Date | null;
} 