import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useOnboarding } from '../contexts/OnboardingContext';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import SplashScreenComponent from '../components/SplashScreen';
import * as FirebaseCompat from '../utils/firebaseCompatibility';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ONBOARDING_COMPLETE_KEY } from '../constants/storage';
import { firestore as syncFirestore } from '../firebase/firebaseInit';
import { unlockAllNavigation } from '../utils/navigationUtils';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Onboarding Screens
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import NameInputScreen from '../screens/onboarding/NameInputScreen';
import BirthdayScreen from '../screens/onboarding/BirthdayScreen';
import GenderScreen from '../screens/onboarding/GenderScreen';
import HeightWeightScreen from '../screens/onboarding/HeightWeightScreen';
import ActivityLevelScreen from '../screens/onboarding/ActivityLevelScreen';
import DietaryPreferenceScreen from '../screens/onboarding/DietaryPreferenceScreen';
import WeightGoalScreen from '../screens/onboarding/WeightGoalScreen';
import WeightTargetDateScreen from '../screens/onboarding/WeightTargetDateScreen';
import LocationScreen from '../screens/onboarding/LocationScreen';
import WorkoutPreferenceScreen from '../screens/onboarding/WorkoutPreferenceScreen';
import FinalSetupScreen from '../screens/onboarding/FinalSetupScreen';
import UsernameSelectionScreen from '../screens/onboarding/UsernameSelectionScreen';

// Main App
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isOnboardingComplete, isLoading: onboardingLoading } = useOnboarding();
  const { user, isAuthenticated, loading: authLoading, isAuthReady, checkOnboardingStatus } = useAuth();
  const { profile, loading: profileLoading, forceProfileRefresh } = useProfile();
  const [initialRouteChecked, setInitialRouteChecked] = useState(false);
  const [initialRouteName, setInitialRouteName] = useState<string>('Login');
  
  // Clear any lingering navigation locks on mount
  useEffect(() => {
    console.log('[AppNavigator] Clearing any navigation locks on mount');
    unlockAllNavigation().catch(error => {
      console.error('[AppNavigator] Error clearing navigation locks:', error);
    });
  }, []);
  
  // Reset initialRouteChecked when user changes (especially on logout)
  useEffect(() => {
    if (!user) {
      console.log('[AppNavigator] User is null, resetting navigation state');
      setInitialRouteChecked(false);
      setInitialRouteName('Login');
    }
  }, [user]);
  
  // On initial load, perform additional checks to ensure we have the correct state
  useEffect(() => {
    const performInitialChecks = async () => {
      if (!user || initialRouteChecked) return;
      
      try {
        console.log('[AppNavigator] Performing initial authentication checks');
        
        // Check for registration in progress flag
        const registrationInProgress = await AsyncStorage.getItem('REGISTRATION_IN_PROGRESS');
        if (registrationInProgress) {
          console.log('[AppNavigator] Registration in progress, routing to Welcome');
          setInitialRouteName('Welcome');
          setInitialRouteChecked(true);
          return;
        }
        
        // Explicitly check AsyncStorage first (fastest and most reliable)
        const storedOnboardingComplete = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
        const isStoredComplete = storedOnboardingComplete === 'true';
        
        console.log('[AppNavigator] Onboarding complete in AsyncStorage:', isStoredComplete);
        
        // If we have confirmation in AsyncStorage, use that immediately
        if (isStoredComplete) {
          console.log('[AppNavigator] Found onboarding complete flag in AsyncStorage, routing to Main');
          setInitialRouteName('Main');
          setInitialRouteChecked(true);
          return;
        }
        
        // Check if the profile has onboardingComplete = true
        if (profile?.onboardingComplete === true) {
          console.log('[AppNavigator] Profile has onboardingComplete=true, routing to Main');
          await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
          setInitialRouteName('Main');
          setInitialRouteChecked(true);
          return;
        }
        
        // If user exists but we're not sure about onboarding, check profile in Firestore
        try {
          console.log('[AppNavigator] Checking Firestore for user profile');
          
          // Try compatibility layer first
          try {
            const docSnap = await FirebaseCompat.getDoc('users', user.uid);
            
            if (docSnap.exists) {
              const userData = docSnap.data();
              if (userData && userData.onboardingComplete === true) {
                console.log('[AppNavigator] Firestore profile has onboardingComplete=true, routing to Main');
                // Update auth context
                await checkOnboardingStatus();
                // Update AsyncStorage
                await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
                setInitialRouteName('Main');
                setInitialRouteChecked(true);
                return;
              }
            }
          } catch (compatError) {
            console.error('[AppNavigator] Error checking Firestore with compatibility layer:', compatError);
          }
        } catch (firestoreError) {
          console.error('[AppNavigator] Error checking Firestore:', firestoreError);
        }
        
        // If we get here, the user needs to complete onboarding
        console.log('[AppNavigator] User needs to complete onboarding, routing to Welcome');
        setInitialRouteName('Welcome');
        setInitialRouteChecked(true);
      } catch (error) {
        console.error('[AppNavigator] Error in initial checks:', error);
        // Default to login screen if there's an error
        setInitialRouteName('Login');
        setInitialRouteChecked(true);
      }
    };
    
    performInitialChecks();
  }, [user, profile, initialRouteChecked, checkOnboardingStatus]);

  // Refresh profile when auth state changes
  useEffect(() => {
    if (user && !profileLoading) {
      forceProfileRefresh().catch(error => 
        console.error('[AppNavigator] Error refreshing profile:', error)
      );
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    console.log('[AppNavigator] Auth state:', {
      authLoading,
      isAuthReady, 
      isAuthenticated,
      isOnboardingComplete,
      onboardingLoading,
      profileLoading,
      profileExists: !!profile,
      initialRouteChecked,
      initialRouteName,
      user: user ? 'User exists' : 'No user'
    });
  }, [
    user, 
    isAuthenticated, 
    isOnboardingComplete, 
    authLoading, 
    onboardingLoading, 
    isAuthReady, 
    profile, 
    profileLoading,
    initialRouteChecked,
    initialRouteName
  ]);

  if (authLoading || onboardingLoading || !isAuthReady || (user && !initialRouteChecked)) {
    console.log('[AppNavigator] Showing splash screen while loading');
    return <SplashScreenComponent isLoading={true} />;
  }

  // Update route name after checks
  if (user && !initialRouteChecked) {
    // Still performing checks
    return <SplashScreenComponent isLoading={true} />;
  }
  
  // Properly handle initialRouteName to respect Welcome for new users
  let safeInitialRouteName = initialRouteName;
  
  // If not authenticated, ensure we respect the initialRouteName decision
  if (!user) {
    safeInitialRouteName = 'Login';
  } else if (isAuthenticated && isOnboardingComplete) {
    // If user is authenticated and onboarding is complete, route to Main
    safeInitialRouteName = 'Main';
  } else if (initialRouteName === 'Welcome') {
    // For new users who need onboarding, preserve the Welcome route
    safeInitialRouteName = 'Welcome';
  } else if (initialRouteName === 'Main') {
    safeInitialRouteName = 'Main';
  } else {
    // Default to Login as fallback
    safeInitialRouteName = 'Login';
  }
  
  console.log('[AppNavigator] Setting initial route to:', safeInitialRouteName);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
      initialRouteName={safeInitialRouteName}
    >
      {/* Auth Flow - Always include these screens regardless of user state */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      
      {/* Onboarding Flow */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="NameInput" component={NameInputScreen} />
      <Stack.Screen name="Birthday" component={BirthdayScreen} />
      <Stack.Screen name="Gender" component={GenderScreen} />
      <Stack.Screen name="HeightWeight" component={HeightWeightScreen} />
      <Stack.Screen name="DietaryPreference" component={DietaryPreferenceScreen} />
      <Stack.Screen name="WeightGoal" component={WeightGoalScreen} />
      <Stack.Screen name="WeightTargetDate" component={WeightTargetDateScreen} />
      <Stack.Screen name="Location" component={LocationScreen} />
      <Stack.Screen name="WorkoutPreference" component={WorkoutPreferenceScreen} />
      <Stack.Screen name="ActivityLevel" component={ActivityLevelScreen} />
      <Stack.Screen name="FinalSetup" component={FinalSetupScreen} />
      <Stack.Screen name="UsernameSelection" component={UsernameSelectionScreen} />
      
      {/* Main App - Always included for consistent navigation */}
      <Stack.Screen name="Main" component={MainNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
