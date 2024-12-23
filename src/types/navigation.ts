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
  // Onboarding screens
  Welcome: undefined;
  NameInput: undefined;
  Birthday: undefined;
  Gender: undefined;
  HeightWeight: undefined;
  DietaryPreference: undefined;
  WeightGoal: undefined;
  Location: undefined;
  WorkoutPreference: undefined;
  ActivityLevel: undefined;
  FinalSetup: undefined;

  // Main screens
  Dashboard: undefined;
  ProfileGroups: undefined;
  FoodScanner: undefined;
  Profile: undefined;
  
  // Group-related screens
  GroupDetails: { groupId: string };
  CreateGroup: undefined;
  InviteMembers: { groupId: string };
  ManageInvites: { groupId: string };
  AddIndividual: { groupId: string };
  
  // Food-related screens
  FoodTextInput: undefined;
  ScannedFoodDetails: {
    imageUri?: string;
    imageBase64?: string;
    result?: FoodAnalysisResult;
    source?: 'camera' | 'text';
  };

  // Settings
  Settings: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
