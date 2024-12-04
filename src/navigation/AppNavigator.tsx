import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useOnboarding } from '../context/OnboardingContext';
import { useAuth } from '../context/AuthContext';

// Onboarding Screens
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import NameInputScreen from '../screens/onboarding/NameInputScreen';
import BirthdayScreen from '../screens/onboarding/BirthdayScreen';
import GenderScreen from '../screens/onboarding/GenderScreen';
import HeightWeightScreen from '../screens/onboarding/HeightWeightScreen';
import FitnessGoalScreen from '../screens/onboarding/FitnessGoalScreen';
import ActivityLevelScreen from '../screens/onboarding/ActivityLevelScreen';
import DietaryPreferenceScreen from '../screens/onboarding/DietaryPreferenceScreen';
import WeightGoalScreen from '../screens/onboarding/WeightGoalScreen';
import LocationScreen from '../screens/onboarding/LocationScreen';
import WorkoutPreferenceScreen from '../screens/onboarding/WorkoutPreferenceScreen';
import FinalSetupScreen from '../screens/onboarding/FinalSetupScreen';

// Main Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TrackMealScreen from '../screens/TrackMealScreen';
import TrackWaterScreen from '../screens/TrackWaterScreen';
import CreateWorkoutScreen from '../screens/CreateWorkoutScreen';
import AddCustomMealScreen from '../screens/AddCustomMealScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isOnboardingComplete, isLoading } = useOnboarding();
  const { user } = useAuth();

  if (isLoading) {
    return null; // Or a loading screen component
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
      initialRouteName={isOnboardingComplete ? (user ? 'Main' : 'Login') : 'Welcome'}
    >
      {/* Onboarding Flow */}
      {!isOnboardingComplete && (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="NameInput" component={NameInputScreen} />
          <Stack.Screen name="Birthday" component={BirthdayScreen} />
          <Stack.Screen name="Gender" component={GenderScreen} />
          <Stack.Screen name="HeightWeight" component={HeightWeightScreen} />
          <Stack.Screen name="DietaryPreference" component={DietaryPreferenceScreen} />
          <Stack.Screen name="WeightGoal" component={WeightGoalScreen} />
          <Stack.Screen name="Location" component={LocationScreen} />
          <Stack.Screen name="WorkoutPreference" component={WorkoutPreferenceScreen} />
          <Stack.Screen name="ActivityLevel" component={ActivityLevelScreen} />
          <Stack.Screen name="FinalSetup" component={FinalSetupScreen} />
        </>
      )}
      
      {/* Auth Screens */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      
      {/* Main App Screens */}
      <Stack.Screen name="Main" component={MainNavigator} />
      <Stack.Screen 
        name="TrackMeal" 
        component={TrackMealScreen}
        options={{
          headerShown: true,
          title: 'Track Meal',
          headerStyle: {
            backgroundColor: '#4c669f',
          },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen 
        name="TrackWater" 
        component={TrackWaterScreen}
        options={{
          headerShown: true,
          title: 'Track Water',
          headerStyle: {
            backgroundColor: '#4c669f',
          },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen 
        name="CreateWorkout" 
        component={CreateWorkoutScreen}
        options={{
          headerShown: true,
          title: 'Create Workout',
          headerStyle: {
            backgroundColor: '#4c669f',
          },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen 
        name="AddCustomMeal" 
        component={AddCustomMealScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Settings',
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerTransparent: true,
          headerTintColor: '#6366f1',
          headerTitleStyle: {
            fontWeight: '600',
          },
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
