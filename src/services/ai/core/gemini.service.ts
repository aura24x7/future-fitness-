import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY, GEMINI_MODELS } from '../../../config/api.config';

// Type definitions
interface WorkoutPreferences {
    fitnessLevel?: string;
    goals?: string[];
    equipment?: string[];
    duration?: number;
    focusAreas?: string[];
    limitations?: string[];
    dayOfWeek?: string;
}

interface WorkoutGenerationResponse {
    id: string;
    name: string;
    description: string;
    duration: number;
    difficulty: string;
    focusAreas: string[];
    equipment: string[];
    exercises: Exercise[];
}

interface Exercise {
    id: string;
    name: string;
    description: string;
    sets: number;
    restBetweenSets: number;
    completed: boolean;
    equipment: string[];
    difficulty: string;
    type: 'duration' | 'repetition';
    duration?: number;
    reps?: number | 'AMRAP';
    weight?: number;
    caloriesPerRep?: number;
}

interface AIWorkoutPlan {
    dayOfWeek: string;
    totalDuration: number;
    totalCalories: number;
    focusArea: string;
    exercises: {
        name: string;
        sets: number;
        reps: number | "AMRAP";
        restBetweenSets: number;
        equipment: string[];
        instructions: string;
        targetMuscles: string[];
        difficulty: string;
        completed: boolean;
        calories: number;
    }[];
    completed: boolean;
    notes: string;
}

interface WeeklyWorkoutPlan {
    weeklyPlan: AIWorkoutPlan[];
}

export class GeminiService {
    private static instance: GeminiService;
    private model: any;

    private constructor() {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        this.model = genAI.getGenerativeModel({ model: GEMINI_MODELS.TEXT });
        console.log('✅ Gemini service initialized');
    }

    public static getInstance(): GeminiService {
        if (!GeminiService.instance) {
            GeminiService.instance = new GeminiService();
        }
        return GeminiService.instance;
    }

    private async generateText(prompt: string): Promise<string> {
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            console.log('Raw text response:', text); // Debug log
            return text;
        } catch (error: any) {
            console.error('Error generating text:', error);
            throw error;
        }
    }

    private cleanJsonText(text: string): string {
        console.log('Cleaning text:', text); // Debug input

        // Step 1: Remove markdown code blocks
        let cleaned = text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1');
        console.log('After removing code blocks:', cleaned);

        // Step 2: Remove backticks
        cleaned = cleaned.replace(/`/g, '');
        console.log('After removing backticks:', cleaned);

        // Step 3: Find JSON content
        const jsonMatch = cleaned.match(/(\{[\s\S]*\})/);
        if (!jsonMatch) {
            throw new Error('No JSON object found in response');
        }
        cleaned = jsonMatch[1];
        console.log('After extracting JSON:', cleaned);

        // Step 4: Clean up the JSON structure
        cleaned = cleaned
            .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces
            .replace(/[\r\n\t]/g, ' ') // Normalize whitespace
            .replace(/\s+/g, ' ') // Collapse multiple spaces
            .replace(/,\s*([\]}])/g, '$1') // Remove trailing commas
            .replace(/([{[,])\s*"([^"]+)"\s*:\s*"(true|false)"\s*([,}\]])/g, '$1"$2":$3$4') // Fix boolean strings
            .replace(/([{[,])\s*"([^"]+)"\s*:\s*"(\d+)"\s*([,}\]])/g, '$1"$2":$3$4'); // Fix number strings

        console.log('Final cleaned JSON:', cleaned); // Debug output
        return cleaned;
    }

    private async generateStructuredResponse<T>(prompt: string): Promise<T> {
        try {
            const jsonPrompt = `${prompt}

IMPORTANT: Respond with a valid JSON object only.
- No backticks
- No markdown formatting
- No code blocks
- No comments
- Must start with { and end with }
- All strings must be in double quotes
- Arrays and objects should not be quoted`;

            const text = await this.generateText(jsonPrompt);
            console.log('Initial response:', text);

            let jsonStr: string;
            try {
                // First attempt: direct parse
                jsonStr = text;
                console.log('Attempting direct parse of:', jsonStr);
                return JSON.parse(jsonStr);
            } catch (firstError) {
                console.log('Direct parse failed:', firstError);
                
                // Second attempt: clean and parse
                try {
                    jsonStr = this.cleanJsonText(text);
                    console.log('Attempting parse of cleaned JSON:', jsonStr);
                    return JSON.parse(jsonStr);
                } catch (secondError) {
                    console.error('Clean parse failed:', secondError);
                    
                    // Third attempt: try to extract just the JSON part
                    try {
                        const matches = text.match(/\{(?:[^{}]|{[^{}]*})*\}/g);
                        if (matches && matches.length > 0) {
                            jsonStr = matches[0];
                            console.log('Attempting parse of extracted JSON:', jsonStr);
                            return JSON.parse(jsonStr);
                        }
                    } catch (thirdError) {
                        console.error('Extract parse failed:', thirdError);
                    }
                    
                    throw new Error('Failed to parse response as JSON after multiple attempts');
                }
            }
        } catch (error) {
            console.error('Failed to generate structured response:', error);
            throw error;
        }
    }

    public async generateWorkoutPlan(preferences: WorkoutPreferences): Promise<AIWorkoutPlan> {
        try {
            const prompt = this.generateWorkoutPrompt(preferences);
            const data = await this.generateStructuredResponse<any>(prompt);
            
            // Parse and validate the response
            return {
                dayOfWeek: String(data.dayOfWeek || ''),
                totalDuration: Number(data.totalDuration || 0),
                totalCalories: Number(data.totalCalories || 0),
                focusArea: String(data.focusArea || ''),
                exercises: Array.isArray(data.exercises) ? data.exercises.map((exercise: any) => ({
                    name: String(exercise.name || ''),
                    sets: Number(exercise.sets || 0),
                    reps: exercise.reps === "AMRAP" ? "AMRAP" : Number(exercise.reps || 0),
                    restBetweenSets: Number(exercise.restBetweenSets || 60),
                    equipment: Array.isArray(exercise.equipment) ? exercise.equipment.map(String) : [],
                    instructions: String(exercise.instructions || ''),
                    targetMuscles: Array.isArray(exercise.targetMuscles) ? exercise.targetMuscles.map(String) : [],
                    difficulty: String(exercise.difficulty || 'intermediate'),
                    completed: Boolean(exercise.completed),
                    calories: Number(exercise.calories || 0)
                })) : [],
                completed: Boolean(data.completed),
                notes: String(data.notes || '')
            };
        } catch (error) {
            console.error('Error generating workout plan:', error);
            throw new Error('Failed to generate workout plan. Please try again.');
        }
    }

    private generateWorkoutPrompt(preferences: WorkoutPreferences): string {
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = preferences.dayOfWeek || daysOfWeek[new Date().getDay()];
        
        return `Create a workout plan with the following specifications:
Experience Level: ${preferences.fitnessLevel || 'intermediate'}
Duration: ${preferences.duration || 45} minutes
Equipment: ${preferences.equipment?.join(', ') || 'bodyweight only'}
Focus Areas: ${preferences.focusAreas?.join(', ') || 'full body'}
${preferences.limitations?.length ? `Limitations: ${preferences.limitations.join(', ')}` : ''}

Respond with a JSON object that follows this EXACT structure. IMPORTANT: ALL values must be in quotes, including numbers and booleans:
{
  "dayOfWeek": "${currentDay}",
  "totalDuration": "45",
  "totalCalories": "300",
  "focusArea": "example focus",
  "exercises": [
    {
      "name": "Exercise Name",
      "sets": "3",
      "reps": "10",
      "restBetweenSets": "60",
      "equipment": ["equipment1"],
      "instructions": "exercise instructions",
      "targetMuscles": ["muscle1"],
      "difficulty": "intermediate",
      "completed": "false",
      "calories": "50"
    }
  ],
  "completed": "false",
  "notes": ""
}

IMPORTANT:
1. Use EXACTLY this structure
2. ALL values (including numbers and booleans) must be in quotes
3. Only arrays and objects should not be quoted
4. For bodyweight exercises, use "reps": "AMRAP"
5. No trailing commas
6. No comments or additional text`;
    }

    public static async generateWeeklyWorkoutPlan(basePreferences: WorkoutPreferences): Promise<WeeklyWorkoutPlan> {
        const instance = GeminiService.getInstance();
        try {
            const weeklyPlan: AIWorkoutPlan[] = [];
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            
            for (const day of daysOfWeek) {
                const focusAreas = instance.getFocusAreasForDay(day);
                const preferences = {
                    ...basePreferences,
                    dayOfWeek: day,
                    focusAreas,
                };
                
                const workout = await instance.generateWorkoutPlan(preferences);
                weeklyPlan.push(workout);
            }
            
            return { weeklyPlan };
        } catch (error) {
            console.error('Error generating weekly workout plan:', error);
            throw error;
        }
    }

    private getFocusAreasForDay(day: string): string[] {
        // Define focus areas for each day of the week
        const focusAreaMap: { [key: string]: string[] } = {
            Sunday: ['Rest', 'Recovery', 'Stretching'],
            Monday: ['Chest', 'Triceps'],
            Tuesday: ['Back', 'Biceps'],
            Wednesday: ['Legs', 'Core'],
            Thursday: ['Shoulders', 'Abs'],
            Friday: ['Full Body', 'HIIT'],
            Saturday: ['Cardio', 'Core']
        };
        
        return focusAreaMap[day] || ['Full Body'];
    }
}
