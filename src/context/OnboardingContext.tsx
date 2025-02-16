import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userProfileService } from '../services/userProfileService';
import { useAuth } from './AuthContext'; // Assuming useAuth hook is defined in this file

export const ONBOARDING_STORAGE_KEY = '@aifit_onboarding_data';
export const ONBOARDING_COMPLETE_KEY = '@aifit_onboarding_complete';

export interface OnboardingData {
  name?: string;
  birthday?: Date;
  fitnessGoal?: 'LOSE_WEIGHT' | 'BUILD_MUSCLE' | 'IMPROVE_FITNESS' | 'MAINTAIN_HEALTH';
  lifestyle?: 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'SUPER_ACTIVE';
  height?: {
    value: number;
    unit: 'cm' | 'ft';
  };
  weight?: {
    value: number;
    unit: 'kg' | 'lbs';
  };
  targetWeight?: {
    value: number;
    unit: 'kg' | 'lbs';
  };
  weightGoal?: 'LOSE_WEIGHT' | 'MAINTAIN_WEIGHT' | 'GAIN_WEIGHT';
  weightGoalDate?: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dietaryPreference?: 'NONE' | 'VEGETARIAN' | 'VEGAN' | 'KETO' | 'PALEO';
  workoutPreference?: 'HOME' | 'GYM' | 'OUTDOOR' | 'HYBRID';
  country?: string;
  state?: string;
}

interface OnboardingContextType {
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => Promise<void>;
  isOnboardingComplete: boolean;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  isLoading: boolean;
}

const defaultOnboardingData: OnboardingData = {
  name: '',
  birthday: undefined,
  fitnessGoal: undefined,
  lifestyle: undefined,
  height: undefined,
  weight: undefined,
  targetWeight: undefined,
  weightGoal: undefined,
  gender: undefined,
  dietaryPreference: undefined,
  workoutPreference: undefined,
  country: '',
  state: '',
};

const OnboardingContext = createContext<OnboardingContextType>({
  onboardingData: defaultOnboardingData,
  updateOnboardingData: async () => {},
  isOnboardingComplete: false,
  completeOnboarding: async () => {},
  resetOnboarding: async () => {},
  isLoading: true,
});

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(defaultOnboardingData);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading, completeOnboarding: authCompleteOnboarding } = useAuth();

  useEffect(() => {
    const loadOnboardingState = async () => {
      // Wait for auth to be initialized
      if (authLoading) {
        return;
      }

      // If no user, reset state and stop loading
      if (!user) {
        setOnboardingData(defaultOnboardingData);
        setIsOnboardingComplete(false);
        setIsLoading(false);
        return;
      }

      try {
        const [storedData, storedComplete] = await Promise.all([
          AsyncStorage.getItem(`${ONBOARDING_STORAGE_KEY}_${user.uid}`),
          AsyncStorage.getItem(`${ONBOARDING_COMPLETE_KEY}_${user.uid}`),
        ]);

        let currentOnboardingData = defaultOnboardingData;

        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData);
            if (parsedData.birthday) {
              parsedData.birthday = new Date(parsedData.birthday);
            }
            currentOnboardingData = {
              ...defaultOnboardingData,
              ...parsedData
            };
            setOnboardingData(currentOnboardingData);
          } catch (parseError) {
            console.error('Error parsing stored onboarding data:', parseError);
            setOnboardingData(defaultOnboardingData);
          }
        }

        // For new users, ensure onboarding is not marked as complete
        const isComplete = storedComplete === 'true';
        if (!storedComplete) {
          await AsyncStorage.setItem(`${ONBOARDING_COMPLETE_KEY}_${user.uid}`, 'false');
        }
        setIsOnboardingComplete(isComplete);

        if (isComplete && currentOnboardingData) {
          try {
            const profile = await userProfileService.getCurrentProfile();
            if (!profile) {
              await userProfileService.createUserProfile(currentOnboardingData);
            }
          } catch (profileError) {
            console.error('Error handling user profile:', profileError);
          }
        }
      } catch (error) {
        console.error('Error loading onboarding state:', error);
        setOnboardingData(defaultOnboardingData);
        setIsOnboardingComplete(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadOnboardingState();
  }, [user, authLoading]);

  const updateOnboardingData = async (data: Partial<OnboardingData>) => {
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      const updatedData = {
        ...onboardingData,
        ...data
      };
      
      const sanitizedData = {
        ...defaultOnboardingData,
        ...updatedData
      };

      setOnboardingData(sanitizedData);
      await AsyncStorage.setItem(
        `${ONBOARDING_STORAGE_KEY}_${user.uid}`,
        JSON.stringify(sanitizedData)
      );
    } catch (error) {
      console.error('Error updating onboarding data:', error);
      throw error;
    }
  };

  const completeOnboarding = async () => {
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      // First create/update the user profile with onboarding data
      await userProfileService.createUserProfile(onboardingData);
      
      // Then mark onboarding as complete in auth context
      await authCompleteOnboarding();
      
      // Finally update local state
      setIsOnboardingComplete(true);
      
      console.log('Onboarding completed successfully');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  const resetOnboarding = async () => {
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      await Promise.all([
        AsyncStorage.removeItem(`${ONBOARDING_STORAGE_KEY}_${user.uid}`),
        AsyncStorage.removeItem(`${ONBOARDING_COMPLETE_KEY}_${user.uid}`),
      ]);
      setOnboardingData(defaultOnboardingData);
      setIsOnboardingComplete(false);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      throw error;
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        onboardingData,
        updateOnboardingData,
        isOnboardingComplete,
        completeOnboarding,
        resetOnboarding,
        isLoading,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export default OnboardingContext;
