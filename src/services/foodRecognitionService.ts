import { GoogleGenerativeAI } from '@google/generative-ai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MealType, MealLog } from '../types/calorie';
import { GEMINI_API_KEY, GEMINI_MODELS } from '../config/api.config';
import { normalizeDate, getStorageKeyForDate, MEALS_STORAGE_KEY } from '../utils/dateUtils';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const FOOD_ANALYSIS_PROMPT = `You are a professional food analysis expert. Analyze ALL food items in this image using a step-by-step approach:

STEP 1: Initial Observation
- Count and identify EVERY distinct food item
- Note quantities, sizes, and variations
- Identify preparation methods and visible ingredients

STEP 2: Detailed Analysis (For EACH Item)
- List main ingredients and estimated quantities
- Identify cooking methods used
- Note any visible sauces, toppings, or accompaniments
- Consider portion sizes and serving units

STEP 3: Nutritional Calculation
- Calculate individual nutrition for each item
- Consider preparation methods' impact on nutrition
- Account for sauces and toppings
- Use standard restaurant portions as reference

STEP 4: Health Assessment
- Evaluate overall nutritional balance
- Consider portion sizes vs. recommended servings
- Assess ingredient quality and preparation methods
- Calculate health score based on:
  * Nutrient density (30%)
  * Portion appropriateness (25%)
  * Ingredient quality (25%)
  * Preparation method (20%)

Please respond ONLY with a valid JSON object in this exact format:
{
  "foodName": "Complete meal name",
  "description": "Detailed description of all items",
  "itemBreakdown": {
    "totalItems": number,
    "itemList": [{
      "name": "Individual item name",
      "quantity": number,
      "description": "Detailed item description",
      "ingredients": ["ingredient1", "ingredient2"],
      "preparation": "Cooking method",
      "individualNutrition": {
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "fiber": number,
        "sugar": number
      }
    }]
  },
  "nutritionInfo": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "fiber": number,
    "sugar": number
  },
  "servingInfo": {
    "totalServings": number,
    "perItemServing": "serving description"
  },
  "healthScore": {
    "overall": number,
    "breakdown": {
      "nutrientDensity": number,
      "portionSize": number,
      "ingredientQuality": number,
      "preparationMethod": number
    },
    "recommendations": ["recommendation1", "recommendation2"]
  },
  "dietaryInfo": {
    "isVegetarian": boolean,
    "isVegan": boolean,
    "isGlutenFree": boolean,
    "isDairyFree": boolean
  }
}`;

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

export interface FoodAnalysisResult {
  foodName: string;
  description: string;
  itemBreakdown: {
    totalItems: number;
    itemList: FoodItem[];
  };
  nutritionInfo: NutritionInfo;
  servingInfo: {
    totalServings: number;
    perItemServing: string;
  };
  healthScore: HealthScore;
  dietaryInfo: {
    isVegetarian: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
    isDairyFree: boolean;
  };
}

export const analyzeFoodImage = async (imageBase64: string): Promise<FoodAnalysisResult> => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.2, // Lower temperature for more precise analysis
        topK: 32,
        topP: 0.7,
        maxOutputTokens: 2048
      }
    });
    
    const prompt = {
      text: FOOD_ANALYSIS_PROMPT,
    };
    
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: 'image/jpeg'
      }
    };

    // Get multiple analyses for better accuracy
    const analysisPromises = Array(2).fill(null).map(async () => {
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      return response.text();
    });

    const analysisResults = await Promise.all(analysisPromises);
    
    // Process and validate results
    const validResults = analysisResults
      .map(text => {
        try {
          const cleanedText = text
            .replace(/```json\n?|\n?```/g, '')
            .replace(/[\u201C\u201D\u2018\u2019]/g, '"')
            .replace(/\n/g, '')
            .trim();

          const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
          return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        } catch (e) {
          console.warn('Failed to parse result:', e);
          return null;
        }
      })
      .filter(result => result !== null);

    if (validResults.length === 0) {
      throw new Error('No valid analysis results obtained');
    }

    // Combine and validate results
    const combinedResult = combineAnalysisResults(validResults);
    
    // Create final validated result
    const validatedResult: FoodAnalysisResult = {
      foodName: String(combinedResult.foodName || 'Unknown Food'),
      description: String(combinedResult.description || ''),
      itemBreakdown: {
        totalItems: Number(combinedResult.itemBreakdown?.totalItems || 1),
        itemList: Array.isArray(combinedResult.itemBreakdown?.itemList) 
          ? combinedResult.itemBreakdown.itemList.map(item => ({
              name: String(item.name || ''),
              quantity: Number(item.quantity || 1),
              description: String(item.description || ''),
              ingredients: Array.isArray(item.ingredients) ? item.ingredients.map(String) : [],
              preparation: String(item.preparation || ''),
              individualNutrition: {
                calories: Number(item.individualNutrition?.calories || 0),
                protein: Number(item.individualNutrition?.protein || 0),
                carbs: Number(item.individualNutrition?.carbs || 0),
                fat: Number(item.individualNutrition?.fat || 0),
                fiber: Number(item.individualNutrition?.fiber || 0),
                sugar: Number(item.individualNutrition?.sugar || 0)
              }
            }))
          : [{
              name: String(combinedResult.foodName || 'Unknown Item'),
              quantity: 1,
              description: String(combinedResult.description || ''),
              ingredients: [],
              preparation: '',
              individualNutrition: combinedResult.nutritionInfo || {
                calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0
              }
            }]
      },
      nutritionInfo: {
        calories: Number(combinedResult.nutritionInfo?.calories || 0),
        protein: Number(combinedResult.nutritionInfo?.protein || 0),
        carbs: Number(combinedResult.nutritionInfo?.carbs || 0),
        fat: Number(combinedResult.nutritionInfo?.fat || 0),
        fiber: Number(combinedResult.nutritionInfo?.fiber || 0),
        sugar: Number(combinedResult.nutritionInfo?.sugar || 0)
      },
      servingInfo: {
        totalServings: Number(combinedResult.servingInfo?.totalServings || 1),
        perItemServing: String(combinedResult.servingInfo?.perItemServing || '1 serving')
      },
      healthScore: {
        overall: Number(combinedResult.healthScore?.overall || 5),
        breakdown: {
          nutrientDensity: Number(combinedResult.healthScore?.breakdown?.nutrientDensity || 5),
          portionSize: Number(combinedResult.healthScore?.breakdown?.portionSize || 5),
          ingredientQuality: Number(combinedResult.healthScore?.breakdown?.ingredientQuality || 5),
          preparationMethod: Number(combinedResult.healthScore?.breakdown?.preparationMethod || 5)
        },
        recommendations: Array.isArray(combinedResult.healthScore?.recommendations) 
          ? combinedResult.healthScore.recommendations.map(String)
          : []
      },
      dietaryInfo: {
        isVegetarian: Boolean(combinedResult.dietaryInfo?.isVegetarian),
        isVegan: Boolean(combinedResult.dietaryInfo?.isVegan),
        isGlutenFree: Boolean(combinedResult.dietaryInfo?.isGlutenFree),
        isDairyFree: Boolean(combinedResult.dietaryInfo?.isDairyFree)
      }
    };

    console.log('Successfully validated result:', validatedResult);
    return validatedResult;
    
  } catch (error) {
    console.error('Error analyzing food image:', error);
    throw error;
  }
};

function combineAnalysisResults(results: any[]): any {
  // Get the most detailed result
  const mostDetailedResult = results.reduce((prev, curr) => 
    (curr.itemBreakdown?.totalItems || 1) > (prev.itemBreakdown?.totalItems || 1) ? curr : prev
  );

  // Combine nutrition values
  const totalNutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0
  };

  if (mostDetailedResult.itemBreakdown?.itemList) {
    mostDetailedResult.itemBreakdown.itemList.forEach(item => {
      Object.keys(totalNutrition).forEach(key => {
        totalNutrition[key] += Number(item.individualNutrition?.[key] || 0);
      });
    });
  } else {
    results.forEach(result => {
      Object.keys(totalNutrition).forEach(key => {
        totalNutrition[key] += Number(result.nutritionInfo?.[key] || 0) / results.length;
      });
    });
  }

  return {
    ...mostDetailedResult,
    nutritionInfo: totalNutrition
  };
}

export const saveFoodAnalysis = async (result: FoodAnalysisResult, date: Date = new Date()): Promise<void> => {
  try {
    console.log('Saving food analysis to log:', result);
    console.log('For date:', date);
    
    const normalizedDate = normalizeDate(date);
    const storageKey = getStorageKeyForDate(normalizedDate);
    console.log('Using storage key:', storageKey);
    
    const existingMealsString = await AsyncStorage.getItem(storageKey);
    console.log('Existing meals string:', existingMealsString);
    
    let existingMeals = existingMealsString ? JSON.parse(existingMealsString) : {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: []
    };

    // Default to snacks if no meal type is specified
    const mealType = 'snacks';
    const newMeal = {
      id: `${Date.now()}-${result.foodName.toLowerCase().replace(/\s+/g, '-')}`,
      name: result.foodName,
      calories: result.nutritionInfo.calories,
      protein: result.nutritionInfo.protein,
      carbs: result.nutritionInfo.carbs,
      fat: result.nutritionInfo.fat,
      fiber: result.nutritionInfo.fiber || 0,
      sugar: result.nutritionInfo.sugar || 0,
      ingredients: result.itemBreakdown.itemList.map(item => item.ingredients).flat(),
      completed: true,
      mealType: mealType,
      servingSize: result.servingInfo.perItemServing,
      date: normalizedDate.toISOString(),
      healthScore: result.healthScore.overall,
      dietaryInfo: result.dietaryInfo
    };

    if (!existingMeals[mealType]) {
      existingMeals[mealType] = [];
    }

    existingMeals[mealType].push(newMeal);

    console.log('Saving updated meals:', existingMeals);
    await AsyncStorage.setItem(storageKey, JSON.stringify(existingMeals));
    console.log('Successfully saved food to log');

  } catch (error) {
    console.error('Error saving food analysis:', error);
    throw new Error('Failed to save food to log');
  }
};
