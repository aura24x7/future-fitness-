import { GeminiService } from '../core/gemini.service';
import { AI_CONFIG } from '../../../config/ai.config';

export interface Exercise {
    name: string;
    sets: number;
    reps: string;
    duration: number;
    calories: number;
    muscleGroup: string;
    equipment: string;
    difficulty: string;
    instructions: string;
    formTips: string[];
    completed: boolean;
}

export interface WorkoutPlan {
    exercises: Exercise[];
    totalDuration: number;
    totalCalories: number;
    difficulty: string;
    targetMuscleGroups: string[];
    requiredEquipment: string[];
    warmupInstructions: string[];
    cooldownInstructions: string[];
}

export interface WorkoutPreferences {
    difficulty?: string;
    duration?: number;
    equipment?: string[];
    targetMuscles?: string[];
    fitnessGoals?: string[];
    limitations?: string[];
}

export class WorkoutService {
    private gemini: GeminiService;
    
    constructor() {
        this.gemini = GeminiService.getInstance();
    }

    private isWorkoutPlan(data: any): data is WorkoutPlan {
        return (
            Array.isArray(data.exercises) &&
            typeof data.totalDuration === 'number' &&
            typeof data.totalCalories === 'number' &&
            typeof data.difficulty === 'string' &&
            Array.isArray(data.targetMuscleGroups) &&
            Array.isArray(data.requiredEquipment) &&
            Array.isArray(data.warmupInstructions) &&
            Array.isArray(data.cooldownInstructions)
        );
    }

    async generateWorkout(preferences: WorkoutPreferences): Promise<WorkoutPlan> {
        const prompt = `
        Create a detailed workout plan with the following preferences:
        ${JSON.stringify(preferences, null, 2)}

        Requirements:
        - Include proper warm-up and cool-down instructions
        - Provide form tips for each exercise
        - Calculate estimated calories and duration
        - Consider equipment availability
        - Account for user's fitness level and limitations

        Respond with a JSON object that matches this structure:
        {
            "exercises": [
                {
                    "name": string,
                    "sets": number,
                    "reps": string,
                    "duration": number,
                    "calories": number,
                    "muscleGroup": string,
                    "equipment": string,
                    "difficulty": string,
                    "instructions": string,
                    "formTips": string[],
                    "completed": boolean
                }
            ],
            "totalDuration": number,
            "totalCalories": number,
            "difficulty": string,
            "targetMuscleGroups": string[],
            "requiredEquipment": string[],
            "warmupInstructions": string[],
            "cooldownInstructions": string[]
        }
        `;

        try {
            return await this.gemini.generateStructuredResponse<WorkoutPlan>(
                prompt,
                this.isWorkoutPlan
            );
        } catch (error) {
            console.error('Failed to generate workout:', error);
            return this.getFallbackPlan();
        }
    }

    async analyzeExerciseForm(imageData: string, exerciseName: string): Promise<string> {
        const prompt = `
        Analyze this exercise form for ${exerciseName}. Consider:
        1. Body positioning
        2. Common mistakes
        3. Areas for improvement
        4. Safety concerns
        
        Provide specific, actionable feedback.
        `;

        try {
            return await this.gemini.analyzeImage(imageData, prompt);
        } catch (error) {
            console.error('Failed to analyze exercise form:', error);
            throw error;
        }
    }

    private getFallbackPlan(): WorkoutPlan {
        return {
            exercises: [
                {
                    name: "Push-ups",
                    sets: 3,
                    reps: "10",
                    duration: 5,
                    calories: 30,
                    muscleGroup: "Chest",
                    equipment: "None",
                    difficulty: "Beginner",
                    instructions: "Start in a plank position, lower your body until your chest nearly touches the ground, then push back up.",
                    formTips: [
                        "Keep your core tight",
                        "Maintain a straight back",
                        "Position hands shoulder-width apart"
                    ],
                    completed: false
                }
            ],
            totalDuration: 30,
            totalCalories: 150,
            difficulty: "Beginner",
            targetMuscleGroups: ["Chest", "Shoulders", "Core"],
            requiredEquipment: ["None"],
            warmupInstructions: ["Light jogging in place for 2 minutes", "Arm circles for 30 seconds"],
            cooldownInstructions: ["Light stretching for 2 minutes", "Deep breathing exercises"]
        };
    }
}
