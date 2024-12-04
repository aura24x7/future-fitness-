import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OnboardingData {
  name?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  birthday?: string;
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
  lifestyle?: 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'SUPER_ACTIVE';
  weightGoal?: 'LOSE_WEIGHT' | 'MAINTAIN_WEIGHT' | 'GAIN_WEIGHT';
  workoutPreference?: 'HOME' | 'GYM' | 'OUTDOOR';
  dietaryPreference?: 'NONE' | 'VEGETARIAN' | 'VEGAN' | 'KETO' | 'PALEO';
  country?: string;
  state?: string;
}

const ONBOARDING_DATA_KEY = '@onboarding_data';

export const useOnboarding = () => {
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOnboardingData();
  }, []);

  const loadOnboardingData = async () => {
    try {
      const data = await AsyncStorage.getItem(ONBOARDING_DATA_KEY);
      if (data) {
        setOnboardingData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading onboarding data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveOnboardingData = async (data: OnboardingData) => {
    try {
      await AsyncStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(data));
      setOnboardingData(data);
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

  return {
    onboardingData,
    loading,
    saveOnboardingData,
  };
};
