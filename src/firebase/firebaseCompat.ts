/**
 * Firebase Native Compatibility Module
 * 
 * This module safely imports and provides access to native Firebase modules
 * without causing initialization conflicts.
 */

import { firebaseConfig } from './firebaseInit';

// Declare module variables to hold native Firebase instances
let nativeAppModule: any = null;
let nativeFirestoreModule: any = null;
let nativeAuthModule: any = null;
let nativeStorageModule: any = null;
let nativeMessagingModule: any = null;

// Indicates if native Firebase is available
let nativeFirebaseAvailable = false;

/**
 * Safely imports native Firebase modules
 */
const importNativeModules = () => {
  try {
    // Static imports for native Firebase modules
    const RNFirebaseApp = require('@react-native-firebase/app').default;
    const RNFirestore = require('@react-native-firebase/firestore').default;
    const RNAuth = require('@react-native-firebase/auth').default;
    const RNStorage = require('@react-native-firebase/storage').default;
    const RNMessaging = require('@react-native-firebase/messaging').default;

    return {
      app: RNFirebaseApp,
      firestore: RNFirestore,
      auth: RNAuth,
      storage: RNStorage,
      messaging: RNMessaging
    };
  } catch (error) {
    console.log('[FirebaseCompat] Could not import native Firebase modules:', error);
    return null;
  }
};

/**
 * Safely gets the native Firebase app instance without initializing it
 */
export const getNativeFirebaseApp = () => {
  if (!nativeAppModule) {
    const modules = importNativeModules();
    if (modules) {
      nativeAppModule = modules.app;
    }
  }
  
  if (nativeAppModule) {
    try {
      return nativeAppModule.app();
    } catch (error) {
      console.log('[FirebaseCompat] Error getting native Firebase app:', error);
      return null;
    }
  }
  
  return null;
};

/**
 * Initialize the compatibility layer without initializing native modules
 */
export const initNativeCompat = () => {
  if (nativeFirebaseAvailable) {
    return;
  }

  // Import all native modules at once
  const modules = importNativeModules();
  if (modules) {
    nativeAppModule = modules.app;
    nativeFirestoreModule = modules.firestore;
    nativeAuthModule = modules.auth;
    nativeStorageModule = modules.storage;
    nativeMessagingModule = modules.messaging;

    // Check if we have a valid app module
    try {
      // Check if app is already initialized
      nativeAppModule.app();
      nativeFirebaseAvailable = true;
      console.log('[FirebaseCompat] Native Firebase modules found and app is already initialized');
    } catch (error) {
      // App is not initialized, but modules are available
      console.log('[FirebaseCompat] Native Firebase modules found, but app is not initialized yet');
      nativeFirebaseAvailable = true;
    }
  } else {
    console.log('[FirebaseCompat] Native Firebase modules not available, using web-only mode');
    nativeFirebaseAvailable = false;
  }

  return nativeFirebaseAvailable;
};

/**
 * Get a native Firebase Firestore instance (without initializing if not already initialized)
 */
export const getNativeFirestore = () => {
  if (!nativeFirestoreModule) {
    const modules = importNativeModules();
    if (modules) {
      nativeFirestoreModule = modules.firestore;
    }
  }
  
  if (nativeFirestoreModule) {
    try {
      return nativeFirestoreModule();
    } catch (error) {
      console.log('[FirebaseCompat] Error getting native Firestore:', error);
      return null;
    }
  }
  
  return null;
};

/**
 * Get a native Firebase Auth instance (without initializing if not already initialized)
 */
export const getNativeAuth = () => {
  if (!nativeAuthModule) {
    const modules = importNativeModules();
    if (modules) {
      nativeAuthModule = modules.auth;
    }
  }
  
  if (nativeAuthModule) {
    try {
      return nativeAuthModule();
    } catch (error) {
      console.log('[FirebaseCompat] Error getting native Auth:', error);
      return null;
    }
  }
  
  return null;
};

/**
 * Check if native Firebase modules are available
 */
export const isNativeFirebaseAvailable = () => {
  return nativeFirebaseAvailable;
};

// Initialize the compatibility layer on module import
initNativeCompat(); 