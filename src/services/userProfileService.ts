import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingData } from '../contexts/OnboardingContext';
import { firestore } from '../firebase/firebaseInit';
import { getAuth } from 'firebase/auth';
import { 
  Timestamp, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection,
  DocumentReference 
} from 'firebase/firestore';
import {
  getDocument,
  setDocument,
  updateDocument
} from './firebase/firebaseUtils';
import { useAuth } from '../contexts/AuthContext';
import * as FirebaseCompat from '../utils/firebaseCompatibility';

const USER_PROFILE_KEY = '@aifit_user_profile';
const auth = getAuth();

export interface UserProfile {
  uid: string;
  id: string;
  email: string;
  name: string;
  displayName: string;
  username?: string;
  birthday?: Date | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | null;
  height?: {
    value: number;
    unit: "cm" | "ft";
  } | null;
  weight?: {
    value: number;
    unit: string;
  } | null;
  targetWeight?: {
    value: number;
    unit: string;
  } | null;
  weightTargetDate?: Date | null;
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
  onboardingComplete?: boolean;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

class UserProfileService {
  private static instance: UserProfileService;
  private currentProfile: UserProfile | null = null;
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  private constructor() {}

  static getInstance(): UserProfileService {
    if (!UserProfileService.instance) {
      UserProfileService.instance = new UserProfileService();
    }
    return UserProfileService.instance;
  }

  private async waitForAuth(retries = 0): Promise<void> {
    try {
      // Try using the compatibility layer first
      const authCompat = FirebaseCompat.auth();
      if (authCompat && authCompat.currentUser) {
        console.log('[UserProfileService] Auth ready using compatibility layer');
        return;
      }

      // Fallback to web Firebase
      if (auth.currentUser) {
        console.log('[UserProfileService] Auth ready using web Firebase');
        return;
      }
      
      if (retries >= this.maxRetries) {
        throw new Error('No authenticated user after maximum retries');
      }

      // Wait for a bit before retrying
      console.log(`[UserProfileService] Waiting for auth, retry ${retries + 1}/${this.maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      
      // Try again
      return this.waitForAuth(retries + 1);
    } catch (error) {
      console.error('[UserProfileService] Error in waitForAuth:', error);
      if (retries >= this.maxRetries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      return this.waitForAuth(retries + 1);
    }
  }

  async getProfile(): Promise<UserProfile | null> {
    try {
      await this.waitForAuth();
      
      // Try using the compatibility layer first
      try {
        console.log('[UserProfileService] Getting user from compatibility layer');
        const authCompat = FirebaseCompat.auth();
        if (authCompat && authCompat.currentUser) {
          const uid = authCompat.currentUser.uid;
          console.log('[UserProfileService] Getting profile for user:', uid);
          
          // Try getting document using the compatibility layer
          try {
            const docSnap = await FirebaseCompat.getDoc('users', uid);
            if (docSnap.exists) {
              const profile = docSnap.data() as UserProfile;
              this.currentProfile = profile;
              console.log('[UserProfileService] Profile loaded using compatibility layer');
              return profile;
            }
          } catch (compatError) {
            console.error('[UserProfileService] Error getting profile with compatibility layer:', compatError);
          }
          
          // Fall back to firebaseUtils
          try {
            const profile = await getDocument<UserProfile>('users', uid);
            if (profile) {
              this.currentProfile = profile;
              console.log('[UserProfileService] Profile loaded using firebaseUtils');
              return profile;
            }
          } catch (utilsError) {
            console.error('[UserProfileService] Error getting profile with firebaseUtils:', utilsError);
          }
        }
      } catch (compatAuthError) {
        console.error('[UserProfileService] Error with compatibility auth:', compatAuthError);
      }
      
      // Fall back to web Firebase as a last resort
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.warn('[UserProfileService] No authenticated user found');
          return null;
        }
        
        console.log('[UserProfileService] Getting profile with web Firebase for user:', currentUser.uid);
        const docRef = doc(firestore, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const profile = { id: docSnap.id, ...docSnap.data() } as UserProfile;
          this.currentProfile = profile;
          console.log('[UserProfileService] Profile loaded using web Firebase');
          return profile;
        }
      } catch (nativeError) {
        console.error('[UserProfileService] Error with web Firebase:', nativeError);
      }
      
      console.log('[UserProfileService] No profile found after trying all methods');
      return null;
    } catch (error) {
      console.error('[UserProfileService] Error in getProfile:', error);
      return null;
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

  async createUserProfile(onboardingData: OnboardingData): Promise<UserProfile | null> {
    try {
      await this.waitForAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const metrics = this.calculateMetrics(onboardingData);
      const timestamp = Timestamp.now();

      const profile: UserProfile = {
        uid: currentUser.uid,
        id: currentUser.uid,
        email: currentUser.email || '',
        name: onboardingData.name || '',
        displayName: onboardingData.name || '',
        username: currentUser.displayName || undefined,
        birthday: onboardingData.birthday || null,
        gender: onboardingData.gender || null,
        height: onboardingData.height || null,
        weight: onboardingData.weight || null,
        targetWeight: onboardingData.targetWeight || null,
        weightTargetDate: onboardingData.weightTargetDate || null,
        fitnessGoal: onboardingData.fitnessGoal,
        activityLevel: onboardingData.lifestyle,
        dietaryPreference: onboardingData.dietaryPreference,
        workoutPreference: onboardingData.workoutPreference,
        country: onboardingData.country,
        state: onboardingData.state,
        weightGoal: onboardingData.weightGoal,
        metrics,
        preferences: {
          notifications: true,
          measurementSystem: 'metric',
          language: 'en'
        },
        onboardingComplete: false,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      // Try the most reliable method first - Firebase compatibility layer
      try {
        console.log('[UserProfileService] Attempting to create profile with Firebase compatibility layer...');
        await FirebaseCompat.setDoc('users', currentUser.uid, profile);
        console.log('[UserProfileService] Profile created successfully using Firebase compatibility layer');
        this.currentProfile = profile;
        return profile;
      } catch (compatError) {
        console.error('[UserProfileService] Error in compatibility layer:', compatError);
        
        // If compatibility layer fails, try firebaseUtils
        try {
          console.log('[UserProfileService] Attempting to create profile with firebaseUtils...');
          await setDocument('users', currentUser.uid, profile);
          console.log('[UserProfileService] Profile created successfully using firebaseUtils');
          this.currentProfile = profile;
          return profile;
        } catch (utilsError) {
          console.error('[UserProfileService] Error in setDocument:', utilsError);
          
          // If firebaseUtils fails, try direct Firestore access as a last resort
          console.log('[UserProfileService] Attempting direct Firestore access as last resort...');
          const docRef = doc(firestore, 'users', currentUser.uid);
          await setDoc(docRef, profile);
          
          console.log('[UserProfileService] Profile created successfully using direct Firestore access');
          this.currentProfile = profile;
          return profile;
        }
      }
    } catch (error) {
      console.error('[UserProfileService] Error creating user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      await this.waitForAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const timestamp = Timestamp.now();
      const updatedData = {
        ...updates,
        updatedAt: timestamp
      };

      try {
        // Using firebaseUtils to ensure consistent Firebase usage pattern
        await updateDocument('users', currentUser.uid, updatedData);
      } catch (error) {
        console.error('Error in updateDocument:', error);
        
        // If using firebaseUtils fails, try compatibility layer as a fallback
        console.log('Attempting Firebase compatibility layer as fallback...');
        try {
          await FirebaseCompat.updateDoc('users', currentUser.uid, updatedData);
          console.log('Profile updated using Firebase compatibility layer');
        } catch (compatError) {
          console.error('Error in compatibility layer:', compatError);
          
          // If compatibility layer fails, try direct Firestore access as a last resort
          console.log('Attempting direct Firestore access as last resort...');
          const docRef = doc(firestore, 'users', currentUser.uid);
          await updateDoc(docRef, updatedData);
          
          console.log('Profile updated using direct Firestore access');
        }
      }
      
      // Get the updated profile
      return this.getProfile();
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async updateOnboardingStatus(isComplete: boolean): Promise<void> {
    try {
      await this.waitForAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      console.log('[UserProfileService] Updating onboarding status to:', isComplete);
      
      try {
        // Using firebaseUtils to ensure consistent Firebase usage pattern
        await updateDocument('users', currentUser.uid, {
          onboardingComplete: isComplete,
          updatedAt: Timestamp.now()
        });
      } catch (error) {
        console.error('Error in updateDocument:', error);
        
        // If using firebaseUtils fails, try compatibility layer as a fallback
        console.log('Attempting Firebase compatibility layer as fallback...');
        try {
          await FirebaseCompat.updateDoc('users', currentUser.uid, {
            onboardingComplete: isComplete,
            updatedAt: FirebaseCompat.timestamp()
          });
          console.log('Onboarding status updated using Firebase compatibility layer');
        } catch (compatError) {
          console.error('Error in compatibility layer:', compatError);
          
          // If compatibility layer fails, try direct Firestore access as a last resort
          console.log('Attempting direct Firestore access as last resort...');
          const docRef = doc(firestore, 'users', currentUser.uid);
          await updateDoc(docRef, {
            onboardingComplete: isComplete,
            updatedAt: Timestamp.now()
          });
          
          console.log('Onboarding status updated using direct Firestore access');
        }
      }
      
      // Also update the local profile if we have one
      if (this.currentProfile) {
        this.currentProfile.onboardingComplete = isComplete;
      }
      
      console.log('[UserProfileService] Onboarding status updated successfully');
    } catch (error) {
      console.error('[UserProfileService] Error updating onboarding status:', error);
      throw error;
    }
  }

  async syncProfileWithOnboarding(onboardingData: OnboardingData): Promise<UserProfile | null> {
    try {
      await this.waitForAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Get existing profile
      const existingProfile = await this.getProfile();
      if (!existingProfile) {
        // If no profile exists, create a new one
        return this.createUserProfile(onboardingData);
      }

      // Update metrics based on onboarding data
      const metrics = this.calculateMetrics(onboardingData);
      const timestamp = Timestamp.now();

      const updates: Partial<UserProfile> = {
        name: onboardingData.name || existingProfile.name,
        displayName: onboardingData.name || existingProfile.displayName,
        birthday: onboardingData.birthday || existingProfile.birthday,
        gender: onboardingData.gender || existingProfile.gender,
        height: onboardingData.height || existingProfile.height,
        weight: onboardingData.weight || existingProfile.weight,
        targetWeight: onboardingData.targetWeight || existingProfile.targetWeight,
        weightTargetDate: onboardingData.weightTargetDate || existingProfile.weightTargetDate,
        fitnessGoal: onboardingData.fitnessGoal || existingProfile.fitnessGoal,
        activityLevel: onboardingData.lifestyle || existingProfile.activityLevel,
        dietaryPreference: onboardingData.dietaryPreference || existingProfile.dietaryPreference,
        workoutPreference: onboardingData.workoutPreference || existingProfile.workoutPreference,
        country: onboardingData.country || existingProfile.country,
        state: onboardingData.state || existingProfile.state,
        weightGoal: onboardingData.weightGoal || existingProfile.weightGoal,
        metrics,
        updatedAt: timestamp
      };

      // Update the profile
      return this.updateUserProfile(updates);
    } catch (error) {
      console.error('Error syncing profile with onboarding:', error);
      throw error;
    }
  }
}

export const userProfileService = UserProfileService.getInstance();
