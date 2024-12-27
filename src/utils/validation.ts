import { FormState } from '../types/forms';

export const ValidationLimits = {
  height: {
    cm: { min: 50, max: 300 },
    ft: { min: 1.64, max: 9.84 }
  },
  weight: {
    kg: { min: 20, max: 500 },
    lbs: { min: 44, max: 1102 }
  },
  age: {
    min: 13,
    max: 120
  },
  name: {
    minLength: 2,
    maxLength: 50
  }
};

export const ValidationMessages = {
  required: (field: string) => `${field} is required`,
  invalidFormat: (field: string) => `Please enter a valid ${field.toLowerCase()}`,
  range: (field: string, min: number, max: number, unit: string) => 
    `${field} must be between ${min}${unit} and ${max}${unit}`,
  length: (field: string, min: number, max: number) => 
    `${field} must be between ${min} and ${max} characters`,
  age: {
    tooYoung: 'You must be at least 13 years old to use this app',
    tooOld: 'Please enter a valid birthday (age cannot exceed 120 years)',
    future: 'Birthday cannot be in the future'
  },
  invalidDate: 'Please enter a valid date in YYYY-MM-DD format'
};

export interface ValidationErrors {
  name?: string;
  height?: string;
  weight?: string;
  targetWeight?: string;
  birthday?: string;
  gender?: string;
  lifestyle?: string;
  workoutPreference?: string;
  dietaryPreference?: string;
  weightGoal?: string;
  general?: string;
}

export const FieldDescriptions = {
  name: 'Your full name as you would like it to appear in the app',
  height: 'Your current height. This helps calculate your BMI and other health metrics',
  weight: 'Your current weight. This helps track your progress towards your goals',
  targetWeight: 'Your goal weight. This helps us customize your fitness and nutrition plans',
  gender: 'Your gender helps us provide more accurate health calculations',
  birthday: 'Your birthday helps us personalize your experience and ensure age-appropriate content',
  lifestyle: 'Your typical activity level throughout the day, excluding workouts',
  workoutPreference: 'Your preferred workout environment helps us suggest suitable exercises',
  dietaryPreference: 'Your dietary preferences help us provide relevant meal suggestions',
  weightGoal: 'Your weight management goal helps us adjust your calorie recommendations'
}; 