// Meal plan related types and interfaces
export interface MealPlanPreferences {
    calorieGoal?: number;
    mealCount?: number;
    dietaryRestrictions?: string[];
    allergies?: string[];
    cuisinePreferences?: string[];
}

export interface Ingredient {
    item: string;
    amount: number;
    unit: string;
}

export interface MealDetails {
    id?: string;
    name: string;
    description?: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    ingredients: Ingredient[];
    instructions: string;
    servings: number;
    prepTime: number;
    tips?: string;
    completed?: boolean;
    mealType?: string;
}

export interface DailyMeals {
    breakfast: MealDetails[];
    lunch: MealDetails[];
    dinner: MealDetails[];
    snacks?: MealDetails[];
}

export interface DailyMealPlan {
    dayOfWeek: string;
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    meals: DailyMeals;
}

export interface WeeklyMealPlan {
    weeklyPlan: DailyMealPlan[];
}
