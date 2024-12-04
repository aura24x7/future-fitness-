import { genAI } from '../../../config/gemini';
import { GEMINI_MODELS } from '../../../constants/ai';
import { FOOD_ANALYSIS_PROMPT } from './prompts';
import { FoodAnalysisResult } from '../../../types/food';

const DEFAULT_NUTRITION = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0
};

export const analyzeFoodImage = async (imageBase64: string): Promise<FoodAnalysisResult> => {
  try {
    if (!imageBase64) {
      throw new Error('No image data provided');
    }

    // Initialize Gemini with specific configuration for precise analysis
    const model = genAI.getGenerativeModel({ 
      model: GEMINI_MODELS.VISION,
      generationConfig: {
        temperature: 0.2, // Lower temperature for more precise responses
        topK: 32,
        topP: 0.7,
        maxOutputTokens: 2048,
      }
    });

    // Prepare the analysis request
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
    
    // Process and validate each result
    const validResults = analysisResults
      .map(text => {
        try {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
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

    // Average the results and ensure we have total nutrition values
    const combinedResult = combineAnalysisResults(validResults);
    
    // Create the final validated result with total nutrition
    const validatedResult: FoodAnalysisResult = {
      foodName: combinedResult.foodName,
      description: combinedResult.description,
      itemBreakdown: combinedResult.itemBreakdown || {
        totalItems: 1,
        itemList: [{
          name: combinedResult.foodName,
          description: combinedResult.description,
          individualNutrition: combinedResult.totalNutrition
        }]
      },
      nutritionInfo: combinedResult.totalNutrition || DEFAULT_NUTRITION,
      confidence: Math.min(1, combinedResult.confidence || 0.8),
      servingInfo: {
        totalServings: combinedResult.itemBreakdown?.totalItems || 1,
        perItemServing: "1 regular serving"
      },
      dietaryInfo: {
        isVegetarian: combinedResult.dietaryInfo?.isVegetarian || false,
        isVegan: combinedResult.dietaryInfo?.isVegan || false,
        isGlutenFree: combinedResult.dietaryInfo?.isGlutenFree || false,
        isDairyFree: combinedResult.dietaryInfo?.isDairyFree || false
      }
    };

    console.log('Final validated result:', validatedResult);
    return validatedResult;

  } catch (error) {
    console.error('Error in food analysis:', error);
    throw new Error('Failed to analyze food image. Please try again.');
  }
};

function combineAnalysisResults(results: any[]): any {
  const numResults = results.length;
  
  // Get the result with the most items identified
  const mostDetailedResult = results.reduce((prev, curr) => 
    (curr.itemBreakdown?.totalItems || 1) > (prev.itemBreakdown?.totalItems || 1) ? curr : prev
  );

  // Combine nutrition values from all analyses
  const totalNutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0
  };

  // If we have itemBreakdown, use it to calculate total nutrition
  if (mostDetailedResult.itemBreakdown?.itemList) {
    mostDetailedResult.itemBreakdown.itemList.forEach(item => {
      Object.keys(totalNutrition).forEach(key => {
        totalNutrition[key] += Number(item.individualNutrition?.[key] || 0);
      });
    });
  } else {
    // Fallback to averaging the total nutrition values
    results.forEach(result => {
      Object.keys(totalNutrition).forEach(key => {
        totalNutrition[key] += Number(result.totalNutrition?.[key] || 0) / numResults;
      });
    });
  }

  return {
    ...mostDetailedResult,
    totalNutrition
  };
}
