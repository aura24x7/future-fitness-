export type MilestoneType = 
  | 'weight_goal'
  | 'activity_streak'
  | 'workout_count'
  | 'calorie_goal'
  | 'macro_goal';

export interface Milestone {
  id: string;
  userId: string;
  type: MilestoneType;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  achieved: boolean;
  achievedDate?: Date;
  createdAt: Date;
}

export interface MilestoneProgress {
  percentage: number;
  remainingValue: number;
  isAchieved: boolean;
}

export const MILESTONE_THRESHOLDS = {
  weight_goal: [5, 10, 15, 20], // Weight loss/gain in kg
  activity_streak: [7, 14, 30, 60], // Days of activity streak
  workout_count: [10, 25, 50, 100], // Number of workouts
  calorie_goal: [7, 14, 30, 60], // Days of meeting calorie goals
  macro_goal: [7, 14, 30, 60], // Days of meeting macro goals
}; 