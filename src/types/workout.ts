export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  distance?: number;
  completed: boolean;
  caloriesPerRep?: number;
}

export interface WorkoutLog {
  id: string;
  name: string;
  type: 'strength' | 'cardio';
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

export interface WorkoutStats {
  totalCaloriesBurned: number;
  totalDuration: number;
  completedWorkouts: number;
  totalWorkouts: number;
}
