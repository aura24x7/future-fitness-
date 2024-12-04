import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userProfileService } from '../services/userProfileService';

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

  // Load onboarding state from storage
  useEffect(() => {
    const loadOnboardingState = async () => {
      try {
        const [storedData, storedComplete] = await Promise.all([
          AsyncStorage.getItem(ONBOARDING_STORAGE_KEY),
          AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY),
        ]);

        if (storedData) {
          const parsedData = JSON.parse(storedData);
          // Convert stored date string back to Date object
          if (parsedData.birthday) {
            parsedData.birthday = new Date(parsedData.birthday);
          }
          setOnboardingData(parsedData);
        }

        const isComplete = storedComplete === 'true';
        setIsOnboardingComplete(isComplete);

        // If onboarding is complete, ensure we have a user profile
        if (isComplete) {
          const profile = await userProfileService.getProfile();
          if (!profile) {
            // Create profile from onboarding data if it doesn't exist
            await userProfileService.createUserProfile(parsedData);
          }
        }
      } catch (error) {
        console.error('Error loading onboarding state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOnboardingState();
  }, []);

  const updateOnboardingData = async (data: Partial<OnboardingData>) => {
    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

  const completeOnboarding = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true'),
        userProfileService.createUserProfile(onboardingData),
      ]);
      setIsOnboardingComplete(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  const resetOnboarding = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY),
        AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY),
        userProfileService.deleteProfile(),
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
