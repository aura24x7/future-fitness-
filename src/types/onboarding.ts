import { UserMetrics } from './common/userMetrics';
import { UserPreferences } from './common/userPreferences';

/**
 * Represents the data collected during the onboarding process
 */
export interface OnboardingData {
  name: string;
  birthday: string;  // ISO date string (YYYY-MM-DD)
  gender: 'male' | 'female' | 'other';
  metrics: UserMetrics;
  preferences: UserPreferences;
  completed?: boolean;
}

/**
 * Represents the state of the onboarding process
 */
export interface OnboardingState {
  data: OnboardingData;
  currentStep: number;
  totalSteps: number;
  isLoading: boolean;
  error?: string;
} 