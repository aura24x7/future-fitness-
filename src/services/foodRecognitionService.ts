import { GoogleGenerativeAI } from '@google/generative-ai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MealType, MealLog } from '../types/calorie';

const genAI = new GoogleGenerativeAI('AIzaSyDjzBDnbMEY-j2ngJnUIij6Afg8H28o_yA');

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize?: string;
}

export interface FoodAnalysisResult {
  foodName: string;
  nutritionInfo: NutritionInfo;
  confidence: number;
  description?: string;
}

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

const FOOD_ANALYSIS_PROMPT = `You are a nutrition expert analyzing food images. For the provided food image:
1. Identify the food item(s)
2. Provide detailed nutritional information
3. Give a brief description
4. Assess confidence level

Respond in this exact JSON format:
{
  "foodName": "name of the food",
  "nutritionInfo": {
    "calories": number,
    "protein": number (in grams),
    "carbs": number (in grams),
    "fat": number (in grams),
    "servingSize": "standard serving size"
  },
  "confidence": number (between 0 and 1),
  "description": "brief description of the food"
}`;

export const analyzeFoodImage = async (imageBase64: string): Promise<FoodAnalysisResult> => {
  try {
    console.log('Initializing Gemini model...');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log('Preparing request...');
    const prompt = {
      text: FOOD_ANALYSIS_PROMPT,
    };
    
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

      return parsedResult as FoodAnalysisResult;
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.error('Raw text that failed to parse:', text);
      throw new Error('Failed to parse food analysis result. Please try again.');
    }
  } catch (error) {
    console.error('Error analyzing food image:', error);
    if (error instanceof Error) {
      if (error.message.includes('model not found')) {
        throw new Error('The food recognition service is temporarily unavailable. Please try again later.');
      }
      // Pass through the original error message for debugging
      throw new Error(`Food analysis failed: ${error.message}`);
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
      ingredients: [], // Optional: could be extracted from description if needed
      instructions: result.description,
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
