import * as SplashScreen from 'expo-splash-screen';
import { auth } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';

// Constants
const AUTH_PERSISTENCE_KEY = '@auth_persistence';
const AUTH_CREDENTIALS_KEY = '@auth_credentials';
const AUTH_REFRESH_KEY = '@auth_refresh';
const INITIALIZATION_TIMEOUT = 10000; // 10 seconds
const TOKEN_REFRESH_INTERVAL = 1000 * 60 * 50; // 50 minutes
const MINIMUM_SPLASH_DURATION = 3000; // 3 seconds minimum display time

// Track initialization state
let isInitialized = false;
let authInitialized = false;
let appStateSubscription: any = null;
let tokenRefreshInterval: NodeJS.Timeout | null = null;

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
        // Add other initialization tasks here
        setupAppStateListener(),
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
    // Ensure splash screen is hidden in case of error
    try {
      await SplashScreen.hideAsync();
    } catch (e) {
      console.error('Error hiding splash screen:', e);
    }
  }
};

// Setup token refresh
const setupTokenRefresh = async () => {
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval);
  }

  tokenRefreshInterval = setInterval(async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const idToken = await user.getIdToken(true);
        await AsyncStorage.setItem(AUTH_REFRESH_KEY, idToken);
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
  }, TOKEN_REFRESH_INTERVAL);
};

// Setup app state listener
const setupAppStateListener = async () => {
  // Remove existing subscription if any
  if (appStateSubscription) {
    appStateSubscription.remove();
  }

  // Handle app state changes
  appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
};

// Handle app state changes
const handleAppStateChange = async (nextAppState: AppStateStatus) => {
  if (nextAppState === 'active') {
    // App came to foreground
    try {
      // Reset initialization if needed
      if (!isInitialized || !authInitialized) {
        await resetInitialization();
        await initializeApp();
      }
      // Check auth state and refresh token
      await isFirebaseAuthReady();
      const user = auth.currentUser;
      if (user) {
        await user.getIdToken(true);
        setupTokenRefresh();
      }
    } catch (error) {
      console.error('Error handling app state change:', error);
    }
  } else if (nextAppState === 'background') {
    // App went to background
    if (tokenRefreshInterval) {
      clearInterval(tokenRefreshInterval);
      tokenRefreshInterval = null;
    }
  }
};

// Check if Firebase Auth is ready and handle cached credentials
export const isFirebaseAuthReady = async (): Promise<boolean> => {
  return new Promise(async (resolve) => {
    try {
      // Check for cached auth state
      const [persistedAuth, savedCredentials] = await Promise.all([
        AsyncStorage.getItem(AUTH_PERSISTENCE_KEY),
        AsyncStorage.getItem(AUTH_CREDENTIALS_KEY)
      ]);

      if (persistedAuth && savedCredentials) {
        // We have cached credentials, wait for auth state
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
          unsubscribe();
          if (user) {
            setupTokenRefresh();
          }
          resolve(true);
        });
      } else {
        // No cached credentials, resolve immediately
        resolve(true);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      resolve(true); // Resolve to prevent blocking
    }
  });
};

// Initialize Firebase Auth with proper state handling
export const initializeFirebaseAuth = async () => {
  if (authInitialized) return;

  try {
    // Wait for auth to be ready
    await isFirebaseAuthReady();

    // Set up persistent auth state listener
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Get fresh token
          const idToken = await user.getIdToken();
          
          // Update persistence
          await Promise.all([
            AsyncStorage.setItem(AUTH_PERSISTENCE_KEY, JSON.stringify({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              lastLoginAt: new Date().toISOString()
            })),
            AsyncStorage.setItem(AUTH_REFRESH_KEY, idToken)
          ]);

          // Setup token refresh
          setupTokenRefresh();
        } catch (error) {
          console.error('Error updating auth persistence:', error);
        }
      } else {
        // Clear token refresh on signout
        if (tokenRefreshInterval) {
          clearInterval(tokenRefreshInterval);
          tokenRefreshInterval = null;
        }
      }
    });

    // Clean up on app termination
    if (global.addEventListener) {
      global.addEventListener('beforeunload', () => {
        unsubscribe();
        if (appStateSubscription) {
          appStateSubscription.remove();
        }
        if (tokenRefreshInterval) {
          clearInterval(tokenRefreshInterval);
          tokenRefreshInterval = null;
        }
      });
    }

    authInitialized = true;
  } catch (error) {
    console.error('Error initializing Firebase Auth:', error);
    authInitialized = true;
  }
};

// Reset initialization state
export const resetInitialization = async () => {
  try {
    isInitialized = false;
    authInitialized = false;
    // Clean up listeners
    if (appStateSubscription) {
      appStateSubscription.remove();
    }
    if (tokenRefreshInterval) {
      clearInterval(tokenRefreshInterval);
      tokenRefreshInterval = null;
    }
  } catch (error) {
    console.error('Error resetting initialization:', error);
  }
};

// Check if we have valid cached credentials
export const hasCachedCredentials = async (): Promise<boolean> => {
  try {
    const [persistedAuth, savedCredentials, refreshToken] = await Promise.all([
      AsyncStorage.getItem(AUTH_PERSISTENCE_KEY),
      AsyncStorage.getItem(AUTH_CREDENTIALS_KEY),
      AsyncStorage.getItem(AUTH_REFRESH_KEY)
    ]);
    return !!(persistedAuth && savedCredentials && refreshToken);
  } catch (error) {
    console.error('Error checking cached credentials:', error);
    return false;
  }
}; 