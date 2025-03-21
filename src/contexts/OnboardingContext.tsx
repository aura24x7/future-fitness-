import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { userProfileService, UserProfile } from '../services/userProfileService';
import { getAuthInstance } from '../services/firebase/firebaseUtils';
import * as FirebaseCompat from '../utils/firebaseCompatibility';
import { useAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ONBOARDING_COMPLETE_KEY } from '../constants/storage';
import { 
  lockNavigation, 
  unlockNavigation, 
  NAV_ONBOARDING_KEY 
} from '../utils/navigationUtils';

export interface OnboardingData {
  name?: string;
  birthday?: Date;
  gender?: "MALE" | "FEMALE" | "OTHER";
  height?: {
    value: number;
    unit: "cm" | "ft";
  };
  weight?: {
    value: number;
    unit: string;
  };
  targetWeight?: {
    value: number;
    unit: string;
  };
  weightTargetDate?: Date;
  fitnessGoal?: string;
  lifestyle?: string;
  dietaryPreference?: string;
  workoutPreference?: string;
  country?: string;
  state?: string;
  weightGoal?: string;
  activityLevel?: string;
}

interface OnboardingContextType {
  onboardingData: OnboardingData;
  currentStep: number;
  isComplete: boolean;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  setCurrentStep: (step: number) => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => void;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isOnboardingComplete: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { completeOnboarding: authCompleteOnboarding } = useAuth();

  // Check AsyncStorage for onboarding complete status on init
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
        if (storedValue === 'true') {
          console.log('[OnboardingContext] Found onboarding complete flag in AsyncStorage');
          setIsComplete(true);
        }
      } catch (error) {
        console.error('[OnboardingContext] Error checking AsyncStorage:', error);
      }
    };
    
    checkOnboardingStatus();
  }, []);

  const updateOnboardingData = useCallback((data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      console.log('[OnboardingContext] Starting onboarding completion process');
      setIsLoading(true);
      
      // Lock navigation to prevent competing navigation events
      await lockNavigation(NAV_ONBOARDING_KEY, 'OnboardingContext completing onboarding');
      
      // Save to AsyncStorage first as it's most reliable
      try {
        await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
        console.log('[OnboardingContext] Saved onboarding complete flag to AsyncStorage');
      } catch (asyncError) {
        console.error('[OnboardingContext] Error saving to AsyncStorage:', asyncError);
      }
      
      // Set local state early to help with navigation
      setIsComplete(true);
      console.log('[OnboardingContext] Local state updated to complete');
      
      try {
        // Try with authCompleteOnboarding from AuthContext
        await authCompleteOnboarding();
        console.log('[OnboardingContext] Auth context onboarding completion successful');
      } catch (authError) {
        console.error('[OnboardingContext] Error in auth context onboarding completion:', authError);
        
        // If auth context fails, try direct Firestore update using compatibility layer
        try {
          const auth = getAuthInstance();
          if (!auth.currentUser) {
            console.log('[OnboardingContext] No authenticated user for Firebase auth');
          } else {
            try {
              // Try using FirebaseCompat layer
              await FirebaseCompat.updateDoc('users', auth.currentUser.uid, {
                onboardingComplete: true,
                updatedAt: FirebaseCompat.timestamp()
              });
              console.log('[OnboardingContext] Updated onboarding status with compatibility layer');
            } catch (compatError) {
              console.error('[OnboardingContext] Compatibility layer update failed:', compatError);
            }
          }
        } catch (fallbackError) {
          console.error('[OnboardingContext] Fallback error:', fallbackError);
        }
      }
      
      // Try to get a fresh profile
      try {
        const profile = await userProfileService.getProfile();
        if (profile) {
          setUserProfile(profile);
          console.log('[OnboardingContext] Profile loaded after onboarding completion');
        }
      } catch (profileError) {
        console.error('[OnboardingContext] Error getting profile after onboarding:', profileError);
      }
      
      console.log('[OnboardingContext] Onboarding completion process finished');
    } catch (error) {
      console.error('[OnboardingContext] Error completing onboarding:', error);
      // Even if there's an error, we've already set the local state and AsyncStorage
      // So we can consider onboarding complete from the UI perspective
    } finally {
      // Always unlock navigation and update loading state
      await unlockNavigation(NAV_ONBOARDING_KEY);
      setIsLoading(false);
    }
  }, [onboardingData, authCompleteOnboarding]);

  const resetOnboarding = useCallback(() => {
    setOnboardingData({});
    setCurrentStep(0);
    setIsComplete(false);
    setUserProfile(null);
  }, []);

  const value = {
    onboardingData,
    currentStep,
    isComplete,
    updateOnboardingData,
    setCurrentStep,
    completeOnboarding,
    resetOnboarding,
    userProfile,
    isLoading,
    isOnboardingComplete: isComplete
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export default OnboardingContext;
