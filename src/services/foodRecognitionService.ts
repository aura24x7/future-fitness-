import { GoogleGenerativeAI } from '@google/generative-ai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MealType, MealLog } from '../types/calorie';
import { GEMINI_API_KEY, GEMINI_MODELS } from '../config/api.config';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const MEALS_STORAGE_KEY = '@meals';
const getStorageKeyForDate = (date: Date) => `${MEALS_STORAGE_KEY}_${date.toISOString().split('T')[0]}`;

// Helper function to determine meal type based on time
const getMealTypeFromTime = (date: Date): MealType => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return MealType.Breakfast;
  if (hour >= 11 && hour < 16) return MealType.Lunch;
  if (hour >= 16 && hour < 22) return MealType.Dinner;
  return MealType.Snack;
};

const FOOD_ANALYSIS_PROMPT = `Analyze the food in this image and provide detailed nutritional information. 
Return the result as a JSON object with the following structure:
{
  "foodName": "Name of the food",
  "confidence": 0.95,
  "nutritionInfo": {
    "calories": 250,
    "protein": 12,
    "carbs": 30,
    "fat": 8,
    "fiber": 4,
    "sugar": 2
  },
  "ingredients": ["ingredient1", "ingredient2"],
  "servingSize": "1 cup",
  "mealType": "breakfast|lunch|dinner|snack",
  "healthyScore": 8.5,
  "dietaryInfo": {
    "isVegetarian": true,
    "isVegan": false,
    "isGlutenFree": true,
    "isDairyFree": true
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

export interface FoodAnalysisResult {
  foodName: string;
  confidence: number;
  nutritionInfo: NutritionInfo;
  ingredients: string[];
  servingSize: string;
  mealType: string;
  healthyScore: number;
  dietaryInfo: {
    isVegetarian: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
    isDairyFree: boolean;
  };
}

export const analyzeFoodImage = async (imageBase64: string): Promise<FoodAnalysisResult> => {
  try {
    console.log('Starting food analysis...');
    console.log('Initializing Gemini model...');
    const model = genAI.getGenerativeModel({ model: GEMINI_MODELS.VISION });
    
    console.log('Preparing request...');
    const prompt = {
      text: FOOD_ANALYSIS_PROMPT,
    };
    
    // Convert base64 to parts array for Gemini API
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: 'image/jpeg'
      }
    };

    console.log('Sending request to Gemini API...');
    const result = await model.generateContent([prompt, imagePart]);
    console.log('Received response from Gemini API');
    
    const response = await result.response;
    const text = response.text();
    console.log('Raw API response:', text);

    try {
      // Clean the response text to ensure it's valid JSON
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const parsedResult = JSON.parse(cleanedText);
      console.log('Parsed result:', parsedResult);

      // Validate the parsed result
      if (!parsedResult.foodName || !parsedResult.nutritionInfo) {
        throw new Error('Invalid response format from API');
      }

      // Ensure all required fields exist with defaults if missing
      const validatedResult: FoodAnalysisResult = {
        foodName: parsedResult.foodName,
        confidence: parsedResult.confidence || 0.8,
        nutritionInfo: {
          calories: parsedResult.nutritionInfo.calories || 0,
          protein: parsedResult.nutritionInfo.protein || 0,
          carbs: parsedResult.nutritionInfo.carbs || 0,
          fat: parsedResult.nutritionInfo.fat || 0,
          fiber: parsedResult.nutritionInfo.fiber || 0,
          sugar: parsedResult.nutritionInfo.sugar || 0
        },
        ingredients: parsedResult.ingredients || [],
        servingSize: parsedResult.servingSize || "1 serving",
        mealType: parsedResult.mealType || "snack",
        healthyScore: parsedResult.healthyScore || 5.0,
        dietaryInfo: {
          isVegetarian: parsedResult.dietaryInfo?.isVegetarian || false,
          isVegan: parsedResult.dietaryInfo?.isVegan || false,
          isGlutenFree: parsedResult.dietaryInfo?.isGlutenFree || false,
          isDairyFree: parsedResult.dietaryInfo?.isDairyFree || false
        }
      };

      return validatedResult;
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.error('Raw text that failed to parse:', text);
      throw new Error('Failed to parse food analysis result. Please try again.');
    }
  } catch (error) {
    console.error('Error analyzing food image:', error);
    if (error instanceof Error) {
      // Check for specific API key errors
      if (error.message.includes('API key not valid') || error.message.includes('API_KEY_INVALID')) {
        throw new Error('Food analysis service is not properly configured. Please check your API settings.');
      }
      // Check for model availability errors
      if (error.message.includes('model not found')) {
        throw new Error('The selected food analysis model is currently unavailable. Please try again later.');
      }
      throw new Error(`Error analyzing food: ${error.message}`);
    }
    throw error;
  }
};

export const saveFoodAnalysis = async (result: FoodAnalysisResult, date: Date = new Date()): Promise<void> => {
  try {
    const storageKey = getStorageKeyForDate(date);
    
    // Create meal log entry
    const mealLog: MealLog = {
      name: result.foodName,
      calories: result.nutritionInfo.calories,
      protein: result.nutritionInfo.protein,
      carbs: result.nutritionInfo.carbs,
      fat: result.nutritionInfo.fat,
      completed: true,
      mealType: getMealTypeFromTime(date),
      date: date,
      ingredients: result.ingredients, 
      instructions: result.dietaryInfo.isVegetarian ? 'Vegetarian' : 'Non-Vegetarian',
      servings: 1
    };

    // Get existing meals for the day
    const existingMealsJson = await AsyncStorage.getItem(storageKey);
    let existingMeals: { [key: string]: MealLog[] } = existingMealsJson ? JSON.parse(existingMealsJson) : {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: []
    };

    // Add new meal to appropriate category
    const category = mealLog.mealType.toLowerCase();
    existingMeals[category] = [...(existingMeals[category] || []), mealLog];

    // Save back to AsyncStorage
    await AsyncStorage.setItem(storageKey, JSON.stringify(existingMeals));
    console.log('Successfully saved food to log:', mealLog);
  } catch (error) {
    console.error('Error saving food analysis:', error);
    throw new Error('Failed to save food to log. Please try again.');
  }
};
