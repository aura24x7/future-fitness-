import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDoc, serverTimestamp, setDoc, doc } from '@react-native-firebase/firestore';
import { networkManager } from './networkUtils';
import { AppError, ErrorCodes } from './errorHandling';

// Constants
const PROFILE_CACHE_KEY = '@profile_cache';
const PROFILE_TIMESTAMP_KEY = '@profile_timestamp';
const PROFILE_LOADING_KEY = '@profile_loading';
const CACHE_DURATION = 1000 * 60 * 60; // Extended to 1 hour for better offline support
const OFFLINE_CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours for offline mode
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000;

interface CachedProfile {
  data: any;
  timestamp: number;
  isOfflineCache?: boolean;
}

// Track loading state
let isLoading = false;

// Load profile from cache with offline support
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
    const isOffline = !networkManager.isNetworkAvailable();
    const cacheDuration = isOffline ? OFFLINE_CACHE_DURATION : CACHE_DURATION;

    // Check if cache is still valid
    if (now - cachedTimestamp < cacheDuration) {
      const profile = JSON.parse(cachedData);
      if (isOffline && !profile.isOfflineCache) {
        profile.isOfflineCache = true;
        await cacheProfile(userId, profile);
      }
      return profile;
    }

    // If offline and cache expired, still use it but mark as stale
    if (isOffline) {
      const profile = JSON.parse(cachedData);
      profile.isOfflineCache = true;
      await cacheProfile(userId, profile);
      return profile;
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
    const dataToCache = {
      ...profileData,
      isOfflineCache: !networkManager.isNetworkAvailable()
    };

    await Promise.all([
      AsyncStorage.setItem(`${PROFILE_CACHE_KEY}_${userId}`, JSON.stringify(dataToCache)),
      AsyncStorage.setItem(`${PROFILE_TIMESTAMP_KEY}_${userId}`, Date.now().toString()),
      AsyncStorage.setItem(`${PROFILE_LOADING_KEY}_${userId}`, 'false')
    ]);
  } catch (error) {
    console.error('Error caching profile:', error);
  }
};

// Load profile from Firestore with offline support
export const loadFirestoreProfile = async (userId: string): Promise<any | null> => {
  try {
    // Set loading state
    await AsyncStorage.setItem(`${PROFILE_LOADING_KEY}_${userId}`, 'true');
    isLoading = true;

    // Check network status
    if (!networkManager.isNetworkAvailable()) {
      throw new AppError(
        'Network unavailable',
        ErrorCodes.NETWORK_ERROR,
        'Profile',
        'loadFirestoreProfile'
      );
    }

    const userRef = doc(firestore(), 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const profileData = userDoc.data();
      // Only update timestamp if online
      if (networkManager.isNetworkAvailable()) {
        await setDoc(userRef, {
          lastAccessed: serverTimestamp()
        }, { merge: true });
      }
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
    throw error;
  }
};

// Load profile with cache fallback and retry mechanism
export const loadProfile = async (userId: string, retryCount = MAX_RETRY_ATTEMPTS): Promise<any | null> => {
  try {
    // Check if already loading
    if (isLoading) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return loadProfile(userId, retryCount);
    }

    // Try cache first
    const cachedProfile = await loadCachedProfile(userId);
    
    // If offline, return cached profile (even if null)
    if (!networkManager.isNetworkAvailable()) {
      return cachedProfile;
    }

    // If online and we have a non-stale cache, use it
    if (cachedProfile && !cachedProfile.isOfflineCache) {
      return cachedProfile;
    }

    try {
      // Try to load from Firestore
      const profile = await loadFirestoreProfile(userId);
      if (profile) {
        return profile;
      }
    } catch (error) {
      // If network error and we have cached data, use it
      if (error instanceof AppError && error.code === ErrorCodes.NETWORK_ERROR && cachedProfile) {
        return cachedProfile;
      }
      
      // If we have retries left, wait and try again
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return loadProfile(userId, retryCount - 1);
      }
      
      // If no retries left and we have cached data, use it
      if (cachedProfile) {
        return cachedProfile;
      }
      
      throw error;
    }

    return null;
  } catch (error) {
    console.error('Error loading profile:', error);
    // If we have cached data, return it as last resort
    const cachedProfile = await loadCachedProfile(userId);
    if (cachedProfile) {
      return cachedProfile;
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