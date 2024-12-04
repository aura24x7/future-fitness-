export interface NutritionInfo {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
}

export interface DietaryInfo {
    isVegetarian: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
    isDairyFree: boolean;
}

export interface FoodAnalysisResult {
    foodName: string;
    description: string;  // Detailed description of the food items
    itemCount: number;    // Number of items (e.g., 2 burgers)
    confidence: number;
    nutritionInfo: NutritionInfo;
    ingredients: Array<{
        item: string;
        amount: number;
        unit: string;
    }>;
    servingSize: string;
    mealType: string;
    healthyScore: number;
    dietaryInfo: DietaryInfo;
}
