export interface MacroNutrients {
  protein: number;
  carbs: number;
  fat: number;
}

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACKS = 'snacks'
}

export interface MealLog {
  id?: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  completed: boolean;
  mealType: MealType;
  date?: Date;
  ingredients?: string[];
  instructions?: string;
  servings?: number;
  prepTime?: number;
}

export interface CalorieGoal {
  daily: number;
  macros: MacroNutrients;
}

export interface CalorieStats {
  consumed: number;
  burned: number;
  remaining: number;
  macros: MacroNutrients;
}

export interface WorkoutLog {
  id?: string;
  name: string;
  calories: number;
  duration: number;
  type: string;
  date?: Date;
  completed: boolean;
}

export interface AddCustomMealParams {
  onSave: (newMeal: MealLog) => Promise<void> | void;
  selectedDate?: string;
  meal?: MealLog;
  isEditing?: boolean;
}

export interface MealDetails {
  id?: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  completed: boolean;
  mealType: string;
  ingredients?: string[];
  date?: string | Date;
}
