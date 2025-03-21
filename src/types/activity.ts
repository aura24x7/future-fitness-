export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'high' | 'very_high';

export interface ActivityLog {
  id: string;
  userId: string;
  timestamp: Date;
  level: ActivityLevel;
  duration: number; // in minutes
  type: ActivityType;
  caloriesBurned: number;
  notes?: string;
}

export interface ActivityType {
  id: string;
  name: string;
  metValue: number; // Metabolic Equivalent of Task
  category: ActivityCategory;
}

export type ActivityCategory = 
  | 'cardio'
  | 'strength'
  | 'flexibility'
  | 'sports'
  | 'daily_activity';

export interface ActivityStats {
  dailyCaloriesBurned: number;
  weeklyCaloriesBurned: number;
  monthlyCaloriesBurned: number;
  activityStreak: number;
  mostFrequentActivity: string;
  totalActiveMinutes: number;
  averageIntensity: ActivityLevel;
}

export interface ActivitySettings {
  defaultDuration: number;
  reminderEnabled: boolean;
  reminderTime?: string;
  weeklyGoal: {
    minutes: number;
    calories: number;
  };
}

// Calorie adjustment factors based on activity level
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
  very_high: 1.9,
};

// Common activity types with their MET values
export const DEFAULT_ACTIVITY_TYPES: ActivityType[] = [
  {
    id: 'walking',
    name: 'Walking',
    metValue: 3.5,
    category: 'cardio',
  },
  {
    id: 'running',
    name: 'Running',
    metValue: 8.0,
    category: 'cardio',
  },
  {
    id: 'cycling',
    name: 'Cycling',
    metValue: 7.0,
    category: 'cardio',
  },
  {
    id: 'swimming',
    name: 'Swimming',
    metValue: 6.0,
    category: 'cardio',
  },
  {
    id: 'weight_training',
    name: 'Weight Training',
    metValue: 5.0,
    category: 'strength',
  },
  {
    id: 'yoga',
    name: 'Yoga',
    metValue: 3.0,
    category: 'flexibility',
  },
  {
    id: 'basketball',
    name: 'Basketball',
    metValue: 6.5,
    category: 'sports',
  },
  {
    id: 'housework',
    name: 'Housework',
    metValue: 2.5,
    category: 'daily_activity',
  },
]; 