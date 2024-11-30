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
    id: string;
    name: string;
    description: string;
    day: number;
    focusArea: string;
    difficulty: string;
    equipment: string[];
    totalDuration: number;
    totalCalories: number;
    completedDuration: number;
    completedCalories: number;
    exercises: Exercise[];
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
            console.log('🤖 Generating text response...');
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            if (!text) {
                throw new Error('Empty response from Gemini API');
            }
            
            return text.trim();
        } catch (error: any) {
            console.error('Generation error:', error.message);
            throw error;
        }
    }

    private extractJSONFromText(text: string): string {
        try {
            // Remove code block markers if present
            text = text.replace(/```json\n/g, '').replace(/```/g, '');
            
            // Remove any single-line comments
            text = text.replace(/\/\/.*$/gm, '');
            
            // Remove any multi-line comments
            text = text.replace(/\/\*[\s\S]*?\*\//g, '');
            
            // Try to find the JSON object
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON object found in response');
            }

            let jsonStr = jsonMatch[0];
            
            // Clean up any trailing commas before arrays or objects close
            jsonStr = jsonStr.replace(/,(\s*[\]}])/g, '$1');
            
            // Remove any remaining comments that might be inside the JSON
            jsonStr = jsonStr.replace(/\/\/[^\n]*\n/g, '\n').replace(/\/\*[\s\S]*?\*\//g, '');
            
            // Test if it's valid JSON
            JSON.parse(jsonStr); // This will throw if invalid
            
            return jsonStr;
        } catch (error) {
            console.error('Error extracting JSON:', error);
            throw error;
        }
    }

    private async generateStructuredResponse<T>(
        prompt: string,
        validator: (data: any) => T
    ): Promise<T> {
        try {
            // Add explicit instruction for JSON response
            const jsonPrompt = `${prompt}

IMPORTANT: Respond ONLY with a valid JSON object. Follow these rules:
1. Do not include any text, comments, or explanations outside the JSON.
2. Do not use comments inside the JSON.
3. Do not use trailing commas.
4. Format dates as "YYYY-MM-DD".
5. All numeric values should be numbers, not strings.
6. All arrays should be properly terminated.
7. The response should start with { and end with }.`;
            
            const text = await this.generateText(jsonPrompt);
            console.log('Raw response:', text); // Debug log
            
            // Try to extract JSON if it's wrapped in other text
            const jsonStr = this.extractJSONFromText(text);
            console.log('Extracted JSON:', jsonStr); // Debug log
            
            try {
                const data = JSON.parse(jsonStr);
                return validator(data);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                throw new Error('Failed to parse JSON response');
            }
        } catch (error) {
            console.error('Failed to generate structured response:', error);
            throw error;
        }
    }

    private static validateAndTransformExercise(exercise: any): Exercise {
        try {
            // Validate base fields
            const baseFields = ['id', 'name', 'description', 'sets'];
            for (const field of baseFields) {
                if (!(field in exercise)) {
                    throw new Error(`Exercise missing required field: ${field}`);
                }
            }

            const base = {
                id: exercise.id,
                name: exercise.name,
                description: exercise.description,
                sets: Number(exercise.sets), // Ensure sets is a number
                restBetweenSets: Number(exercise.restBetweenSets) || 60,
                completed: false,
                equipment: Array.isArray(exercise.equipment) ? exercise.equipment : [],
                difficulty: exercise.difficulty || 'intermediate'
            };

            // Handle duration-based exercises
            if ('duration' in exercise && exercise.duration) {
                return {
                    ...base,
                    type: 'duration',
                    duration: Number(exercise.duration)
                };
            }

            // Handle repetition-based exercises
            if (!('reps' in exercise)) {
                throw new Error(`Exercise ${exercise.name} missing required field: reps`);
            }

            // Convert reps to the correct format
            let reps: number | 'AMRAP';
            if (typeof exercise.reps === 'number') {
                reps = exercise.reps;
            } else if (typeof exercise.reps === 'string') {
                const repsUpper = exercise.reps.toUpperCase();
                if (repsUpper === 'AMRAP' || repsUpper.includes('AS MANY AS POSSIBLE')) {
                    reps = 'AMRAP';
                } else {
                    const parsedReps = parseInt(exercise.reps);
                    if (isNaN(parsedReps)) {
                        throw new Error(`Invalid reps value for exercise ${exercise.name}: ${exercise.reps}`);
                    }
                    reps = parsedReps;
                }
            } else {
                throw new Error(`Invalid reps type for exercise ${exercise.name}: ${typeof exercise.reps}`);
            }

            return {
                ...base,
                type: 'repetition',
                reps,
                weight: exercise.weight ? Number(exercise.weight) : undefined,
                caloriesPerRep: exercise.caloriesPerRep ? Number(exercise.caloriesPerRep) : 5
            };
        } catch (error) {
            console.error('Error validating exercise:', error);
            throw error;
        }
    }

    public static async generateWorkoutPlan(preferences?: WorkoutPreferences): Promise<AIWorkoutPlan> {
        const instance = GeminiService.getInstance();

        const prompt = `Generate a workout plan as a JSON object.

Instructions:
1. Respond ONLY with a valid JSON object
2. Do not include any text before or after the JSON
3. Follow this exact structure and types
4. For exercises, specify either 'reps' (number or "AMRAP") or 'duration' (in seconds)
5. All numeric values should be actual numbers, not strings

Required specifications:
${preferences ? `
- Fitness Level: ${preferences.fitnessLevel || 'intermediate'}
- Goals: ${preferences.goals?.join(', ') || 'general fitness'}
- Equipment: ${preferences.equipment?.join(', ') || 'basic gym equipment'}
- Duration: ${preferences.duration || 30} minutes
- Focus Areas: ${preferences.focusAreas?.join(', ') || 'full body'}
- Limitations: ${preferences.limitations?.join(', ') || 'none'}
` : 'Create a balanced full-body workout for an intermediate fitness level.'}

JSON Structure Example:
{
    "id": "workout-123",
    "name": "Sample Workout",
    "description": "A sample workout description",
    "duration": 45,
    "difficulty": "intermediate",
    "focusAreas": ["Chest", "Triceps"],
    "equipment": ["dumbbells", "bodyweight"],
    "exercises": [
        {
            "id": "exercise-1",
            "name": "Push-ups",
            "description": "Standard push-ups",
            "sets": 3,
            "reps": 10,
            "restBetweenSets": 60,
            "completed": false,
            "difficulty": "intermediate",
            "equipment": ["bodyweight"]
        },
        {
            "id": "exercise-2",
            "name": "Plank",
            "description": "Hold plank position",
            "sets": 3,
            "duration": 30,
            "restBetweenSets": 45,
            "completed": false,
            "difficulty": "intermediate",
            "equipment": ["bodyweight"]
        }
    ]
}`;

        try {
            const response = await instance.generateStructuredResponse<WorkoutGenerationResponse>(
                prompt,
                (data: any): WorkoutGenerationResponse => {
                    if (!data || typeof data !== 'object') {
                        throw new Error('Invalid response format');
                    }

                    const requiredFields = ['id', 'name', 'description', 'duration', 'difficulty', 'focusAreas', 'equipment', 'exercises'];
                    for (const field of requiredFields) {
                        if (!(field in data)) {
                            throw new Error(`Missing required field: ${field}`);
                        }
                    }

                    if (!Array.isArray(data.exercises) || data.exercises.length === 0) {
                        throw new Error('Exercises must be a non-empty array');
                    }

                    // Transform exercises with proper validation
                    data.exercises = data.exercises.map(GeminiService.validateAndTransformExercise);

                    return data as WorkoutGenerationResponse;
                }
            );

            // Transform the response into our internal AIWorkoutPlan format
            const workoutPlan: AIWorkoutPlan = {
                id: response.id,
                name: response.name,
                description: response.description,
                day: 0, // This will be set by the caller
                focusArea: response.focusAreas[0] || 'General',
                difficulty: response.difficulty,
                equipment: response.equipment,
                totalDuration: Number(response.duration),
                totalCalories: 300, // Default value
                completedDuration: 0,
                completedCalories: 0,
                exercises: response.exercises
            };

            return workoutPlan;
        } catch (error) {
            console.error('Error generating workout plan:', error);
            throw error;
        }
    }
}
