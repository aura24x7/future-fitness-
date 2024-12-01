import { GeminiService } from './core/gemini.service';

export interface WorkoutPreferences {
  fitnessLevel: string;
  goals: string[];
  equipment: string[];
  duration: number;
  focusAreas: string[];
  limitations: string[];
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number | 'AMRAP';
  duration?: number;
  restBetweenSets: number;
  equipment: string[];
  instructions: string;
  targetMuscles: string[];
  difficulty: string;
  completed: boolean;
  calories: number;
}

export interface DailyWorkout {
  dayOfWeek: string;
  totalDuration: number;
  totalCalories: number;
  focusArea: string;
  exercises: Exercise[];
  completed: boolean;
  notes: string;
}

export interface WeeklyWorkoutPlan {
  weeklyPlan: DailyWorkout[];
}

class WorkoutService {
  private geminiService: GeminiService;
  private defaultPreferences: WorkoutPreferences = {
    fitnessLevel: 'intermediate',
    goals: ['strength', 'endurance'],
    equipment: ['bodyweight'],
    duration: 45,
    focusAreas: ['full body'],
    limitations: []
  };

  constructor() {
    this.geminiService = GeminiService.getInstance();
  }

  private generateWorkoutPrompt(preferences: WorkoutPreferences, dayOfWeek: string): string {
    return `Generate a detailed workout plan for ${dayOfWeek} with the following preferences:
    - Fitness Level: ${preferences.fitnessLevel}
    - Goals: ${preferences.goals.join(', ')}
    - Available Equipment: ${preferences.equipment.join(', ')}
    - Duration: ${preferences.duration} minutes
    - Focus Areas: ${preferences.focusAreas.join(', ')}
    - Limitations/Injuries: ${preferences.limitations.join(', ') || 'None'}

    IMPORTANT: Respond ONLY with a valid JSON object following this EXACT structure:
    {
      "dayOfWeek": "${dayOfWeek}",
      "totalDuration": ${preferences.duration},
      "totalCalories": <number>,
      "focusArea": "<string>",
      "exercises": [
        {
          "name": "<string>",
          "sets": <number>,
          "reps": <number or "AMRAP">,
          "duration": <number, optional>,
          "restBetweenSets": <number>,
          "equipment": ["<string>"],
          "instructions": "<string>",
          "targetMuscles": ["<string>"],
          "difficulty": "<string>",
          "completed": false,
          "calories": <number>
        }
      ],
      "completed": false,
      "notes": "<string>"
    }

    Rules:
    1. Do not include any text or comments outside the JSON
    2. All numeric values must be numbers, not strings
    3. Arrays must be properly terminated
    4. No trailing commas
    5. Exercise names should be clear and specific
    6. Instructions should be detailed but concise
    7. Duration should be in minutes
    8. Calories should be realistic estimates`;
  }

  private getFocusAreasForDay(day: string): string[] {
    const focusAreaMap: { [key: string]: string[] } = {
      'Sunday': ['Rest', 'Recovery', 'Stretching'],
      'Monday': ['Chest', 'Triceps'],
      'Tuesday': ['Back', 'Biceps'],
      'Wednesday': ['Legs', 'Core'],
      'Thursday': ['Shoulders', 'Abs'],
      'Friday': ['Full Body', 'HIIT'],
      'Saturday': ['Cardio', 'Core']
    };
    return focusAreaMap[day] || ['Full Body'];
  }

  public async generateDailyWorkout(preferences: WorkoutPreferences, dayOfWeek: string): Promise<DailyWorkout> {
    try {
      const focusAreas = this.getFocusAreasForDay(dayOfWeek);
      const workoutPrefs = {
        ...this.defaultPreferences,
        ...preferences,
        focusAreas
      };

      const prompt = this.generateWorkoutPrompt(workoutPrefs, dayOfWeek);
      const response = await this.geminiService.generateStructuredResponse<DailyWorkout>(prompt, (data) => {
        // Validate response structure
        if (!data.exercises || !Array.isArray(data.exercises)) {
          throw new Error('Invalid workout plan structure');
        }
        return data as DailyWorkout;
      });

      return response;
    } catch (error) {
      console.error('Error generating daily workout:', error);
      throw error;
    }
  }

  public async generateWeeklyWorkoutPlan(preferences: WorkoutPreferences): Promise<WeeklyWorkoutPlan> {
    try {
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const weeklyPlan = await Promise.all(
        daysOfWeek.map(day => this.generateDailyWorkout(preferences, day))
      );

      return { weeklyPlan };
    } catch (error) {
      console.error('Error generating weekly workout plan:', error);
      throw error;
    }
  }
}

export const workoutService = new WorkoutService();
