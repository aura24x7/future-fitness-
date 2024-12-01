import { GoogleGenerativeAI } from '@google/generative-ai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MealType, MealLog } from '../types/calorie';
import { GEMINI_API_KEY, GEMINI_MODELS } from '../config/api.config';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const MEALS_STORAGE_KEY = '@meals';

// Function to generate storage key for a specific date
const getStorageKeyForDate = (date: Date) => 
  `${MEALS_STORAGE_KEY}_${date.toISOString().split('T')[0]}`;

// Helper function to determine meal type based on time
const getMealTypeFromTime = (date: Date): MealType => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return MealType.Breakfast;
  if (hour >= 11 && hour < 16) return MealType.Lunch;
  if (hour >= 16 && hour < 22) return MealType.Dinner;
  return MealType.Snack;
};

const FOOD_ANALYSIS_PROMPT = `You are a food analysis expert. Analyze the food in this image and provide nutritional information.
Please respond ONLY with a valid JSON object in this exact format, with no additional text or markdown:
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
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 1024
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

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    try {
      // Clean the response text to ensure it's valid JSON
      const cleanedText = text
        .replace(/```json\n?|\n?```/g, '') // Remove any markdown code blocks
        .replace(/[\u201C\u201D\u2018\u2019]/g, '"') // Replace smart quotes with straight quotes
        .replace(/\n/g, '') // Remove newlines
        .trim();

      console.log('Cleaned response text:', cleanedText);
      
      let parsedResult;
      try {
        parsedResult = JSON.parse(cleanedText);
      } catch (jsonError) {
        console.error('First JSON parse attempt failed:', jsonError);
        // Try to extract JSON from the text if it's wrapped in other content
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
        } else {
          throw jsonError;
        }
      }

      // Validate and normalize the result
      const validatedResult: FoodAnalysisResult = {
        foodName: String(parsedResult.foodName || 'Unknown Food'),
        confidence: Number(parsedResult.confidence) || 0.8,
        nutritionInfo: {
          calories: Number(parsedResult.nutritionInfo?.calories) || 0,
          protein: Number(parsedResult.nutritionInfo?.protein) || 0,
          carbs: Number(parsedResult.nutritionInfo?.carbs) || 0,
          fat: Number(parsedResult.nutritionInfo?.fat) || 0,
          fiber: Number(parsedResult.nutritionInfo?.fiber) || 0,
          sugar: Number(parsedResult.nutritionInfo?.sugar) || 0
        },
        ingredients: Array.isArray(parsedResult.ingredients) ? 
          parsedResult.ingredients.map(i => String(i)) : [],
        servingSize: String(parsedResult.servingSize || '1 serving'),
        mealType: String(parsedResult.mealType || getMealTypeFromTime(new Date())),
        healthyScore: Number(parsedResult.healthyScore) || 5,
        dietaryInfo: {
          isVegetarian: Boolean(parsedResult.dietaryInfo?.isVegetarian),
          isVegan: Boolean(parsedResult.dietaryInfo?.isVegan),
          isGlutenFree: Boolean(parsedResult.dietaryInfo?.isGlutenFree),
          isDairyFree: Boolean(parsedResult.dietaryInfo?.isDairyFree)
        }
      };

      console.log('Successfully validated result:', validatedResult);
      return validatedResult;
      
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      console.error('Raw response text:', text);
      throw new Error('Failed to parse food analysis result');
    }
  } catch (error) {
    console.error('Error analyzing food image:', error);
    throw error;
  }
};

export const saveFoodAnalysis = async (result: FoodAnalysisResult, date: Date = new Date()): Promise<void> => {
  try {
    console.log('Saving food analysis to log:', result);
    
    // Get the storage key for today
    const storageKey = getStorageKeyForDate(date);
    
    // Get existing meals for today
    const existingMealsString = await AsyncStorage.getItem(storageKey);
    let existingMeals = existingMealsString ? JSON.parse(existingMealsString) : {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: []
    };

    // Create a new meal entry
    const mealType = getMealTypeFromTime(date).toLowerCase();
    const newMeal = {
      id: `${Date.now()}-${result.foodName.toLowerCase().replace(/\s+/g, '-')}`,
      name: result.foodName,
      calories: result.nutritionInfo.calories,
      protein: result.nutritionInfo.protein,
      carbs: result.nutritionInfo.carbs,
      fat: result.nutritionInfo.fat,
      fiber: result.nutritionInfo.fiber || 0,
      sugar: result.nutritionInfo.sugar || 0,
      ingredients: result.ingredients,
      completed: true,
      mealType: mealType,
      servingSize: result.servingSize,
      date: date.toISOString(),
      healthyScore: result.healthyScore,
      dietaryInfo: result.dietaryInfo
    };

    // Ensure the meal type array exists
    if (!existingMeals[mealType]) {
      existingMeals[mealType] = [];
    }

    // Add the new meal
    existingMeals[mealType].push(newMeal);

    // Save back to storage
    console.log('Saving updated meals:', existingMeals);
    await AsyncStorage.setItem(storageKey, JSON.stringify(existingMeals));
    console.log('Successfully saved food to log');

  } catch (error) {
    console.error('Error saving food analysis:', error);
    throw new Error('Failed to save food to log');
  }
};
