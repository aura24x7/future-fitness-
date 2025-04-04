/**
 * Firebase Initialization
 * 
 * This file provides SYNCHRONOUS initialization of Firebase.
 * It must be imported before any component tries to use Firebase.
 */

// First initialize the web Firebase SDK
import { initializeApp, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
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

// This flag helps manage compatibility between native and web Firebase
let isNativeFirebaseAvailable = false;

// Synchronously initialize Firebase
console.log('🔥 Initializing Firebase...');
let firebaseApp;

try {
  // Initialize the web version of Firebase first
  try {
    firebaseApp = getApp();
    console.log('⚠️ Firebase app already exists, retrieving existing app');
  } catch (getAppError) {
    // If no app exists, initialize a new one
    firebaseApp = initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

// Initialize auth with persistence
let auth;
try {
  // Initialize auth with AsyncStorage persistence
  auth = initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (authError) {
  // Fallback in case auth is already initialized
  auth = getAuth(firebaseApp);
}

// Initialize services synchronously
const firestore = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);
const functions = getFunctions(firebaseApp);

// Handle Native Firebase initialization - but do NOT initialize it directly
// This prevents the _nativeModule.getAppModule().initializeApp issue
try {
  // DO NOT try to initialize Native Firebase here.
  // Native Firebase will be imported in the main App.tsx file.
  // This approach avoids the initializeApp errors from _nativeModule.getAppModule
  console.log('🔍 Web Firebase modules initialized, Native modules will be imported separately');
} catch (error) {
  console.log('⚠️ Native Firebase detection error (non-critical):', error);
}

// Export the initialized services - THESE ARE READY TO USE IMMEDIATELY
export { firebaseApp, auth, firestore, storage, functions, firebaseConfig };

// Export a simple check function for testing
export const isFirebaseInitialized = () => {
  return !!firebaseApp;
};

console.log('🔄 Firebase services exported and ready to use'); 