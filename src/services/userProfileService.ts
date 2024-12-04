import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingData } from '../context/OnboardingContext';

const USER_PROFILE_KEY = '@aifit_user_profile';

export interface UserProfile extends OnboardingData {
  id?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
  metrics?: {
    bmi?: number;
    bmr?: number;
    tdee?: number;
    recommendedCalories?: number;
  };
  preferences?: {
    notifications: boolean;
    measurementSystem: 'metric' | 'imperial';
    language: string;
  };
}

class UserProfileService {
  private static instance: UserProfileService;
  private currentProfile: UserProfile | null = null;

  private constructor() {}

  static getInstance(): UserProfileService {
    if (!UserProfileService.instance) {
      UserProfileService.instance = new UserProfileService();
    }
    return UserProfileService.instance;
  }

  async createUserProfile(onboardingData: OnboardingData): Promise<UserProfile> {
    try {
      const profile: UserProfile = {
        ...onboardingData,
        createdAt: new Date(),
        updatedAt: new Date(),
        metrics: this.calculateMetrics(onboardingData),
        preferences: {
          notifications: true,
          measurementSystem: onboardingData.height?.unit === 'cm' ? 'metric' : 'imperial',
          language: 'en',
        },
      };

      await this.saveProfile(profile);
      this.currentProfile = profile;
      return profile;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw new Error('Failed to create user profile');
    }
  }

  private calculateMetrics(data: OnboardingData) {
    const metrics: UserProfile['metrics'] = {};

    if (data.height?.value && data.weight?.value) {
      // Convert height to meters if in feet
      const heightInM = data.height.unit === 'cm' 
        ? data.height.value / 100
        : data.height.value * 0.3048;

      // Convert weight to kg if in lbs
      const weightInKg = data.weight.unit === 'kg'
        ? data.weight.value
        : data.weight.value * 0.453592;

      // Calculate BMI
      metrics.bmi = Number((weightInKg / (heightInM * heightInM)).toFixed(1));

      // Calculate BMR using Mifflin-St Jeor Equation
      if (data.gender && data.birthday) {
        const age = new Date().getFullYear() - new Date(data.birthday).getFullYear();
        metrics.bmr = data.gender === 'MALE'
          ? (10 * weightInKg) + (6.25 * (heightInM * 100)) - (5 * age) + 5
          : (10 * weightInKg) + (6.25 * (heightInM * 100)) - (5 * age) - 161;

        // Calculate TDEE based on activity level
        const activityMultipliers = {
          BEGINNER: 1.2,
          INTERMEDIATE: 1.375,
          ADVANCED: 1.55,
          EXPERT: 1.725,
        };
        
        const multiplier = data.activityLevel 
          ? activityMultipliers[data.activityLevel]
          : 1.2;

        metrics.tdee = Math.round(metrics.bmr * multiplier);

        // Calculate recommended calories based on fitness goal
        const goalMultipliers = {
          LOSE_WEIGHT: 0.8,
          BUILD_MUSCLE: 1.1,
          IMPROVE_FITNESS: 1,
          MAINTAIN_HEALTH: 1,
        };

        const goalMultiplier = data.fitnessGoal 
          ? goalMultipliers[data.fitnessGoal]
          : 1;

        metrics.recommendedCalories = Math.round(metrics.tdee * goalMultiplier);
      }
    }

    return metrics;
  }

  async getProfile(): Promise<UserProfile | null> {
    if (this.currentProfile) {
      return this.currentProfile;
    }

    try {
      const stored = await AsyncStorage.getItem(USER_PROFILE_KEY);
      if (stored) {
        const profile = JSON.parse(stored);
        // Convert stored date strings back to Date objects
        profile.createdAt = new Date(profile.createdAt);
        profile.updatedAt = new Date(profile.updatedAt);
        if (profile.birthday) {
          profile.birthday = new Date(profile.birthday);
        }
        this.currentProfile = profile;
        return profile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const currentProfile = await this.getProfile();
      if (!currentProfile) {
        throw new Error('No profile exists to update');
      }

      const updatedProfile: UserProfile = {
        ...currentProfile,
        ...updates,
        updatedAt: new Date(),
      };

      // Recalculate metrics if relevant data was updated
      if (
        updates.height ||
        updates.weight ||
        updates.gender ||
        updates.birthday ||
        updates.activityLevel ||
        updates.fitnessGoal
      ) {
        updatedProfile.metrics = this.calculateMetrics(updatedProfile);
      }

      await this.saveProfile(updatedProfile);
      this.currentProfile = updatedProfile;
      return updatedProfile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  private async saveProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw new Error('Failed to save user profile');
    }
  }

  async deleteProfile(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_PROFILE_KEY);
      this.currentProfile = null;
    } catch (error) {
      console.error('Error deleting user profile:', error);
      throw new Error('Failed to delete user profile');
    }
  }
}

export const userProfileService = UserProfileService.getInstance();
