import { Timestamp } from 'firebase/firestore';
import { UserMetrics } from './common/userMetrics';
import { UserPreferences } from './common/userPreferences';

/**
 * Represents a user's profile in the application
 */
export interface UserProfile {
  id: string;
  name: string;
  birthday: Timestamp;
  gender: 'male' | 'female' | 'other';
  metrics: UserMetrics;
  preferences: UserPreferences;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Represents the state of the profile context
 */
export interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error?: string;
} 