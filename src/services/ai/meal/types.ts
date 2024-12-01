// Meal plan related types and interfaces
export interface MealPlanPreferences {
    calorieGoal: number;
    dietaryRestrictions?: string[];
    allergies?: string[];
    cuisinePreferences?: string[];
    mealCount: number;
}

export interface MealDetails {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    ingredients: string[];
    instructions: string;
    servings: number;
    prepTime: number;
}

export interface DailyMealPlan {
    dayOfWeek: string;
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    meals: {
        breakfast: MealDetails[];
        lunch: MealDetails[];
        dinner: MealDetails[];
        snacks: MealDetails[];
    };
}

export interface WeeklyMealPlan {
    weeklyPlan: DailyMealPlan[];
}
