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

    private async generateText(prompt: string, retryCount = 0): Promise<string> {
        try {
            const result = await this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.8,
                    maxOutputTokens: 2048,
                },
                safetySettings: [
                    {
                        category: 'HARM_CATEGORY_HARASSMENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_HATE_SPEECH',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    }
                ]
            });

            const response = await result.response;
            return response.text();
        } catch (error: any) {
            console.error('Error generating text:', error);
            
            if (error.message?.includes('RECITATION') && retryCount < 3) {
                console.log(`Retrying due to RECITATION error (attempt ${retryCount + 1})`);
                // Add randomization to the prompt to avoid recitation
                const randomSeed = Math.random().toString(36).substring(7);
                const modifiedPrompt = `${prompt}\n\nNote: This is a unique request (${randomSeed}). Please provide a fresh, original response.`;
                // Wait before retry with exponential backoff
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
                return this.generateText(modifiedPrompt, retryCount + 1);
            }
            
            throw error;
        }
    }

    private async generateStructuredResponse<T>(prompt: string): Promise<T> {
        try {
            const jsonPrompt = `You are a JSON generator. Your task is to generate a valid JSON response based on the following request. 
        
REQUEST:
${prompt}

RESPONSE REQUIREMENTS:
1. Respond ONLY with a valid JSON object
2. Do not include any explanatory text
3. Do not use backticks, markdown, or code blocks
4. Start with { and end with }
5. Use double quotes for all strings
6. Do not quote arrays or objects
7. Ensure all JSON keys match the expected interface exactly

Example format:
{
    "key1": "value1",
    "key2": ["item1", "item2"],
    "key3": {
        "nestedKey": "nestedValue"
    }
}

Generate JSON response:`;

            const text = await this.generateText(jsonPrompt);
            console.log('Raw response:', text);

            // Remove any potential prefixes or suffixes
            let cleanedText = text.trim()
                .replace(/^[^{]*/, '') // Remove anything before the first {
                .replace(/[^}]*$/, ''); // Remove anything after the last }

            try {
                return JSON.parse(cleanedText);
            } catch (parseError) {
                console.error('Initial parse failed:', parseError);
                
                // Try to fix common JSON issues
                cleanedText = cleanedText
                    .replace(/[\u201C\u201D]/g, '"') // Replace smart quotes
                    .replace(/[\n\r\t]/g, ' ') // Remove newlines and tabs
                    .replace(/,\s*}/g, '}') // Remove trailing commas
                    .replace(/([{,]\s*)(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '$1"$3":') // Ensure property names are quoted
                    .replace(/:\s*(['"])?([^"'[\]{},\s]+)(['"])?([\s,}])/g, ':"$2"$4'); // Quote unquoted string values

                try {
                    return JSON.parse(cleanedText);
                } catch (finalError) {
                    console.error('Failed to parse cleaned JSON:', finalError);
                    throw new Error('Failed to generate valid JSON response. Please try again with more specific instructions.');
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
        const randomSeed = Math.random().toString(36).substring(7);
        
        return `Generate a unique workout plan (ID: ${randomSeed}) with these requirements:
Level: ${preferences.fitnessLevel || 'intermediate'}
Duration: ${preferences.duration || 45} minutes
Equipment: ${preferences.equipment?.join(', ') || 'bodyweight only'}
Focus: ${preferences.focusAreas?.join(', ') || 'full body'}
${preferences.limitations?.length ? `Limitations: ${preferences.limitations.join(', ')}` : ''}

Respond with a JSON object following this structure:
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
}`;
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
