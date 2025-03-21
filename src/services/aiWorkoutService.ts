import { Exercise } from '../types/workout';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

interface CalorieEstimationResponse {
  calories: number;
  confidence: number;
  explanation: string;
}

export class AIWorkoutService {
  private static instance: AIWorkoutService;
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  private constructor() {}

  public static getInstance(): AIWorkoutService {
    if (!AIWorkoutService.instance) {
      AIWorkoutService.instance = new AIWorkoutService();
    }
    return AIWorkoutService.instance;
  }

  private buildPrompt(exercise: Exercise): string {
    return `Please estimate the calories burned for the following exercise:
Exercise Name: ${exercise.exerciseName}
Sets: ${exercise.sets}
Reps: ${exercise.reps}
Duration: ${exercise.workoutDuration || 'Not specified'} minutes
Intensity Level: ${exercise.intensityLevel || 'Not specified'}
Instructions: ${exercise.instructions}

Please provide the response in the following JSON format:
{
  "calories": number (estimated calories burned),
  "confidence": number (between 0 and 1, indicating confidence in the estimation),
  "explanation": string (brief explanation of the estimation)
}`;
  }

  public async estimateCalories(exercise: Exercise): Promise<CalorieEstimationResponse> {
    try {
      const prompt = this.buildPrompt(exercise);
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI');
      }

      const parsedResponse = JSON.parse(jsonMatch[0]) as CalorieEstimationResponse;

      // Validate the response
      if (!parsedResponse.calories || !parsedResponse.confidence || !parsedResponse.explanation) {
        throw new Error('Invalid response format from AI');
      }

      return parsedResponse;
    } catch (error) {
      console.error('Error estimating calories:', error);
      throw new Error('Failed to estimate calories. Please enter manually.');
    }
  }
} 