// Comment out the native Firebase imports since we're now using web
// import { initializeApp, getApp } from '@react-native-firebase/app';
// import firestore from '@react-native-firebase/firestore';
import { Platform } from 'react-native';
// import { firebaseConfig } from '../../config/firebaseConfig';

// Import web Firebase instead
import { 
  app, 
  auth as webAuth, 
  firestore as webFirestore,
  firebaseConfig
} from '../../config/firebaseWebConfig';

// Import messaging separately to avoid type issues
import { messaging as webMessaging } from '../../config/firebaseWebConfig';

let isInitialized = false;
let firestoreInitialized = false;
let nativeFirebaseAvailable = false;

// Array of callbacks to execute when auth state changes
const authStateChangeCallbacks: Array<(user: any) => void> = [];

// Add a callback to be executed when auth state changes
export const onAuthStateChanged = (callback: (user: any) => void) => {
  authStateChangeCallbacks.push(callback);
  return () => {
    const index = authStateChangeCallbacks.indexOf(callback);
    if (index !== -1) {
      authStateChangeCallbacks.splice(index, 1);
    }
  };
};

// Function to get the appropriate Firebase Auth instance
export const getFirebaseAuth = () => {
  if (nativeFirebaseAvailable) {
    try {
      const nativeAuth = require('@react-native-firebase/auth').default;
      return nativeAuth();
    } catch (error) {
      console.warn('[FirebaseInit] Native auth failed, using web auth:', error);
      return webAuth;
    }
  }
  return webAuth;
};

// Function to get the appropriate Firestore instance
export const getFirebaseFirestore = () => {
  if (nativeFirebaseAvailable) {
    try {
      const nativeFirestore = require('@react-native-firebase/firestore').default;
      return nativeFirestore();
    } catch (error) {
      console.warn('[FirebaseInit] Native firestore failed, using web firestore:', error);
      return webFirestore;
    }
  }
  return webFirestore;
};

export const initializeFirebase = async () => {
  if (isInitialized) {
    console.log('[FirebaseInit] Firebase already initialized');
    return;
  }

  try {
    console.log('[FirebaseInit] Initializing Firebase...');
    
    // Check if React Native Firebase is available
    try {
      const RNFirebaseApp = require('@react-native-firebase/app').default;
      
      // Check if default app is already initialized
      try {
        const existingApp = RNFirebaseApp.app();
        console.log('[FirebaseInit] React Native Firebase app already initialized');
        nativeFirebaseAvailable = true;
      } catch (appError) {
        // Initialize React Native Firebase if not already initialized
        try {
          RNFirebaseApp.initializeApp(firebaseConfig);
          console.log('[FirebaseInit] React Native Firebase app initialized');
          nativeFirebaseAvailable = true;
        } catch (initError) {
          console.warn('[FirebaseInit] Failed to initialize React Native Firebase:', initError);
          // Continue with web Firebase
        }
      }
    } catch (rnFirebaseError) {
      console.log('[FirebaseInit] React Native Firebase not available, using web Firebase');
      // Continue with web Firebase
    }
    
    // Web Firebase is already initialized in firebaseWebConfig.ts
    console.log('[FirebaseInit] Firebase app initialized successfully');

    // Firestore is already initialized in the web config
    firestoreInitialized = true;
    console.log('[FirebaseInit] Firestore initialized successfully');

    // Setup auth state change listener using the appropriate auth instance
    const auth = getFirebaseAuth();
    const unsubscribeAuth = auth.onAuthStateChanged((user: any) => {
      console.log('[FirebaseInit] Auth state changed:', user ? 'User signed in' : 'User signed out');
      
      // Execute all callbacks
      for (const callback of authStateChangeCallbacks) {
        try {
          callback(user);
        } catch (error) {
          console.error('[FirebaseInit] Error executing auth state change callback:', error);
        }
      }
    });

    isInitialized = true;
    console.log('[FirebaseInit] Firebase initialized successfully');
  } catch (error) {
    console.error('[FirebaseInit] Firebase initialization failed:', error);
    isInitialized = false;
    throw error;
  }
};

// Helper function to get the Firebase app instance
export const getFirebaseApp = () => {
  if (nativeFirebaseAvailable) {
    try {
      const RNFirebaseApp = require('@react-native-firebase/app').default;
      return RNFirebaseApp.app();
    } catch (error) {
      return app;
    }
  }
  return app;
};

// Initialize Firebase immediately
initializeFirebase().catch(error => {
  console.warn('[FirebaseInit] Auto-initialization failed:', error);
});
