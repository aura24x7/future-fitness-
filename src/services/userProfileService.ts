import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingData } from '../context/OnboardingContext';
import { firebaseService } from './firebaseService';
import { auth, firestore } from '../config/firebase';
import { getDoc, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const USER_PROFILE_KEY = '@aifit_user_profile';

export interface UserProfile {
  uid: string;
  id: string;
  email: string;
  name: string;
  displayName: string;
  birthday?: Date | null;
  gender?: string;
  height?: {
    value: number;
    unit: string;
  } | null;
  weight?: {
    value: number;
    unit: string;
  } | null;
  targetWeight?: {
    value: number;
    unit: string;
  } | null;
  fitnessGoal?: string;
  activityLevel?: string;
  dietaryPreference?: string;
  workoutPreference?: string;
  country?: string;
  state?: string;
  weightGoal?: string;
  metrics?: {
    bmi: number;
    bmr: number;
    tdee: number;
    recommendedCalories: number;
  };
  preferences?: {
    notifications: boolean;
    measurementSystem: string;
    language: string;
  };
  createdAt: any;
  updatedAt: any;
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

  async getProfile(): Promise<UserProfile | null> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
      if (!userDoc.exists()) {
        return null;
      }
      const profile = userDoc.data() as UserProfile;
      this.currentProfile = profile;
      return profile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  async getCurrentProfile(): Promise<UserProfile | null> {
    return this.getProfile();
  }

  private calculateMetrics(data: OnboardingData) {
    const height = data.height?.value || 0;
    const weight = data.weight?.value || 0;
    const age = data.birthday ? Math.floor((new Date().getTime() - new Date(data.birthday).getTime()) / 31557600000) : 0;
    const gender = data.gender || 'OTHER';
    const activityLevel = data.lifestyle || 'SEDENTARY';

    console.log('Calculated age:', age);

    // Calculate BMI
    const heightInMeters = data.height?.unit === 'cm' ? height / 100 : height * 0.3048;
    const weightInKg = data.weight?.unit === 'kg' ? weight : weight * 0.453592;
    const bmi = heightInMeters > 0 ? +(weightInKg / (heightInMeters * heightInMeters)).toFixed(1) : 0;

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr = 0;
    if (gender === 'MALE') {
      bmr = 10 * weightInKg + 6.25 * (height) - 5 * age + 5;
    } else if (gender === 'FEMALE') {
      bmr = 10 * weightInKg + 6.25 * (height) - 5 * age - 161;
    } else {
      bmr = 10 * weightInKg + 6.25 * (height) - 5 * age - 78;
    }

    console.log('BMR calculated:', Math.round(bmr));
    console.log('Lifestyle:', activityLevel);

    // Calculate TDEE based on activity level
    const activityMultipliers: { [key: string]: number } = {
      SEDENTARY: 1.2,
      LIGHTLY_ACTIVE: 1.375,
      MODERATELY_ACTIVE: 1.55,
      VERY_ACTIVE: 1.725,
      SUPER_ACTIVE: 1.9
    };
    const tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.2));
    console.log('TDEE calculated:', tdee);

    // Calculate recommended calories based on weight goal
    let recommendedCalories = tdee;
    console.log('Weight Goal:', data.weightGoal);
    if (data.weightGoal === 'LOSE_WEIGHT') {
      recommendedCalories = Math.max(1200, tdee - 500);
    } else if (data.weightGoal === 'GAIN_WEIGHT') {
      recommendedCalories = tdee + 500;
    }
    console.log('Final calories calculated:', recommendedCalories);

    return {
      bmi: bmi,
      bmr: Math.round(bmr),
      tdee: tdee,
      recommendedCalories: Math.round(recommendedCalories)
    };
  }

  async createUserProfile(onboardingData: OnboardingData): Promise<UserProfile> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      const metrics = this.calculateMetrics(onboardingData);
      
      const userProfile: UserProfile = {
        uid: currentUser.uid,
        id: currentUser.uid,
        email: currentUser.email || '',
        name: onboardingData.name || '',
        displayName: onboardingData.name || '',
        birthday: onboardingData.birthday,
        gender: onboardingData.gender,
        height: onboardingData.height ? {
          value: onboardingData.height.value,
          unit: onboardingData.height.unit
        } : null,
        weight: onboardingData.weight ? {
          value: onboardingData.weight.value,
          unit: onboardingData.weight.unit
        } : null,
        targetWeight: onboardingData.targetWeight ? {
          value: onboardingData.targetWeight.value,
          unit: onboardingData.targetWeight.unit
        } : null,
        fitnessGoal: onboardingData.fitnessGoal,
        activityLevel: onboardingData.lifestyle,
        dietaryPreference: onboardingData.dietaryPreference,
        workoutPreference: onboardingData.workoutPreference,
        country: onboardingData.country,
        state: onboardingData.state,
        weightGoal: onboardingData.weightGoal,
        metrics: metrics,
        preferences: {
          notifications: true,
          measurementSystem: onboardingData.height?.unit === 'cm' ? 'metric' : 'imperial',
          language: 'en'
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(firestore, 'users', currentUser.uid), userProfile);
      this.currentProfile = userProfile;
      return userProfile;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    return this.updateUserProfile(updates);
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      const currentProfile = await this.getProfile();
      if (!currentProfile) {
        throw new Error('No existing profile found');
      }

      // Filter out undefined values
      const filteredUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      const updatedProfile = {
        ...currentProfile,
        ...filteredUpdates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(firestore, 'users', currentUser.uid), updatedProfile);
      this.currentProfile = updatedProfile;
      return updatedProfile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async syncProfileWithOnboarding(onboardingData: OnboardingData): Promise<UserProfile> {
    try {
      const currentProfile = await this.getProfile();
      if (!currentProfile) {
        return this.createUserProfile(onboardingData);
      }

      const metrics = this.calculateMetrics(onboardingData);
      
      // Only include defined values in updates
      const updates: Partial<UserProfile> = {};
      
      if (onboardingData.name) updates.name = onboardingData.name;
      if (onboardingData.name) updates.displayName = onboardingData.name;
      if (onboardingData.birthday) updates.birthday = onboardingData.birthday;
      if (onboardingData.gender) updates.gender = onboardingData.gender;
      if (onboardingData.height) updates.height = onboardingData.height;
      if (onboardingData.weight) updates.weight = onboardingData.weight;
      if (onboardingData.targetWeight) updates.targetWeight = onboardingData.targetWeight;
      if (onboardingData.fitnessGoal) updates.fitnessGoal = onboardingData.fitnessGoal;
      if (onboardingData.lifestyle) updates.activityLevel = onboardingData.lifestyle;
      if (onboardingData.dietaryPreference) updates.dietaryPreference = onboardingData.dietaryPreference;
      if (onboardingData.workoutPreference) updates.workoutPreference = onboardingData.workoutPreference;
      if (onboardingData.country) updates.country = onboardingData.country;
      if (onboardingData.state) updates.state = onboardingData.state;
      if (onboardingData.weightGoal) updates.weightGoal = onboardingData.weightGoal;
      
      // Only include metrics if they were calculated successfully
      if (metrics && Object.keys(metrics).length > 0) {
        updates.metrics = metrics;
      }

      // Only update preferences if we have height information
      if (onboardingData.height?.unit) {
        updates.preferences = {
          ...currentProfile.preferences,
          notifications: currentProfile.preferences?.notifications ?? true,
          language: currentProfile.preferences?.language ?? 'en',
          measurementSystem: onboardingData.height.unit === 'cm' ? 'metric' : 'imperial',
        };
      }

      return this.updateUserProfile(updates);
    } catch (error) {
      console.error('Error syncing profile with onboarding:', error);
      throw error;
    }
  }

  async deleteProfile(): Promise<void> {
    try {
      const user = auth.currentUser;
      if (user) {
        await firebaseService.deleteUserProfile(user.uid);
      }
      await AsyncStorage.removeItem(USER_PROFILE_KEY);
      this.currentProfile = null;
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  }
}

export const userProfileService = UserProfileService.getInstance();
