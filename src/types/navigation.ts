import { Exercise } from '../services/geminiService';
import { Meal } from '../services/mealPlanService';
import { MealLog } from '../types/calorie';
import { AIWorkoutPlan } from './workout';

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Register: undefined;
  TrackMeal: undefined;
  TrackWater: undefined;
  Welcome: undefined;
  FoodLog: { newMeal?: Meal };
  Progress: undefined;
  Profile: undefined;
  Workout: { newExercise?: Exercise };
  ShareWorkout: {
    workoutPlan: AIWorkoutPlan[];
    currentUserId: string;
    currentUserName: string;
  };
  AddCustomWorkout: { setCustomExercise?: (exercise: Exercise) => void };
  AddCustomMeal: {
    meal?: MealLog;
    onSave: (newMeal: MealLog) => Promise<void>;
    selectedDate: string;
    isEditing?: boolean;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
    interface EventListenerMap {
      customExerciseAdd: { data: Exercise };
    }
  }
}
