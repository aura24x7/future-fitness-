import { NavigatorScreenParams } from '@react-navigation/native';
import { FoodAnalysisResult } from './food';

export type TabParamList = {
  Dashboard: undefined;
  Workout: undefined;
  FoodLog: undefined;
  Progress: undefined;
  Groups: undefined;
  Profile: undefined;
  ProfileGroups: undefined;
  FoodScanner: undefined;
  FoodTextInput: undefined;
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
