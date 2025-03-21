import { genAI } from '../../../config/gemini';
import { GEMINI_MODELS, GENERATION_CONFIG } from '../../../config/api.config';
import { FOOD_ANALYSIS_PROMPT } from './prompts';
import { FoodAnalysisResult, NutritionInfo } from '../../../types/food';

const DEFAULT_NUTRITION: NutritionInfo = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0
};

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryWithExponentialBackoff = async <T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = INITIAL_RETRY_DELAY
): Promise<T> => {
  try {
    return await operation();
  } catch (err) {
    const error = err as Error;
    if (retries === 0 || !error.message.includes('503')) {
      throw error;
    }
    console.log(`Retrying operation. Attempts remaining: ${retries-1}`);
    await wait(delay);
    return retryWithExponentialBackoff(operation, retries - 1, delay * 2);
  }
};

export const analyzeFoodImage = async (imageBase64: string): Promise<FoodAnalysisResult> => {
  try {
    if (!imageBase64) {
      throw new Error('No image data provided');
    }

    const model = genAI.getGenerativeModel({ 
      model: GEMINI_MODELS.VISION,
      generationConfig: GENERATION_CONFIG
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

    // Get multiple analyses with retry mechanism
    const analysisPromises = Array(2).fill(null).map(async () => {
      return retryWithExponentialBackoff(async () => {
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        return response.text();
      });
    });

    const analysisResults = await Promise.all(analysisPromises);
    
    // Process and validate each result
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
              individualNutrition: DEFAULT_NUTRITION
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

    return validatedResult;
    
  } catch (error) {
    console.error('Error in food analysis:', error);
    throw new Error('Failed to analyze food image. Please try again.');
  }
};

interface RawAnalysisResult {
  foodName?: string;
  description?: string;
  itemBreakdown?: {
    totalItems?: number;
    itemList?: Array<{
      name?: string;
      quantity?: number;
      description?: string;
      ingredients?: string[];
      preparation?: string;
      individualNutrition?: Partial<NutritionInfo>;
    }>;
  };
  nutritionInfo?: Partial<NutritionInfo>;
  servingInfo?: {
    totalServings?: number;
    perItemServing?: string;
  };
  healthScore?: {
    overall?: number;
    breakdown?: {
      nutrientDensity?: number;
      portionSize?: number;
      ingredientQuality?: number;
      preparationMethod?: number;
    };
    recommendations?: string[];
  };
  dietaryInfo?: {
    isVegetarian?: boolean;
    isVegan?: boolean;
    isGlutenFree?: boolean;
    isDairyFree?: boolean;
  };
}

function combineAnalysisResults(results: RawAnalysisResult[]): RawAnalysisResult {
  const mostDetailedResult = results.reduce((prev, curr) => 
    (curr.itemBreakdown?.totalItems || 1) > (prev.itemBreakdown?.totalItems || 1) ? curr : prev
  );

  const totalNutrition = { ...DEFAULT_NUTRITION };

  if (mostDetailedResult.itemBreakdown?.itemList) {
    mostDetailedResult.itemBreakdown.itemList.forEach(item => {
      if (item.individualNutrition) {
        Object.keys(totalNutrition).forEach(key => {
          const nutritionKey = key as keyof NutritionInfo;
          totalNutrition[nutritionKey] += Number(item.individualNutrition?.[nutritionKey] || 0);
        });
      }
    });
  } else {
    results.forEach(result => {
      if (result.nutritionInfo) {
        Object.keys(totalNutrition).forEach(key => {
          const nutritionKey = key as keyof NutritionInfo;
          totalNutrition[nutritionKey] += Number(result.nutritionInfo?.[nutritionKey] || 0) / results.length;
        });
      }
    });
  }

  return {
    ...mostDetailedResult,
    nutritionInfo: totalNutrition
  };
}
