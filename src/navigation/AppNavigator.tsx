import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useOnboarding } from '../context/OnboardingContext';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

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

// Main App
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isOnboardingComplete, isLoading: onboardingLoading } = useOnboarding();
  const { user, isLoading: authLoading } = useAuth();

  if (authLoading || onboardingLoading) {
    return null; // Or a loading screen component
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
      initialRouteName={user ? (isOnboardingComplete ? 'Main' : 'Welcome') : 'Login'}
    >
      {/* Auth Flow */}
      {!user && (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
      
      {/* Onboarding Flow - Only shown for authenticated users who haven't completed onboarding */}
      {user && !isOnboardingComplete && (
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
      
      {/* Main App - Only shown for authenticated users who completed onboarding */}
      {user && isOnboardingComplete && (
        <Stack.Screen name="Main" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
