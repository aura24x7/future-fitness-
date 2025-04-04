import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for navigation locks
export const NAV_REGISTRATION_KEY = 'REGISTRATION_IN_PROGRESS';
export const NAV_ONBOARDING_KEY = 'ONBOARDING_COMPLETION_IN_PROGRESS';

/**
 * Locks navigation during a specific process
 * @param key The key identifying the lock type
 * @param reason Description of why navigation is locked
 */
export const lockNavigation = async (key: string, reason: string) => {
  try {
    await AsyncStorage.setItem(key, reason);
    console.log(`[NavigationUtils] Navigation locked (${key}): ${reason}`);
    return true;
  } catch (error) {
    console.error(`[NavigationUtils] Error locking navigation (${key}):`, error);
    return false;
  }
};

/**
 * Unlocks navigation for a specific process
 * @param key The key identifying the lock type
 */
export const unlockNavigation = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
    console.log(`[NavigationUtils] Navigation unlocked (${key})`);
    return true;
  } catch (error) {
    console.error(`[NavigationUtils] Error unlocking navigation (${key}):`, error);
    return false;
  }
};

/**
 * Checks if navigation is locked for a specific process
 * @param key The key identifying the lock type
 * @returns The reason if locked, false otherwise
 */
export const isNavigationLocked = async (key: string) => {
  try {
    const lockReason = await AsyncStorage.getItem(key);
    return lockReason || false;
  } catch (error) {
    console.error(`[NavigationUtils] Error checking navigation lock (${key}):`, error);
    return false;
  }
};

/**
 * Unlock all navigation locks
 */
export const unlockAllNavigation = async () => {
  try {
    await AsyncStorage.removeItem(NAV_REGISTRATION_KEY);
    await AsyncStorage.removeItem(NAV_ONBOARDING_KEY);
    console.log('[NavigationUtils] All navigation locks cleared');
    return true;
  } catch (error) {
    console.error('[NavigationUtils] Error clearing all navigation locks:', error);
    return false;
  }
}; 