import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Onboarding Screens
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import NameInputScreen from '../screens/onboarding/NameInputScreen';
import BirthdayScreen from '../screens/onboarding/BirthdayScreen';
import GenderScreen from '../screens/onboarding/GenderScreen';
import HeightWeightScreen from '../screens/onboarding/HeightWeightScreen';
import FitnessGoalScreen from '../screens/onboarding/FitnessGoalScreen';
import ActivityLevelScreen from '../screens/onboarding/ActivityLevelScreen';
import DietaryPreferenceScreen from '../screens/onboarding/DietaryPreferenceScreen';
import WorkoutPreferenceScreen from '../screens/onboarding/WorkoutPreferenceScreen';
import FinalSetupScreen from '../screens/onboarding/FinalSetupScreen';

// Main Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TrackMealScreen from '../screens/TrackMealScreen';
import TrackWaterScreen from '../screens/TrackWaterScreen';
import CreateWorkoutScreen from '../screens/CreateWorkoutScreen';
import AddCustomMealScreen from '../screens/AddCustomMealScreen';
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
      initialRouteName="Welcome"
    >
      {/* Onboarding Flow */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="NameInput" component={NameInputScreen} />
      <Stack.Screen name="Birthday" component={BirthdayScreen} />
      <Stack.Screen name="Gender" component={GenderScreen} />
      <Stack.Screen name="HeightWeight" component={HeightWeightScreen} />
      <Stack.Screen name="FitnessGoal" component={FitnessGoalScreen} />
      <Stack.Screen name="ActivityLevel" component={ActivityLevelScreen} />
      <Stack.Screen name="DietaryPreference" component={DietaryPreferenceScreen} />
      <Stack.Screen name="WorkoutPreference" component={WorkoutPreferenceScreen} />
      <Stack.Screen name="FinalSetup" component={FinalSetupScreen} />
      
      {/* Main App Screens */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
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
    </Stack.Navigator>
  );
};

export default AppNavigator;
