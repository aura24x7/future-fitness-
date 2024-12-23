export interface MacroNutrients {
  proteins: number;
  carbs: number;
  fats: number;
}

// Simplified Meal interface - only keeping essential fields
export interface Meal {
  id?: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
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
}
