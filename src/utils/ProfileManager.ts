import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { firestore } from '../config/firebase';

// Constants
const PROFILE_CACHE_KEY = '@profile_cache';
const PROFILE_TIMESTAMP_KEY = '@profile_timestamp';
const PROFILE_LOADING_KEY = '@profile_loading';
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

interface CachedProfile {
  data: any;
  timestamp: number;
}

// Track loading state
let isLoading = false;

// Load profile from cache
export const loadCachedProfile = async (userId: string): Promise<any | null> => {
  try {
    const [cachedData, timestamp, loadingState] = await Promise.all([
      AsyncStorage.getItem(`${PROFILE_CACHE_KEY}_${userId}`),
      AsyncStorage.getItem(`${PROFILE_TIMESTAMP_KEY}_${userId}`),
      AsyncStorage.getItem(`${PROFILE_LOADING_KEY}_${userId}`)
    ]);

    // If profile is currently loading, wait a bit and retry
    if (loadingState === 'true') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return loadCachedProfile(userId);
    }

    if (!cachedData || !timestamp) return null;

    const cachedTimestamp = parseInt(timestamp, 10);
    const now = Date.now();

    // Check if cache is still valid
    if (now - cachedTimestamp < CACHE_DURATION) {
      return JSON.parse(cachedData);
    }

    return null;
  } catch (error) {
    console.error('Error loading cached profile:', error);
    return null;
  }
};

// Save profile to cache
export const cacheProfile = async (userId: string, profileData: any): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.setItem(`${PROFILE_CACHE_KEY}_${userId}`, JSON.stringify(profileData)),
      AsyncStorage.setItem(`${PROFILE_TIMESTAMP_KEY}_${userId}`, Date.now().toString()),
      AsyncStorage.setItem(`${PROFILE_LOADING_KEY}_${userId}`, 'false')
    ]);
  } catch (error) {
    console.error('Error caching profile:', error);
  }
};

// Load profile from Firestore
export const loadFirestoreProfile = async (userId: string): Promise<any | null> => {
  try {
    // Set loading state
    await AsyncStorage.setItem(`${PROFILE_LOADING_KEY}_${userId}`, 'true');
    isLoading = true;

    const userRef = doc(firestore, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const profileData = userDoc.data();
      // Update last accessed timestamp
      await setDoc(userRef, {
        lastAccessed: serverTimestamp()
      }, { merge: true });
      // Cache the fresh data
      await cacheProfile(userId, profileData);
      return profileData;
    }

    // Clear loading state if no profile exists
    await AsyncStorage.setItem(`${PROFILE_LOADING_KEY}_${userId}`, 'false');
    isLoading = false;
    return null;
  } catch (error) {
    console.error('Error loading Firestore profile:', error);
    // Clear loading state on error
    await AsyncStorage.setItem(`${PROFILE_LOADING_KEY}_${userId}`, 'false');
    isLoading = false;
    return null;
  }
};

// Clear profile cache
export const clearProfileCache = async (userId: string): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(`${PROFILE_CACHE_KEY}_${userId}`),
      AsyncStorage.removeItem(`${PROFILE_TIMESTAMP_KEY}_${userId}`),
      AsyncStorage.removeItem(`${PROFILE_LOADING_KEY}_${userId}`)
    ]);
  } catch (error) {
    console.error('Error clearing profile cache:', error);
  }
};

// Load profile with cache fallback and retry mechanism
export const loadProfile = async (userId: string, retryCount = 3): Promise<any | null> => {
  try {
    // Check if already loading
    if (isLoading) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return loadProfile(userId, retryCount);
    }

    // Try cache first
    const cachedProfile = await loadCachedProfile(userId);
    if (cachedProfile) {
      return cachedProfile;
    }

    // If no cache or expired, load from Firestore
    const profile = await loadFirestoreProfile(userId);
    if (profile) {
      return profile;
    }

    // If profile is null and we have retries left, wait and try again
    if (retryCount > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return loadProfile(userId, retryCount - 1);
    }

    return null;
  } catch (error) {
    console.error('Error loading profile:', error);
    if (retryCount > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return loadProfile(userId, retryCount - 1);
    }
    return null;
  }
};

// Check if profile is currently loading
export const isProfileLoading = async (userId: string): Promise<boolean> => {
  try {
    const loadingState = await AsyncStorage.getItem(`${PROFILE_LOADING_KEY}_${userId}`);
    return loadingState === 'true' || isLoading;
  } catch (error) {
    console.error('Error checking profile loading state:', error);
    return false;
  }
}; 