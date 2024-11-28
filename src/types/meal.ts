export interface MacroNutrients {
  proteins: number;
  carbs: number;
  fats: number;
}

export interface Meal {
  id?: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string;
  servings: number;
  prepTime: number;
  completed: boolean;
  type?: string;
  timestamp?: string;
  macros?: MacroNutrients;
}

export interface MealLog {
  id: string;
  name: string;
  calories: number;
  timestamp: Date;
  type: string;
  macros: MacroNutrients;
  completed?: boolean;
  ingredients?: string[];
}

export interface DayMeals {
  breakfast: Meal[];
  lunch: Meal[];
  dinner: Meal[];
  snacks: Meal[];
}

export interface MealPlan {
  day: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  completedCalories: number;
  meals: DayMeals;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
