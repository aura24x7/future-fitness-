import React, { createContext, useContext, useState, useEffect } from 'react';
import { userProfileService, UserProfile } from '../services/userProfileService';
import { useAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  syncProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const loadProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userProfile = await userProfileService.getProfile();
      
      if (userProfile) {
        setProfile(userProfile);
      } else {
        // If no profile exists, try to create one from onboarding data
        const onboardingData = await AsyncStorage.getItem(`@onboarding_${user.uid}`);
        if (onboardingData) {
          const parsedOnboardingData = JSON.parse(onboardingData);
          const newProfile = await userProfileService.createUserProfile(parsedOnboardingData);
          if (newProfile) {
            setProfile(newProfile);
          } else {
            throw new Error('Failed to create profile from onboarding data');
          }
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError(error instanceof Error ? error : new Error('Failed to load profile'));
    } finally {
      setLoading(false);
    }
  };

  const syncProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const onboardingData = await AsyncStorage.getItem(`@onboarding_${user.uid}`);
      if (!onboardingData) {
        console.warn('No onboarding data found for sync');
        return;
      }
      
      const parsedOnboardingData = JSON.parse(onboardingData);
      const updatedProfile = await userProfileService.syncProfileWithOnboarding(parsedOnboardingData);
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Error syncing profile:', error);
      setError(error instanceof Error ? error : new Error('Failed to sync profile'));
    } finally {
      setLoading(false);
    }
  };

  // Load profile when user changes or when onboarding completes
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const updatedProfile = await userProfileService.updateUserProfile(updates);
      setProfile(updatedProfile);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update profile');
      setError(error);
      console.error('Error updating profile:', err);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const userProfile = await userProfileService.getProfile();
      if (userProfile) {
        setProfile(userProfile);
      } else {
        await loadProfile(); // Try to create profile if it doesn't exist
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      setError(error instanceof Error ? error : new Error('Failed to refresh profile'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        updateProfile,
        refreshProfile,
        syncProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileContext;
