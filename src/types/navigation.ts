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
  Welcome: undefined;
  NameInput: undefined;
  Birthday: undefined;
  Gender: undefined;
  HeightWeight: undefined;
  DietaryPreference: undefined;
  WeightGoal: undefined;
  Location: undefined;
  WorkoutPreference: undefined;
  Profile: undefined;
  Settings: undefined;
  TrackMeal: undefined;
  ScanFood: undefined;
  AddIndividual: undefined;
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
