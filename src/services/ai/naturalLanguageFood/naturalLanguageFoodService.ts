import { genAI } from '../../../config/gemini';
import { GEMINI_MODELS, GENERATION_CONFIG } from '../../../config/api.config';
import { NATURAL_LANGUAGE_FOOD_PROMPT } from './prompts';
import { 
  FoodAnalysisResult, 
  NutritionInfo, 
  FoodItem,
  createDefaultNutritionInfo 
} from '../../../types/food';

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

export class NaturalLanguageFoodService {
  private static instance: NaturalLanguageFoodService;

  private constructor() {}

  public static getInstance(): NaturalLanguageFoodService {
    if (!NaturalLanguageFoodService.instance) {
      NaturalLanguageFoodService.instance = new NaturalLanguageFoodService();
    }
    return NaturalLanguageFoodService.instance;
  }

  public async analyzeFoodText(description: string): Promise<FoodAnalysisResult> {
    try {
      if (!description?.trim()) {
        throw new Error('No food description provided');
      }

      // Initialize Gemini with specific configuration for precise analysis
      const model = genAI.getGenerativeModel({ 
        model: GEMINI_MODELS.TEXT,
        generationConfig: GENERATION_CONFIG
      });

      // Prepare the analysis request with the food description
      const prompt = `${NATURAL_LANGUAGE_FOOD_PROMPT}\n\nFood Description: "${description}"`;

      // Get multiple analyses for better accuracy
      const analysisPromises = Array(2).fill(null).map(async () => {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      });

      const analysisResults = await Promise.all(analysisPromises);
      
      // Process and validate each result
      const validResults = analysisResults
        .map((text: string) => {
          try {
            const cleanedText = text
              .replace(/```json\n?|\n?```/g, '')
              .replace(/[\u201C\u201D\u2018\u2019]/g, '"')
              .replace(/\n/g, '')
              .trim();

            const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) as RawAnalysisResult : null;
          } catch (e) {
            console.warn('Failed to parse result:', e);
            return null;
          }
        })
        .filter((result): result is RawAnalysisResult => result !== null);

      if (validResults.length === 0) {
        throw new Error('No valid analysis results obtained');
      }

      // Combine and validate results
      const combinedResult = this.combineAnalysisResults(validResults);
      
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
              } as FoodItem))
            : [{
                name: String(combinedResult.foodName || 'Unknown Item'),
                quantity: 1,
                description: String(combinedResult.description || ''),
                ingredients: [],
                preparation: '',
                individualNutrition: createDefaultNutritionInfo()
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
      console.error('Error analyzing food text:', error);
      throw new Error('Failed to analyze food description. Please try again.');
    }
  }

  private combineAnalysisResults(results: RawAnalysisResult[]): RawAnalysisResult {
    // Get the most detailed result
    const mostDetailedResult = results.reduce((prev, curr) => 
      (curr.itemBreakdown?.totalItems || 1) > (prev.itemBreakdown?.totalItems || 1) ? curr : prev
    );

    // Combine nutrition values
    const totalNutrition = createDefaultNutritionInfo();

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
}

export const naturalLanguageFoodService = NaturalLanguageFoodService.getInstance(); 