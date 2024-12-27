export type HeightUnit = 'cm' | 'ft';
export type WeightUnit = 'kg' | 'lbs';
export type Gender = 'male' | 'female' | 'other';
export type Lifestyle = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type WeightGoal = 'LOSE_WEIGHT' | 'MAINTAIN_WEIGHT' | 'GAIN_WEIGHT';
export type WorkoutPreference = 'strength' | 'cardio' | 'flexibility' | 'balance' | 'mixed';
export type DietaryPreference = 'none' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'paleo';

export interface FormState {
  name: string;
  height: {
    value: string;
    unit: HeightUnit;
  };
  weight: {
    value: string;
    unit: WeightUnit;
  };
  targetWeight: {
    value: string;
    unit: WeightUnit;
  };
  gender: Gender;
  birthday: string;
  lifestyle: Lifestyle;
  workoutPreference: WorkoutPreference;
  dietaryPreference: DietaryPreference;
  weightGoal: WeightGoal;
} 