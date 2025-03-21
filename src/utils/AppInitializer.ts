import * as SplashScreen from 'expo-splash-screen';
import { AppState, AppStateStatus } from 'react-native';
import * as Font from 'expo-font';
import { networkManager } from './networkUtils';
import { AppError, ErrorCodes } from './errorHandling';
import firebaseService from '../config/firebase';

// Constants
const INITIALIZATION_TIMEOUT = 10000; // 10 seconds
const MINIMUM_SPLASH_DURATION = 2000; // 2 seconds minimum display time
const OFFLINE_RETRY_ATTEMPTS = 3;
const OFFLINE_RETRY_DELAY = 2000; // 2 seconds

// Track initialization state
let isInitialized = false;
let authInitialized = false;
let appStateSubscription: any = null;

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
    
    // Initialize Firebase with retries for offline scenarios
    let retryCount = 0;
    while (retryCount < OFFLINE_RETRY_ATTEMPTS) {
      try {
        await firebaseService.initialize();
        break;
      } catch (error) {
        retryCount++;
        if (retryCount === OFFLINE_RETRY_ATTEMPTS) {
          throw new AppError(
            ErrorCodes.FIREBASE_INITIALIZATION_FAILED,
            'Failed to initialize Firebase after multiple attempts',
            error as Error
          );
        }
        await new Promise(resolve => setTimeout(resolve, OFFLINE_RETRY_DELAY));
      }
    }
    
    // Initialize essential services with timeout
    await Promise.race([
      Promise.all([
        // Load fonts
        Font.loadAsync({
          'Inter': require('../../assets/fonts/Inter-Regular.ttf'),
          'Inter-Medium': require('../../assets/fonts/Inter-Medium.ttf'),
          'Inter-SemiBold': require('../../assets/fonts/Inter-SemiBold.ttf'),
          'Inter-Bold': require('../../assets/fonts/Inter-Bold.ttf'),
        }),
        // Set up app state listener
        setupAppStateListener(),
      ]),
      timeoutPromise
    ]);

    // Ensure minimum splash screen duration
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < MINIMUM_SPLASH_DURATION) {
      await new Promise(resolve => setTimeout(resolve, MINIMUM_SPLASH_DURATION - elapsedTime));
    }

    isInitialized = true;
  } catch (error) {
    console.error('App initialization failed:', error);
    throw error;
  }
};

// Verify auth state
export const verifyAuthState = async (): Promise<boolean> => {
  try {
    if (!authInitialized) {
      await firebaseService.initialize();
      authInitialized = true;
    }
    return true;
  } catch (error) {
    console.error('Auth state verification failed:', error);
    return false;
  }
};

// Handle app state changes
const handleAppStateChange = async (nextAppState: AppStateStatus) => {
  if (nextAppState === 'active') {
    try {
      await networkManager.checkConnectivity();
      if (networkManager.isConnected) {
        await firebaseService.firestore.enableNetwork();
      }
    } catch (error) {
      console.error('Error handling app state change:', error);
    }
  }
};

// Set up app state listener
const setupAppStateListener = () => {
  if (appStateSubscription) {
    appStateSubscription.remove();
  }
  appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
};

// Get initialization state
export const getInitializationState = () => {
  return {
    isInitialized,
    authInitialized,
  };
};