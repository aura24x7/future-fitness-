import React, { createContext, useContext, useState } from 'react';

interface OnboardingData {
  name?: string;
  birthday?: Date;
  fitnessGoal?: 'LOSE_WEIGHT' | 'BUILD_MUSCLE' | 'IMPROVE_FITNESS' | 'MAINTAIN_HEALTH';
  activityLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  height?: {
    value: number;
    unit: 'cm' | 'ft';
  };
  weight?: {
    value: number;
    unit: 'kg' | 'lbs';
  };
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dietaryPreference?: 'NONE' | 'VEGETARIAN' | 'VEGAN' | 'KETO' | 'PALEO';
  workoutPreference?: 'HOME' | 'GYM' | 'OUTDOOR' | 'HYBRID';
}

interface OnboardingContextType {
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  isOnboardingComplete: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const defaultOnboardingData: OnboardingData = {
  name: '',
  birthday: undefined,
  fitnessGoal: undefined,
  activityLevel: undefined,
  height: undefined,
  weight: undefined,
  gender: undefined,
  dietaryPreference: undefined,
  workoutPreference: undefined,
};

const OnboardingContext = createContext<OnboardingContextType>({
  onboardingData: defaultOnboardingData,
  updateOnboardingData: () => {},
  isOnboardingComplete: false,
  completeOnboarding: () => {},
  resetOnboarding: () => {},
});

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(defaultOnboardingData);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({
      ...prev,
      ...data,
    }));
  };

  const completeOnboarding = () => {
    setIsOnboardingComplete(true);
  };

  const resetOnboarding = () => {
    setOnboardingData(defaultOnboardingData);
    setIsOnboardingComplete(false);
  };

  return (
    <OnboardingContext.Provider
      value={{
        onboardingData,
        updateOnboardingData,
        isOnboardingComplete,
        completeOnboarding,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export default OnboardingContext;
