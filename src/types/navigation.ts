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
  Welcome: undefined;
  NameInput: undefined;
  Birthday: undefined;
  Gender: undefined;
  HeightWeight: undefined;
  FitnessGoal: undefined;
  ActivityLevel: undefined;
  DietaryPreference: undefined;
  WeightGoal: undefined;
  WorkoutPreference: undefined;
  FinalSetup: undefined;
  Login: undefined;
  Register: undefined;
  Main: NavigatorScreenParams<TabParamList>;
  MainTabs: undefined;
  TrackMeal: undefined;
  TrackWater: undefined;
  CreateWorkout: undefined;
  AddCustomMeal: undefined;
  WorkoutDetails: { workoutId: string };
  AddCustomWorkout: undefined;
  FoodScanner: undefined;
  ScannedFoodDetails: { foodData: any };
  CreateGroup: undefined;
  GroupDetails: { groupId: string };
  InviteMembers: { groupId: string };
  ManageInvites: { groupId: string };
  GroupWorkouts: { groupId: string };
  SelectWorkout: undefined;
  ShareWorkout: { workoutId: string };
  GroupAnalytics: { groupId: string };
  GroupChallenges: { groupId: string };
  ProfileGroups: undefined;
  AddIndividual: undefined;
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
