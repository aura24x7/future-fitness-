import { Exercise } from '../services/geminiService';
import { Meal } from '../services/mealPlanService';
import { MealLog } from '../types/calorie';
import { AIWorkoutPlan } from './workout';
import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Dashboard: undefined;
  Workout: undefined;
  FoodLog: undefined;
  Progress: undefined;
  Groups: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  // Main screens
  Dashboard: undefined;
  ProfileGroups: undefined;
  FoodScanner: undefined;
  Profile: undefined;
  FoodLog: undefined;
  Progress: undefined;
  
  // Group-related screens
  GroupDetails: { groupId: string };
  CreateGroup: undefined;
  InviteMembers: { groupId: string };
  ManageInvites: undefined;
  AddIndividual: undefined;
  
  // Food-related screens
  ScannedFoodDetails: { foodId: string };
  
  // Settings
  Settings: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
    interface EventListenerMap {
      customExerciseAdd: { data: Exercise };
    }
  }
}
