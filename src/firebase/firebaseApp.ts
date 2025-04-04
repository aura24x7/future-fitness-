/**
 * Centralized Firebase Initialization Module
 * 
 * This module handles initialization of Firebase for both web and native platforms.
 * It ensures Firebase is initialized only once and properly configured.
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { initializeAuth, getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, FirebaseStorage } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator, Functions } from 'firebase/functions';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase project configuration for Ai-calories
const firebaseConfig = {
  apiKey: "AIzaSyDwDaMxenn_2HfwyhLJtaq_Yc8e8HkVFGI",
  authDomain: "ai-calories-150d7.firebaseapp.com",
  projectId: "ai-calories-150d7",
  storageBucket: "ai-calories-150d7.firebasestorage.app",
  messagingSenderId: "550020013634",
  appId: "1:550020013634:web:acb2ef7dfc3587ad8757db",
  measurementId: "G-RDNSNXL5WR",
  databaseURL: `https://${Platform.OS === 'web' ? '' : Platform.OS + '.'}ai-calories-150d7.firebaseio.com`
};

// Define Firebase services return type
interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
  functions: Functions;
  analytics: Analytics | null;
}

// Initialize Firebase only once
let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;
let functions: Functions;
let analytics: Analytics | null = null;

// Initialization state tracking
let isInitialized = false;
let initializationPromise: Promise<FirebaseServices> | null = null;

/**
 * Initialize Firebase with proper configuration
 */
export const initializeFirebaseApp = async (): Promise<FirebaseServices> => {
  if (isInitialized) {
    return { app, auth, firestore, storage, functions, analytics };
  }

  if (initializationPromise) {
    return await initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      console.log('[Firebase] Initializing Firebase app...');
      
      // Initialize the Firebase app
      app = initializeApp(firebaseConfig);
      
      console.log('[Firebase] Initializing Firebase services...');
      
      // Initialize Auth - simplified approach
      auth = getAuth(app);
      console.log('[Firebase] Auth initialized');
      
      // Initialize other services
      firestore = getFirestore(app);
      storage = getStorage(app);
      functions = getFunctions(app);
      
      // Only initialize analytics on web platform
      if (Platform.OS === 'web') {
        analytics = getAnalytics(app);
      }
      
      // Connect to emulators if in development mode
      if (__DEV__) {
        // Uncomment these lines to use Firebase emulators
        // connectAuthEmulator(auth, 'http://localhost:9099');
        // connectFirestoreEmulator(firestore, 'localhost', 8080);
        // connectStorageEmulator(storage, 'localhost', 9199);
        // connectFunctionsEmulator(functions, 'localhost', 5001);
      }
      
      isInitialized = true;
      console.log('[Firebase] Firebase initialized successfully');
      
      return { app, auth, firestore, storage, functions, analytics };
    } catch (error) {
      console.error('[Firebase] Firebase initialization failed:', error);
      isInitialized = false;
      initializationPromise = null;
      throw error;
    }
  })();
  
  return await initializationPromise;
};

/**
 * Get the Firebase services
 * This will initialize Firebase if it hasn't been initialized yet
 */
export const getFirebaseServices = async (): Promise<FirebaseServices> => {
  if (!isInitialized) {
    return await initializeFirebaseApp();
  }
  return { app, auth, firestore, storage, functions, analytics };
};

/**
 * Check if Firebase is initialized
 */
export const isFirebaseInitialized = (): boolean => {
  return isInitialized;
};

// Auto-initialize Firebase when this module is imported
initializeFirebaseApp().catch(error => {
  console.error('[Firebase] Auto-initialization failed:', error);
});

export { app, auth, firestore, storage, functions, analytics, firebaseConfig }; 