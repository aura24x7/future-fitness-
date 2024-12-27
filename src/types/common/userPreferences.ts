/**
 * Represents the user's fitness and lifestyle preferences
 */
export interface UserPreferences {
  fitnessGoal: 'LOSE_WEIGHT' | 'MAINTAIN_WEIGHT' | 'GAIN_WEIGHT';
  lifestyle: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  weightGoal?: number;  // Target weight change per week in kg
  dietaryRestrictions?: string[];
  preferredWorkoutDays?: string[];
} 