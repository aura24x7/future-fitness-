import { GeminiService } from './core/gemini.service';

export interface Exercise {
    name: string;
    sets: number;
    reps: string;
    duration?: number;
    calories?: number;
    equipment?: string;
    difficulty?: string;
    muscleGroup?: string;
    instructions?: string;
}

export interface WorkoutPlan {
    exercises: Exercise[];
    totalDuration: number;
    difficulty: string;
    targetMuscleGroups: string[];
    requiredEquipment: string[];
}

export class WorkoutGenerator {
    private gemini: GeminiService;
    
    constructor() {
        this.gemini = GeminiService.getInstance();
    }

    private isWorkoutPlan(data: any): data is WorkoutPlan {
        return (
            Array.isArray(data.exercises) &&
            typeof data.totalDuration === 'number' &&
            typeof data.difficulty === 'string' &&
            Array.isArray(data.targetMuscleGroups) &&
            Array.isArray(data.requiredEquipment)
        );
    }

    async generateWorkout(preferences: {
        difficulty?: string;
        duration?: number;
        equipment?: string[];
        targetMuscles?: string[];
    }): Promise<WorkoutPlan> {
        const prompt = `
        Create a detailed workout plan with the following preferences:
        ${JSON.stringify(preferences, null, 2)}

        Respond with a valid JSON object that includes:
        - exercises: array of exercises with name, sets, reps, duration, equipment needed
        - totalDuration: total workout duration in minutes
        - difficulty: overall workout difficulty
        - targetMuscleGroups: array of muscle groups targeted
        - requiredEquipment: array of all equipment needed

        Format each exercise with:
        - name: clear exercise name
        - sets: number of sets
        - reps: string describing reps (e.g. "12 reps" or "30 seconds")
        - duration: time in minutes
        - equipment: equipment needed
        - difficulty: exercise difficulty level
        - muscleGroup: primary muscle group
        - instructions: clear form instructions
        `;

        try {
            return await this.gemini.generateStructuredResponse(prompt, this.isWorkoutPlan);
        } catch (error) {
            console.error('Failed to generate workout:', error);
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
                    equipment: "none",
                    difficulty: "beginner",
                    muscleGroup: "chest"
                },
                {
                    name: "Bodyweight Squats",
                    sets: 3,
                    reps: "15",
                    duration: 5,
                    calories: 40,
                    equipment: "none",
                    difficulty: "beginner",
                    muscleGroup: "legs"
                }
            ],
            totalDuration: 10,
            difficulty: "beginner",
            targetMuscleGroups: ["chest", "legs"],
            requiredEquipment: ["none"]
        };
    }
}
