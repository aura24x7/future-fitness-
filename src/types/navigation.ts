import { NavigatorScreenParams } from '@react-navigation/native';
import { FoodAnalysisResult } from './food';

export type TabParamList = {
  Dashboard: undefined;
  Groups: undefined;
  Profile: undefined;
  ProfileGroups: undefined;
  FoodScanner: undefined;
  FoodTextInput: undefined;
};

export type RootStackParamList = {
  Dashboard: undefined;
  Login: undefined;
  Register: undefined;
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Onboarding: undefined;
  FoodScanner: undefined;
  FoodTextInput: undefined;
  Analytics: undefined;
  ProfileGroups: undefined;
  Location: undefined;
  TrackMeal: undefined;
  ScanFood: undefined;
  ScannedFoodDetails: {
    imageUri?: string;
    imageBase64?: string;
    result?: any;
    source?: 'image' | 'text';
  };
  GroupDetails: undefined;
  CreateGroup: undefined;
  InviteMembers: undefined;
  ManageInvites: undefined;
  AddIndividual: undefined;
  Main: undefined;
  WeightGoal: undefined;
  WeightTargetDate: undefined;
  Workouts: undefined;
  WorkoutPlan: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Meals: undefined;
  Social: undefined;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
