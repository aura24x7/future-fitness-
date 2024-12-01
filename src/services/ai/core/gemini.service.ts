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
    private genAI: GoogleGenerativeAI;
    private model: any;
    private maxRetries = 3;
    private retryDelay = 1000;

    private constructor() {
        this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ 
            model: 'gemini-1.5-flash',
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.8,
                maxOutputTokens: 8192, // Increased token limit
            }
        });
        console.log('✅ Gemini service initialized');
    }

    public static getInstance(): GeminiService {
        if (!GeminiService.instance) {
            GeminiService.instance = new GeminiService();
        }
        return GeminiService.instance;
    }

    public async generateContent(prompt: string | any[], config?: any) {
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            
            if (!response) {
                throw new Error('No response from Gemini API');
            }
            
            return {
                response: {
                    text: () => {
                        const text = response.text();
                        console.log('Raw Gemini response:', text.substring(0, 100) + '...');
                        return text;
                    }
                }
            };
        } catch (error) {
            console.error('Error generating content:', error);
            throw error;
        }
    }

    public async generateText(prompt: string, retryCount = 0): Promise<string> {
        try {
            const result = await this.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            if (retryCount < this.maxRetries) {
                console.log(`Retrying... Attempt ${retryCount + 1} of ${this.maxRetries}`);
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this.generateText(prompt, retryCount + 1);
            }
            throw error;
        }
    }

    public async generateStructuredResponse<T>(prompt: string, retryCount = 0): Promise<T> {
        try {
            const result = await this.generateContent(prompt);
            const text = result.response.text();
            console.log('Full response length:', text.length);
            
            // Clean the response
            let cleanedText = text
                .replace(/```json\s*/g, '')  // Remove json blocks with any whitespace
                .replace(/```\s*/g, '')      // Remove backticks with any whitespace
                .trim()
                .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
                .replace(/[^\x20-\x7E]/g, '');
            
            // Extract JSON object if wrapped in text
            const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON object found in response');
            }
            
            cleanedText = jsonMatch[0];
            
            // Validate JSON structure before parsing
            try {
                const parsed = JSON.parse(cleanedText);
                console.log('Successfully parsed JSON structure');
                return parsed as T;
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                console.error('Failed JSON text:', cleanedText.substring(0, 200) + '...');
                throw parseError;
            }
        } catch (error) {
            if (retryCount < this.maxRetries) {
                console.log(`Retrying... (${retryCount + 1}/${this.maxRetries})`);
                // Add exponential backoff
                await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, retryCount)));
                return this.generateStructuredResponse<T>(prompt, retryCount + 1);
            }
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
        
        return `Generate a workout plan with these specifications:
- ID: ${randomSeed}
- Level: ${preferences.fitnessLevel || 'intermediate'}
- Duration: ${preferences.duration || 45} minutes
- Equipment: ${preferences.equipment?.join(', ') || 'bodyweight only'}
- Focus: ${preferences.focusAreas?.join(', ') || 'full body'}
${preferences.limitations?.length ? `- Limitations: ${preferences.limitations.join(', ')}` : ''}

The response MUST follow this EXACT structure:
{
  "dayOfWeek": "Monday",
  "totalDuration": 45,
  "totalCalories": 300,
  "focusArea": "Chest",
  "exercises": [
    {
      "name": "Push-ups",
      "sets": 3,
      "reps": 12,
      "restBetweenSets": 60,
      "equipment": ["none"],
      "instructions": "Start in plank position...",
      "targetMuscles": ["chest", "triceps"],
      "difficulty": "intermediate",
      "completed": false,
      "calories": 50
    }
  ],
  "completed": false,
  "notes": "Remember to warm up properly"
}

IMPORTANT: 
- Numeric values (sets, reps, etc.) must NOT be in quotes
- Boolean values (completed) must be true/false, NOT strings
- Arrays must contain properly formatted items
- All fields are required`;
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

    private validateJson(jsonString: string): any {
        try {
            const parsed = JSON.parse(jsonString);
            
            // Validate basic structure
            if (typeof parsed !== 'object' || parsed === null) {
                throw new Error('JSON must be an object');
            }

            // Recursively validate all values
            this.validateJsonValues(parsed);

            return parsed;
        } catch (error) {
            throw new Error(`JSON validation failed: ${error.message}\nJSON string: ${jsonString}`);
        }
    }

    private validateJsonValues(obj: any, path: string = ''): void {
        if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
                this.validateJsonValues(item, `${path}[${index}]`);
            });
        } else if (typeof obj === 'object' && obj !== null) {
            for (const [key, value] of Object.entries(obj)) {
                const newPath = path ? `${path}.${key}` : key;
                
                // Validate property name
                if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
                    console.warn(`Warning: Property name "${key}" at path "${path}" may cause issues. Consider using camelCase.`);
                }

                // Validate value
                if (value === undefined) {
                    throw new Error(`Undefined value found at path: ${newPath}`);
                }
                if (value === null) {
                    console.warn(`Warning: Null value found at path: ${newPath}`);
                }
                if (typeof value === 'number' && !isFinite(value)) {
                    throw new Error(`Invalid number found at path: ${newPath}`);
                }

                this.validateJsonValues(value, newPath);
            }
        }
    }

    private cleanJsonText(text: string): string {
        // Remove markdown code blocks
        text = text.replace(/```json\n|\n```|```/g, '');
        
        try {
            // Try to parse as is first
            JSON.parse(text);
            return text;
        } catch (e) {
            try {
                // Extract JSON content
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    throw new Error('No valid JSON object found in response');
                }
                
                let cleanedText = jsonMatch[0];

                // Fix common JSON issues
                cleanedText = cleanedText
                    // Remove comments
                    .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
                    // Fix quotes
                    .replace(/[\u201C\u201D\u2018\u2019]/g, '"')
                    // Remove trailing commas
                    .replace(/,(\s*[}\]])/g, '$1')
                    // Quote unquoted keys
                    .replace(/([{,]\s*)([\w-]+)(\s*:)/g, '$1"$2"$3')
                    // Fix boolean values
                    .replace(/"true"/gi, 'true')
                    .replace(/"false"/gi, 'false')
                    // Fix numeric values
                    .replace(/"(-?\d+\.?\d*)"(?!\s*[,}\]])/g, '$1')
                    // Remove extra whitespace
                    .replace(/\s+/g, ' ')
                    .trim();

                // Validate the cleaned JSON
                JSON.parse(cleanedText);
                return cleanedText;
            } catch (error) {
                console.error('Failed to clean JSON text:', error);
                throw new Error('Failed to parse or clean JSON response');
            }
        }
    }
}
