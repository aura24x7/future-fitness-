import { Exercise } from '../services/geminiService';
import { Meal } from '../services/mealPlanService';
import { MealLog } from '../types/calorie';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  TrackMeal: undefined;
  TrackWater: undefined;
  Welcome: undefined;
  FoodLog: { newMeal?: Meal };
  Progress: undefined;
  Profile: undefined;
  Workout: { newExercise?: Exercise };
  AddCustomWorkout: { setCustomExercise?: (exercise: Exercise) => void };
  AddCustomMeal: {
    meal?: MealLog;
    onSave: (newMeal: MealLog) => Promise<void>;
    selectedDate: string;
    isEditing?: boolean;
  };
  Groups: {
    onGroupSelect?: (groupId: string) => void;
  };
  GroupDetails: {
    groupId: string;
  };
  CreateGroup: undefined;
  ShareWorkout: {
    groupId: string;
    workout: {
      id: string;
      name: string;
      exercises: {
        name: string;
        sets: number;
        reps: number;
        weight?: number;
      }[];
      duration: number;
      calories: number;
    };
  };
  ShareWorkoutPlan: {
    plan: SharedWorkoutPlan;
  };
  SelectRecipients: {
    onSelect: (recipientIds: string[]) => void;
  };
  QRScanner: undefined;
  WorkoutPlanPreview: {
    plan: SharedWorkoutPlan;
    fromQR?: boolean;
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
