/**
 * Manual Firebase Auth Persistence Helper
 * 
 * This module provides a simple way to persist Firebase Auth state without
 * relying on the problematic firebase/auth/react-native module.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from 'firebase/auth';

// Storage key for auth data
const AUTH_PERSISTENCE_KEY = 'firebase_auth_user';

// Save user data to AsyncStorage when login happens
export const saveUserToStorage = async (user: User | null): Promise<void> => {
  if (!user) {
    // If logout, remove the stored data
    await AsyncStorage.removeItem(AUTH_PERSISTENCE_KEY);
    return;
  }

  // Extract only the fields we need to persist
  const userData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    phoneNumber: user.phoneNumber,
    lastLoginTime: new Date().toISOString(),
  };

  try {
    await AsyncStorage.setItem(AUTH_PERSISTENCE_KEY, JSON.stringify(userData));
    console.log('[FirebaseStorageHelper] User data saved to AsyncStorage');
  } catch (error) {
    console.error('[FirebaseStorageHelper] Error saving user data:', error);
  }
};

// Get the stored user data
export const getStoredUser = async (): Promise<any | null> => {
  try {
    const userData = await AsyncStorage.getItem(AUTH_PERSISTENCE_KEY);
    if (!userData) return null;
    
    return JSON.parse(userData);
  } catch (error) {
    console.error('[FirebaseStorageHelper] Error retrieving user data:', error);
    return null;
  }
};

// Clear stored user data
export const clearStoredUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_PERSISTENCE_KEY);
    console.log('[FirebaseStorageHelper] User data cleared from AsyncStorage');
  } catch (error) {
    console.error('[FirebaseStorageHelper] Error clearing user data:', error);
  }
}; 