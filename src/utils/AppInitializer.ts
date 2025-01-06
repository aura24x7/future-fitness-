import * as SplashScreen from 'expo-splash-screen';
import { auth } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import * as Font from 'expo-font';

// Constants
const AUTH_PERSISTENCE_KEY = '@auth_persistence';
const AUTH_CREDENTIALS_KEY = '@auth_credentials';
const AUTH_REFRESH_KEY = '@auth_refresh';
const INITIALIZATION_TIMEOUT = 10000; // 10 seconds
const TOKEN_REFRESH_INTERVAL = 1000 * 60 * 50; // 50 minutes
const MINIMUM_SPLASH_DURATION = 2000; // 2 seconds minimum display time

// Track initialization state
let isInitialized = false;
let authInitialized = false;
let appStateSubscription: any = null;
let tokenRefreshInterval: NodeJS.Timeout | null = null;

// Initialize Firebase Auth
export const initializeFirebaseAuth = async () => {
  try {
    // Set up auth state listener
    return new Promise<void>((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        authInitialized = true;
        unsubscribe();
        resolve();
      });
    });
  } catch (error) {
    console.error('Error initializing Firebase Auth:', error);
    authInitialized = true; // Mark as initialized even on error to prevent loops
    throw error;
  }
};

// Initialize app essentials
export const initializeApp = async () => {
  if (isInitialized) return;

  try {
    // Set up timeout for initialization
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Initialization timeout')), INITIALIZATION_TIMEOUT);
    });

    // Record start time
    const startTime = Date.now();

    // Prevent splash screen from auto-hiding
    await SplashScreen.preventAutoHideAsync();
    
    // Initialize other essential services with timeout
    await Promise.race([
      Promise.all([
        initializeFirebaseAuth(),
        setupAppStateListener(),
        // Load fonts
        Font.loadAsync({
          'Inter': require('../../assets/fonts/Inter-Regular.ttf'),
          'Inter-Medium': require('../../assets/fonts/Inter-Medium.ttf'),
          'Inter-SemiBold': require('../../assets/fonts/Inter-SemiBold.ttf'),
          'Inter-Bold': require('../../assets/fonts/Inter-Bold.ttf'),
        }),
        // Add other initialization tasks here
      ]),
      timeoutPromise
    ]);

    // Calculate remaining time to meet minimum duration
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, MINIMUM_SPLASH_DURATION - elapsedTime);

    // Wait for remaining time if needed
    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    }

    isInitialized = true;
  } catch (error) {
    console.error('Error during app initialization:', error);
    // Still mark as initialized to prevent loops
    isInitialized = true;
    authInitialized = true;
  }
};

// Setup app state listener
const setupAppStateListener = async () => {
  if (appStateSubscription) {
    appStateSubscription.remove();
  }

  appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
};

// Handle app state changes
const handleAppStateChange = async (nextAppState: AppStateStatus) => {
  if (nextAppState === 'active' && auth.currentUser) {
    try {
      await auth.currentUser.reload();
    } catch (error) {
      console.error('Error reloading user:', error);
    }
  }
};

// Export initialization states
export const getInitializationState = () => ({
  isInitialized,
  authInitialized
}); 