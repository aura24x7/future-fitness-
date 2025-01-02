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
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Onboarding: undefined;
  FoodScanner: undefined;
  FoodTextInput: undefined;
  ScannedFoodDetails: {
    imageUri?: string;
    imageBase64?: string;
    result?: any;
    source?: 'image' | 'text';
  };
  ProfileGroups: undefined;
  GroupDetails: undefined;
  CreateGroup: undefined;
  InviteMembers: undefined;
  ManageInvites: undefined;
  AddIndividual: undefined;
  Main: undefined;
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
