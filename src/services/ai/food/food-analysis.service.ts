import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY, GEMINI_MODELS } from '../../../config/api.config';

interface FoodAnalysisResult {
  foodName: string;
  confidence: number;
  nutritionInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
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

const FOOD_ANALYSIS_PROMPT = `
You are a food analysis AI. First, determine if there is any food visible in the image.

If NO FOOD IS VISIBLE:
Return exactly this JSON: {"error": "No food detected in the image"}

If FOOD IS VISIBLE:
Analyze the food and return a JSON object with nutritional information using this structure:
{
  "foodName": string,
  "confidence": number,
  "nutritionInfo": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "fiber": number,
    "sugar": number
  },
  "ingredients": string[],
  "servingSize": string,
  "mealType": string,
  "healthyScore": number,
  "dietaryInfo": {
    "isVegetarian": boolean,
    "isVegan": boolean,
    "isGlutenFree": boolean,
    "isDairyFree": boolean
  }
}

IMPORTANT: 
1. Always respond with valid JSON
2. Do not include any other text or explanation
3. If you're unsure about the food or the image is unclear, still return {"error": "No food detected in the image"}
`;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const analyzeFoodImage = async (imageBase64: string): Promise<FoodAnalysisResult> => {
  try {
    console.log('Starting food analysis...');
    
    if (!imageBase64) {
      throw new Error('No image data provided');
    }

    console.log('Initializing Gemini model...');
    const model = genAI.getGenerativeModel({ model: GEMINI_MODELS.VISION });
    
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

    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response');
      throw new Error('No food detected in the image. Please try taking a picture of food.');
    }

    const cleanedText = jsonMatch[0].trim();
    console.log('Cleaned JSON:', cleanedText);
    
    try {
      const parsedResult = JSON.parse(cleanedText);
      console.log('Parsed result:', parsedResult);

      // If there's an error message in the response, throw it as a user-friendly error
      if (parsedResult.error) {
        throw new Error('No food detected in the image. Please try taking a picture of food.');
      }

      // Now we know we have a valid food analysis result
      // Validate required fields
      const requiredFields = ['foodName', 'nutritionInfo'];
      for (const field of requiredFields) {
        if (!parsedResult[field]) {
          throw new Error('No food detected in the image. Please try taking a picture of food.');
        }
      }

      // Validate nutrition info fields
      const requiredNutritionFields = ['calories', 'protein', 'carbs', 'fat'];
      for (const field of requiredNutritionFields) {
        if (typeof parsedResult.nutritionInfo[field] !== 'number') {
          throw new Error('No food detected in the image. Please try taking a picture of food.');
        }
      }

      // Create validated result with proper defaults
      const validatedResult: FoodAnalysisResult = {
        foodName: parsedResult.foodName,
        confidence: Math.max(0, Math.min(1, parsedResult.confidence || 0.8)),
        nutritionInfo: {
          calories: Math.max(0, parsedResult.nutritionInfo.calories || 0),
          protein: Math.max(0, parsedResult.nutritionInfo.protein || 0),
          carbs: Math.max(0, parsedResult.nutritionInfo.carbs || 0),
          fat: Math.max(0, parsedResult.nutritionInfo.fat || 0),
          fiber: Math.max(0, parsedResult.nutritionInfo.fiber || 0),
          sugar: Math.max(0, parsedResult.nutritionInfo.sugar || 0)
        },
        ingredients: Array.isArray(parsedResult.ingredients) ? parsedResult.ingredients : [],
        servingSize: parsedResult.servingSize || "1 serving",
        mealType: parsedResult.mealType || "snack",
        healthyScore: Math.max(1, Math.min(10, parsedResult.healthyScore || 5)),
        dietaryInfo: {
          isVegetarian: Boolean(parsedResult.dietaryInfo?.isVegetarian),
          isVegan: Boolean(parsedResult.dietaryInfo?.isVegan),
          isGlutenFree: Boolean(parsedResult.dietaryInfo?.isGlutenFree),
          isDairyFree: Boolean(parsedResult.dietaryInfo?.isDairyFree)
        }
      };

      return validatedResult;

    } catch (parseError) {
      console.error('Error processing response:', parseError);
      throw new Error('No food detected in the image. Please try taking a picture of food.');
    }

  } catch (error) {
    console.error('Error in food analysis:', error);
    
    // Always return a user-friendly error message
    if (error instanceof Error) {
      // If it's already our custom error message, pass it through
      if (error.message.includes('No food detected')) {
        throw error;
      }
    }
    
    // For any other error, return the standard no-food message
    throw new Error('No food detected in the image. Please try taking a picture of food.');
  }
};
