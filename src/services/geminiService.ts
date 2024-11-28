import { GoogleGenerativeAI } from '@google/generative-ai';
import Constants from 'expo-constants';

const GEMINI_API_KEY = Constants.expoConfig?.extra?.GEMINI_API_KEY || 'AIzaSyBAkq6elriSkPSj6Ab8xWY_sbtyZDNoUOg';

if (!GEMINI_API_KEY) {
  console.error('WARNING: GEMINI_API_KEY is not set. The AI features will not work.');
}

export const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Test the API connection
export const testGeminiConnection = async () => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please add your API key to the .env file.');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    await model.generateContent('Test connection');
    console.log('Successfully connected to Gemini API');
    return true;
  } catch (error) {
    console.error('Failed to connect to Gemini API:', error);
    if (error instanceof Error && error.message.includes('401')) {
      throw new Error('Invalid API key. Please check your GEMINI_API_KEY in the .env file.');
    }
    throw error;
  }
};

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  duration: number; // in minutes
  calories: number; // estimated calories burned
  notes?: string;
  completed: boolean;
  muscleGroup?: string;
  equipment?: string;
  difficulty?: string;
}

export interface WorkoutPlan {
  day: string;
  focusArea: string;
  totalDuration: number;
  totalCalories: number;
  completedDuration: number;
  completedCalories: number;
  exercises: Exercise[];
}

const PROMPT_TEMPLATE = `Generate a detailed 7-day workout plan. For each exercise, include specific sets, reps, estimated duration (in minutes), and estimated calories burned. Consider the following user preferences:

Fitness Level: {fitnessLevel}
Goals: {goals}
Limitations: {limitations}

Format the response as a valid JSON array with 7 objects, one for each day. Each object should have:
- day: Day of the week
- focusArea: Main focus of the workout
- totalDuration: Total workout duration in minutes
- totalCalories: Total calories burned
- completedDuration: Total completed workout duration in minutes
- completedCalories: Total completed calories burned
- exercises: Array of exercises with:
  - name: Exercise name
  - sets: Number of sets
  - reps: Rep range as string (e.g., "8-12" or "30 seconds")
  - duration: Estimated time per exercise in minutes
  - calories: Estimated calories burned per exercise
  - notes: Optional form tips or variations
  - completed: Completion status of the exercise
  - muscleGroup: Optional muscle group targeted
  - equipment: Optional equipment required
  - difficulty: Optional difficulty level

Example format:
[
  {
    "day": "Monday",
    "focusArea": "Upper Body Strength",
    "totalDuration": 45,
    "totalCalories": 350,
    "completedDuration": 0,
    "completedCalories": 0,
    "exercises": [
      {
        "name": "Push-ups",
        "sets": 3,
        "reps": "12-15",
        "duration": 5,
        "calories": 50,
        "notes": "Keep core tight, elbows at 45 degrees",
        "completed": false,
        "muscleGroup": "Chest, Shoulders, Triceps",
        "equipment": "None",
        "difficulty": "Intermediate"
      }
    ]
  }
]

Consider exercise intensity, rest periods, and proper form in the duration estimates. Calorie estimates should be realistic based on exercise intensity and duration.`;

export const geminiService = {
  generateWorkoutPlan: async (preferences?: {
    fitnessLevel: string;
    goals: string[];
    limitations: string[];
  }): Promise<WorkoutPlan[]> => {
    try {
      const defaultPreferences = {
        fitnessLevel: 'intermediate',
        goals: ['general fitness', 'strength'],
        limitations: [],
      };

      const userPreferences = preferences || defaultPreferences;
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = PROMPT_TEMPLATE
        .replace('{fitnessLevel}', userPreferences.fitnessLevel)
        .replace('{goals}', userPreferences.goals.join(', '))
        .replace('{limitations}', userPreferences.limitations.join(', ') || 'None');

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('Raw AI response:', text);

      // Try to extract and fix the JSON
      let jsonText = text;
      
      // Remove markdown code blocks if present
      jsonText = jsonText.replace(/```json\n?|\n?```/g, '');
      
      // Try to find a complete JSON array
      const jsonMatch = jsonText.match(/\[\s*{[\s\S]*}\s*\]/);
      
      if (!jsonMatch) {
        console.error('No valid JSON found in response, using fallback data');
        return getFallbackWorkoutPlan();
      }

      try {
        const workoutPlan = JSON.parse(jsonMatch[0]);
        
        // Validate the workout plan format
        if (!Array.isArray(workoutPlan) || workoutPlan.length !== 7) {
          console.error('Invalid workout plan format, using fallback data');
          return getFallbackWorkoutPlan();
        }

        // Validate each day's data
        const isValid = workoutPlan.every((day, index) => {
          if (!day.day || !Array.isArray(day.exercises)) {
            console.error(`Invalid day format at index ${index}`);
            return false;
          }
          return true;
        });

        if (!isValid) {
          console.error('Invalid workout plan structure, using fallback data');
          return getFallbackWorkoutPlan();
        }

        return workoutPlan;
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Attempted to parse:', jsonMatch[0]);
        return getFallbackWorkoutPlan();
      }
    } catch (error) {
      console.error('Error in geminiService:', error);
      return getFallbackWorkoutPlan();
    }
  }
};

// Fallback workout plan for when AI generation fails
const getFallbackWorkoutPlan = (): WorkoutPlan[] => {
  return [
    {
      day: 'Monday',
      focusArea: 'Upper Body',
      totalDuration: 30,
      totalCalories: 250,
      completedDuration: 0,
      completedCalories: 0,
      exercises: [
        {
          name: 'Push-ups',
          sets: 3,
          reps: '10-12',
          duration: 10,
          calories: 80,
          notes: 'Keep core tight',
          completed: false,
          muscleGroup: 'Chest, Shoulders, Triceps',
          equipment: 'None',
          difficulty: 'Intermediate'
        },
        {
          name: 'Dumbbell Rows',
          sets: 3,
          reps: '12-15',
          duration: 10,
          calories: 90,
          notes: 'Keep back straight',
          completed: false,
          muscleGroup: 'Back, Biceps',
          equipment: 'Dumbbells',
          difficulty: 'Intermediate'
        },
        {
          name: 'Shoulder Press',
          sets: 3,
          reps: '10-12',
          duration: 10,
          calories: 80,
          notes: 'Maintain good form',
          completed: false,
          muscleGroup: 'Shoulders',
          equipment: 'Dumbbells',
          difficulty: 'Intermediate'
        }
      ]
    },
    {
      day: 'Tuesday',
      focusArea: 'Lower Body',
      totalDuration: 30,
      totalCalories: 300,
      completedDuration: 0,
      completedCalories: 0,
      exercises: [
        {
          name: 'Bodyweight Squats',
          sets: 3,
          reps: '15-20',
          duration: 10,
          calories: 100,
          notes: 'Keep chest up',
          completed: false,
          muscleGroup: 'Legs, Glutes',
          equipment: 'None',
          difficulty: 'Intermediate'
        },
        {
          name: 'Lunges',
          sets: 3,
          reps: '12 each leg',
          duration: 10,
          calories: 100,
          notes: 'Step forward and back',
          completed: false,
          muscleGroup: 'Legs, Glutes',
          equipment: 'None',
          difficulty: 'Intermediate'
        },
        {
          name: 'Calf Raises',
          sets: 3,
          reps: '20',
          duration: 10,
          calories: 100,
          notes: 'Full range of motion',
          completed: false,
          muscleGroup: 'Calves',
          equipment: 'None',
          difficulty: 'Easy'
        }
      ]
    },
    {
      day: 'Wednesday',
      focusArea: 'Rest/Light Cardio',
      totalDuration: 20,
      totalCalories: 150,
      completedDuration: 0,
      completedCalories: 0,
      exercises: [
        {
          name: 'Walking',
          sets: 1,
          reps: '20 minutes',
          duration: 20,
          calories: 150,
          notes: 'Moderate pace',
          completed: false,
          muscleGroup: 'None',
          equipment: 'None',
          difficulty: 'Easy'
        }
      ]
    },
    {
      day: 'Thursday',
      focusArea: 'Core',
      totalDuration: 25,
      totalCalories: 200,
      completedDuration: 0,
      completedCalories: 0,
      exercises: [
        {
          name: 'Plank',
          sets: 3,
          reps: '30 seconds',
          duration: 5,
          calories: 50,
          notes: 'Keep body straight',
          completed: false,
          muscleGroup: 'Core',
          equipment: 'None',
          difficulty: 'Intermediate'
        },
        {
          name: 'Crunches',
          sets: 3,
          reps: '15-20',
          duration: 10,
          calories: 75,
          notes: 'Control movement',
          completed: false,
          muscleGroup: 'Core',
          equipment: 'None',
          difficulty: 'Intermediate'
        },
        {
          name: 'Russian Twists',
          sets: 3,
          reps: '20',
          duration: 10,
          calories: 75,
          notes: 'Rotate fully',
          completed: false,
          muscleGroup: 'Core',
          equipment: 'None',
          difficulty: 'Intermediate'
        }
      ]
    },
    {
      day: 'Friday',
      focusArea: 'Full Body',
      totalDuration: 35,
      totalCalories: 280,
      completedDuration: 0,
      completedCalories: 0,
      exercises: [
        {
          name: 'Burpees',
          sets: 3,
          reps: '10',
          duration: 10,
          calories: 100,
          notes: 'Full movement',
          completed: false,
          muscleGroup: 'Full Body',
          equipment: 'None',
          difficulty: 'Hard'
        },
        {
          name: 'Mountain Climbers',
          sets: 3,
          reps: '30 seconds',
          duration: 15,
          calories: 120,
          notes: 'Keep pace steady',
          completed: false,
          muscleGroup: 'Full Body',
          equipment: 'None',
          difficulty: 'Hard'
        },
        {
          name: 'Jump Rope',
          sets: 1,
          reps: '10 minutes',
          duration: 10,
          calories: 60,
          notes: 'Stay light on feet',
          completed: false,
          muscleGroup: 'Full Body',
          equipment: 'Jump Rope',
          difficulty: 'Hard'
        }
      ]
    },
    {
      day: 'Saturday',
      focusArea: 'Cardio',
      totalDuration: 30,
      totalCalories: 250,
      completedDuration: 0,
      completedCalories: 0,
      exercises: [
        {
          name: 'Jogging',
          sets: 1,
          reps: '30 minutes',
          duration: 30,
          calories: 250,
          notes: 'Steady pace',
          completed: false,
          muscleGroup: 'Full Body',
          equipment: 'None',
          difficulty: 'Intermediate'
        }
      ]
    },
    {
      day: 'Sunday',
      focusArea: 'Rest',
      totalDuration: 0,
      totalCalories: 0,
      completedDuration: 0,
      completedCalories: 0,
      exercises: []
    }
  ];
};
