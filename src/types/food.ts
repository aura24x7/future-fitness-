export interface NutritionInfo {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
}

export interface FoodItem {
    name: string;
    quantity: number;
    description: string;
    ingredients: string[];
    preparation: string;
    individualNutrition: NutritionInfo;
}

export interface HealthScore {
    overall: number;
    breakdown: {
        nutrientDensity: number;
        portionSize: number;
        ingredientQuality: number;
        preparationMethod: number;
    };
    recommendations: string[];
}

export interface ServingInfo {
    totalServings: number;
    perItemServing: string;
}

export interface DietaryInfo {
    isVegetarian: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
    isDairyFree: boolean;
}

export interface ItemBreakdown {
    totalItems: number;
    itemList: FoodItem[];
}

export interface FoodAnalysisResult {
    foodName: string;
    description: string;
    itemBreakdown: ItemBreakdown;
    nutritionInfo: NutritionInfo;
    servingInfo: ServingInfo;
    healthScore: HealthScore;
    dietaryInfo: DietaryInfo;
}

export interface FoodAnalysisResponse {
    success: boolean;
    data?: FoodAnalysisResult;
    error?: string;
}

// Helper function to create a default NutritionInfo object
export const createDefaultNutritionInfo = (): NutritionInfo => ({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0
});
