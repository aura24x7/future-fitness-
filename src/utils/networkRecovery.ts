import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const VOICE_ONBOARDING_PROGRESS_KEY = '@future_fitness/voice_onboarding_progress';

/**
 * Interface for storing partial voice onboarding data during the process
 */
export interface VoiceOnboardingProgress {
  userId: string;
  data: {
    name?: string;
    age?: number;
    gender?: string;
    currentWeight?: number;
    targetWeight?: number;
    targetDate?: string;
    fitnessGoal?: string;
    activityLevel?: string;
    dietaryRestrictions?: string;
  };
  lastUpdated: number;
  currentQuestion: string;
}

/**
 * Saves the current progress of voice onboarding to AsyncStorage
 * This allows for recovery if the app is closed or network connection is lost
 */
export const saveOnboardingProgress = async (
  userId: string,
  data: any,
  currentQuestion: string
): Promise<void> => {
  try {
    const progress: VoiceOnboardingProgress = {
      userId,
      data,
      lastUpdated: Date.now(),
      currentQuestion
    };
    
    await AsyncStorage.setItem(
      VOICE_ONBOARDING_PROGRESS_KEY,
      JSON.stringify(progress)
    );
    
    console.log('[NetworkRecovery] Saved onboarding progress');
  } catch (error) {
    console.error('[NetworkRecovery] Error saving onboarding progress:', error);
  }
};

/**
 * Retrieves saved onboarding progress for a user
 * Returns null if no progress is found or if it's for a different user
 */
export const getOnboardingProgress = async (
  userId: string
): Promise<VoiceOnboardingProgress | null> => {
  try {
    const savedProgress = await AsyncStorage.getItem(VOICE_ONBOARDING_PROGRESS_KEY);
    
    if (!savedProgress) {
      return null;
    }
    
    const progress: VoiceOnboardingProgress = JSON.parse(savedProgress);
    
    // Check if the progress is for the current user
    if (progress.userId !== userId) {
      return null;
    }
    
    // Check if the progress is recent (within the last 24 hours)
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (Date.now() - progress.lastUpdated > twentyFourHours) {
      // Progress is too old, clear it
      await AsyncStorage.removeItem(VOICE_ONBOARDING_PROGRESS_KEY);
      return null;
    }
    
    return progress;
  } catch (error) {
    console.error('[NetworkRecovery] Error getting onboarding progress:', error);
    return null;
  }
};

/**
 * Clears saved onboarding progress
 * Call this when onboarding is complete or abandoned
 */
export const clearOnboardingProgress = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(VOICE_ONBOARDING_PROGRESS_KEY);
    console.log('[NetworkRecovery] Cleared onboarding progress');
  } catch (error) {
    console.error('[NetworkRecovery] Error clearing onboarding progress:', error);
  }
};

/**
 * Monitors network connectivity and provides recovery options
 * Returns an unsubscribe function
 */
export const monitorNetworkConnectivity = (
  onDisconnect: () => void,
  onReconnect: () => void
): (() => void) => {
  return NetInfo.addEventListener(state => {
    if (state.isConnected === false) {
      console.log('[NetworkRecovery] Network disconnected');
      onDisconnect();
    } else if (state.isConnected === true) {
      console.log('[NetworkRecovery] Network reconnected');
      onReconnect();
    }
  });
};

export default {
  saveOnboardingProgress,
  getOnboardingProgress,
  clearOnboardingProgress,
  monitorNetworkConnectivity
}; 