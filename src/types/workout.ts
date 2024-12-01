// Base Exercise Interface
export interface BaseExercise {
  id: string;
  name: string;
  description?: string;
  sets: number;
  restBetweenSets?: number;
  completed: boolean;
  notes?: string;
  muscleGroup?: string;
  equipment?: string[];
  difficulty?: string;
  duration?: number;
  caloriesPerRep?: number;
}

// Repetition-based Exercise
export interface RepetitionExercise extends BaseExercise {
  type: 'repetition';
  reps: number | 'AMRAP';  // Allow both number and AMRAP
  weight?: number;
}

// Duration-based Exercise
export interface DurationExercise extends BaseExercise {
  type: 'duration';
  duration: number;  // Duration in seconds
}

// Combined Exercise Type
export type Exercise = RepetitionExercise | DurationExercise;

// Workout Log Interface
export interface WorkoutLog {
  id: string;
  name: string;
  type: 'strength' | 'cardio' | 'Gemini';
  exercises: Exercise[];
  timestamp: number;
  date: string;
  duration: number;
  calories: number;
  baseCalories: number;
  completed: boolean;
  completedExercises: number;
  totalExercises: number;
}

// Workout Stats Interface
export interface WorkoutStats {
  totalCaloriesBurned: number;
  totalDuration: number;
  completedWorkouts: number;
  averageCaloriesPerWorkout?: number;
}

// Weekly Workout Plan Interface
export interface WeeklyWorkoutPlan {
  weeklyPlan: AIWorkoutPlan[];
}

// AI Generated Workout Plan Interface
export interface AIWorkoutPlan {
  id: string;
  name: string;
  description?: string;
  dayOfWeek: string; // Changed from number to string (e.g., "Monday")
  date?: string; // Made optional since we'll primarily use dayOfWeek
  focusArea: string;
  difficulty?: string;
  equipment?: string[];
  totalDuration: number;
  totalCalories: number;
  completedDuration: number;
  completedCalories: number;
  completedExercises: number;
  exercises: Exercise[];
}

// Workout Generation Preferences Interface
export interface WorkoutPreferences {
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  goals?: string[];
  equipment?: string[];
  duration?: number;
  focusAreas?: string[];
  limitations?: string[];
  dayOfWeek?: string; // Changed from number to string
}

// Workout Generation Response Interface
export interface WorkoutGenerationResponse {
  id: string;
  name: string;
  description: string;
  duration: number;
  difficulty: string;
  focusAreas: string[];
  equipment: string[];
  exercises: {
    id: string;
    name: string;
    description: string;
    sets: number;
    restBetweenSets?: number;
    completed: boolean;
    type: 'repetition' | 'duration';
    reps?: number | 'AMRAP';
    duration?: number;
    equipment?: string[];
    difficulty?: string;
  }[];
}
