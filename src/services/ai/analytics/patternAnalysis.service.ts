import { analyticsService } from '../../analyticsService';
import { GeminiService } from '../core/gemini.service';
import { MealLog } from '../../../types/meal';
import { WeightLog } from '../../../types/weight';
import { ActivityLog } from '../../../types/activity';

interface PatternInsight {
  pattern: string;
  confidence: number;
  recommendation: string;
  supportingData: string;
}

class PatternAnalysisService {
  private static instance: PatternAnalysisService;
  private geminiService: GeminiService;

  private constructor() {
    this.geminiService = GeminiService.getInstance();
  }

  static getInstance(): PatternAnalysisService {
    if (!PatternAnalysisService.instance) {
      PatternAnalysisService.instance = new PatternAnalysisService();
    }
    return PatternAnalysisService.instance;
  }

  async analyzeMealTimingPatterns(mealLogs: MealLog[]): Promise<PatternInsight[]> {
    try {
      const patterns: PatternInsight[] = [];
      
      // Group meals by time of day
      const mealsByHour = this.groupMealsByHour(mealLogs);
      
      // Analyze meal timing patterns
      const prompt = this.constructMealTimingPrompt(mealsByHour);
      const analysis = await this.geminiService.generateStructuredResponse<PatternInsight[]>(prompt);
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing meal timing patterns:', error);
      throw new Error('Failed to analyze meal timing patterns');
    }
  }

  async identifySuccessPatterns(
    mealLogs: MealLog[],
    weightLogs: WeightLog[],
    activityLogs: ActivityLog[]
  ): Promise<PatternInsight[]> {
    try {
      // Prepare data for analysis
      const prompt = await this.constructSuccessPatternPrompt(mealLogs, weightLogs, activityLogs);
      
      // Get AI analysis
      const analysis = await this.geminiService.generateStructuredResponse<PatternInsight[]>(prompt);
      
      return analysis;
    } catch (error) {
      console.error('Error identifying success patterns:', error);
      throw new Error('Failed to identify success patterns');
    }
  }

  async generatePersonalizedRecommendations(
    mealLogs: MealLog[],
    weightLogs: WeightLog[],
    activityLogs: ActivityLog[]
  ): Promise<string[]> {
    try {
      // Prepare data for recommendations
      const prompt = this.constructRecommendationsPrompt(mealLogs, weightLogs, activityLogs);
      
      // Get AI recommendations
      const recommendations = await this.geminiService.generateStructuredResponse<string[]>(prompt);
      
      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw new Error('Failed to generate recommendations');
    }
  }

  private groupMealsByHour(mealLogs: MealLog[]): Record<number, MealLog[]> {
    return mealLogs.reduce((acc, meal) => {
      const hour = new Date(meal.timestamp).getHours();
      if (!acc[hour]) acc[hour] = [];
      acc[hour].push(meal);
      return acc;
    }, {} as Record<number, MealLog[]>);
  }

  private constructMealTimingPrompt(mealsByHour: Record<number, MealLog[]>): string {
    return `Analyze the following meal timing data and identify patterns:
      ${JSON.stringify(mealsByHour, null, 2)}
      
      Please identify:
      1. Most common meal times
      2. Potential impact on weight goals
      3. Suggestions for optimal meal timing
      
      Format the response as JSON with the following structure:
      {
        "patterns": [
          {
            "pattern": "string",
            "confidence": number,
            "recommendation": "string",
            "supportingData": "string"
          }
        ]
      }`;
  }

  private async constructSuccessPatternPrompt(mealLogs: MealLog[], weightLogs: WeightLog[], activityLogs: ActivityLog[]): Promise<string> {
    // Analyze correlations between different metrics
    const weightCalorieCorrelation = await analyticsService.analyzeWeightCalorieCorrelation();
    const macroImpact = await analyticsService.analyzeMacroImpact();
    
    return `Analyze the following data to identify success patterns:
    
Weight Logs: ${JSON.stringify(weightLogs)}
Meal Logs: ${JSON.stringify(mealLogs)}
Activity Logs: ${JSON.stringify(activityLogs)}
Weight-Calorie Correlation: ${JSON.stringify(weightCalorieCorrelation)}
Macro Impact: ${JSON.stringify(macroImpact)}

Please identify patterns that correlate with successful outcomes in terms of weight management and fitness goals.
Return an array of PatternInsight objects with the following structure:
[{
  pattern: string;  // Description of the identified pattern
  confidence: number;  // Confidence level between 0 and 1
  recommendation: string;  // Actionable recommendation based on the pattern
  supportingData: string;  // Key data points supporting this pattern
}]`;
  }

  private constructRecommendationsPrompt(mealLogs: MealLog[], weightLogs: WeightLog[], activityLogs: ActivityLog[]): string {
    return `Based on the following user data:
    
Weight Logs: ${JSON.stringify(weightLogs)}
Meal Logs: ${JSON.stringify(mealLogs)}
Activity Logs: ${JSON.stringify(activityLogs)}

Generate personalized recommendations for improving fitness and nutrition habits.
Return an array of strings, where each string is a specific, actionable recommendation.
Focus on patterns in the data that suggest areas for improvement or habits to maintain.`;
  }

  private parseAIResponse(response: string): PatternInsight[] {
    try {
      const parsed = JSON.parse(response);
      return parsed.patterns || [];
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return [];
    }
  }

  private parseRecommendations(response: string): string[] {
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Error parsing recommendations:', error);
      return [];
    }
  }
}

export const patternAnalysisService = PatternAnalysisService.getInstance(); 