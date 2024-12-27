/**
 * Represents the distribution of macronutrients in grams
 */
export interface MacroDistribution {
  protein: number;  // grams
  carbs: number;    // grams
  fats: number;     // grams
}

/**
 * Represents the nutritional information of a food item
 */
export interface NutritionInfo {
  calories: number;
  protein: number;  // grams
  carbs: number;    // grams
  fats: number;     // grams
  fiber?: number;   // grams
  sugar?: number;   // grams
  sodium?: number;  // milligrams
}

/**
 * Represents the daily nutritional goals
 */
export interface NutritionGoals {
  calories: number;
  macros: MacroDistribution;
  fiber?: number;   // grams
  sugar?: number;   // grams
  sodium?: number;  // milligrams
} 