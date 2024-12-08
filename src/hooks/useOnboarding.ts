import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { firestoreService } from '../services/firestore.service';

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
  completed?: boolean;
  lastUpdated?: number;
  progress?: number;
  currentStep?: number;
}

const ONBOARDING_DATA_KEY = '@onboarding_data';

export const useOnboarding = () => {
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'error'>('synced');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || null);
      if (user) {
        loadFirestoreData(user.uid);
      } else {
        loadLocalData();
      }
    });

    return () => unsubscribe();
  }, []);

  const loadFirestoreData = async (uid: string) => {
    try {
      setSyncStatus('pending');
      const userData = await firestoreService.getUserData(uid);
      
      if (userData?.onboarding) {
        const onboardingData = userData.onboarding;
        setOnboardingData(onboardingData);
        // Update local storage for offline access
        await AsyncStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(onboardingData));
        setSyncStatus('synced');
      } else {
        // If no Firestore data, try loading from local storage
        await loadLocalData();
      }
    } catch (error) {
      console.error('Error loading Firestore onboarding data:', error);
      setError('Failed to load onboarding data from server');
      setSyncStatus('error');
      await loadLocalData();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalData = async () => {
    try {
      const data = await AsyncStorage.getItem(ONBOARDING_DATA_KEY);
      if (data) {
        setOnboardingData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading local onboarding data:', error);
      setError('Failed to load saved onboarding data');
    } finally {
      setLoading(false);
    }
  };

  const saveOnboardingData = async (data: Partial<OnboardingData>) => {
    try {
      setSyncStatus('pending');
      setError(null);
      
      // Calculate progress
      const totalSteps = 10; // Total number of onboarding steps
      const completedFields = Object.keys(data).filter(key => data[key] !== undefined).length;
      const progress = Math.min((completedFields / totalSteps) * 100, 100);

      // Add metadata
      const dataWithMetadata = {
        ...data,
        lastUpdated: Date.now(),
        progress,
        currentStep: data.currentStep || onboardingData?.currentStep || 1,
      };

      // Always save to local storage
      await AsyncStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(dataWithMetadata));
      
      // If user is authenticated, save to Firestore
      if (userId) {
        await firestoreService.updateOnboardingData(userId, dataWithMetadata);
        
        // If this is the final step, mark onboarding as complete
        if (data.completed) {
          await firestoreService.markOnboardingComplete(userId);
        }
      }

      setOnboardingData(prev => ({ ...prev, ...dataWithMetadata }));
      setSyncStatus('synced');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      setError('Failed to save onboarding data');
      setSyncStatus('error');
      throw error;
    }
  };

  const isOnboardingComplete = (): boolean => {
    return onboardingData?.completed || false;
  };

  const getProgress = (): number => {
    return onboardingData?.progress || 0;
  };

  const getCurrentStep = (): number => {
    return onboardingData?.currentStep || 1;
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_DATA_KEY);
      setOnboardingData(null);
      
      if (userId) {
        await firestoreService.updateOnboardingData(userId, {
          completed: false,
          progress: 0,
          currentStep: 1,
        });
      }
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      setError('Failed to reset onboarding');
    }
  };

  return {
    onboardingData,
    loading,
    error,
    syncStatus,
    saveOnboardingData,
    isOnboardingComplete,
    getProgress,
    getCurrentStep,
    resetOnboarding,
  };
};
