import React, { createContext, useContext, useState, useEffect } from 'react';
import { userProfileService, UserProfile } from '../services/userProfileService';
import { useAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import the Firebase compatibility layer
import * as FirebaseCompat from '../utils/firebaseCompatibility';
// Import from our synchronized Firebase initialization
import { firestore } from '../firebase/firebaseInit';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

interface ProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  syncProfile: () => Promise<void>;
  forceProfileRefresh: () => Promise<void>;
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
  const { user, isAuthenticated, checkOnboardingStatus } = useAuth();

  // Initialize the Firebase compatibility layer when the component mounts
  useEffect(() => {
    // Check that the Firebase compatibility layer is initialized
    if (!FirebaseCompat.getFirestore() || !FirebaseCompat.getAuth()) {
      console.warn('[ProfileContext] Firebase compatibility layer not properly initialized');
    } else {
      console.log('[ProfileContext] Firebase compatibility layer initialized successfully');
    }
  }, []);

  // Direct Firestore access fallback
  const getProfileDirectly = async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('[ProfileContext] Attempting direct Firestore access for profile');
      
      // Try using the compatibility layer first
      try {
        const docSnap = await FirebaseCompat.getDoc('users', userId);
        if (docSnap.exists) {
          console.log('[ProfileContext] Profile found via compatibility layer');
          return docSnap.data() as UserProfile;
        }
      } catch (compatError) {
        console.error('[ProfileContext] Error in compatibility layer:', compatError);
      }
      
      // Try direct Firestore access
      try {
        const userDocRef = doc(firestore, 'users', userId);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
          console.log('[ProfileContext] Profile found via direct Firestore access');
          return {
            id: docSnap.id,
            ...docSnap.data()
          } as UserProfile;
        }
      } catch (firestoreError) {
        console.error('[ProfileContext] Error in direct Firestore access:', firestoreError);
      }
      
      return null;
    } catch (error) {
      console.error('[ProfileContext] Error in getProfileDirectly:', error);
      return null;
    }
  };

  const loadProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('[ProfileContext] Loading profile for user:', user.uid);
      
      // First attempt: Use userProfileService
      let userProfile = await userProfileService.getProfile();
      
      // Second attempt: Try direct Firestore access if userProfileService fails
      if (!userProfile) {
        console.log('[ProfileContext] userProfileService failed, trying direct access');
        userProfile = await getProfileDirectly(user.uid);
      }
      
      // If we found a profile, use it
      if (userProfile) {
        console.log('[ProfileContext] User profile loaded successfully');
        setProfile(userProfile);
        
        // If the profile exists but onboarding status wasn't set correctly, update it
        if (userProfile.onboardingComplete !== true && isAuthenticated) {
          console.log('[ProfileContext] Found profile but onboardingComplete is not true, fixing...');
          try {
            // Update just the onboardingComplete flag
            await updateProfile({ onboardingComplete: true });
            
            // Call checkOnboardingStatus to update the auth context
            await checkOnboardingStatus();
          } catch (updateError) {
            console.error('[ProfileContext] Error fixing onboardingComplete flag:', updateError);
          }
        }
      } else {
        // If no profile exists, try to create one from onboarding data
        console.log('[ProfileContext] No profile found, checking for onboarding data');
        const onboardingData = await AsyncStorage.getItem(`@onboarding_${user.uid}`);
        if (onboardingData) {
          const parsedOnboardingData = JSON.parse(onboardingData);
          console.log('[ProfileContext] Creating user profile from onboarding data');
          const newProfile = await userProfileService.createUserProfile(parsedOnboardingData);
          if (newProfile) {
            setProfile(newProfile);
            console.log('[ProfileContext] Profile created successfully');
          } else {
            throw new Error('Failed to create profile from onboarding data');
          }
        } else {
          console.log('[ProfileContext] No onboarding data found');
        }
      }
    } catch (error) {
      console.error('[ProfileContext] Error loading profile:', error);
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
        console.warn('[ProfileContext] No onboarding data found for sync');
        return;
      }
      
      const parsedOnboardingData = JSON.parse(onboardingData);
      const updatedProfile = await userProfileService.syncProfileWithOnboarding(parsedOnboardingData);
      if (updatedProfile) {
        setProfile(updatedProfile);
        console.log('[ProfileContext] Profile synced successfully');
      }
    } catch (error) {
      console.error('[ProfileContext] Error syncing profile:', error);
      setError(error instanceof Error ? error : new Error('Failed to sync profile'));
    } finally {
      setLoading(false);
    }
  };

  // Force a complete profile refresh bypassing caches
  const forceProfileRefresh = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('[ProfileContext] Forcing profile refresh for user:', user.uid);
      
      // Try direct Firestore access
      const userProfile = await getProfileDirectly(user.uid);
      
      if (userProfile) {
        setProfile(userProfile);
        console.log('[ProfileContext] Profile refreshed successfully');
      } else {
        console.log('[ProfileContext] No profile found during forced refresh');
        // Trigger normal load profile which will try to create one if needed
        await loadProfile();
      }
    } catch (error) {
      console.error('[ProfileContext] Error during forced profile refresh:', error);
      setError(error instanceof Error ? error : new Error('Failed to refresh profile'));
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

  // Update profile when isAuthenticated changes (onboarding completes)
  useEffect(() => {
    if (user && isAuthenticated && profile && profile.onboardingComplete !== true) {
      console.log('[ProfileContext] Detected onboarding completion, updating profile');
      updateProfile({ onboardingComplete: true }).catch(err => 
        console.error('[ProfileContext] Error updating onboardingComplete:', err)
      );
    }
  }, [user, isAuthenticated, profile]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // First try using userProfileService
      let updatedProfile = null;
      try {
        updatedProfile = await userProfileService.updateUserProfile(updates);
      } catch (serviceError) {
        console.error('[ProfileContext] Error updating with userProfileService:', serviceError);
        
        // If that fails, try direct Firebase update
        try {
          console.log('[ProfileContext] Attempting direct Firestore update');
          const currentProfile = await getProfileDirectly(user.uid);
          
          if (currentProfile) {
            const updatedData = {
              ...currentProfile,
              ...updates,
              updatedAt: Timestamp.now()
            };
            
            try {
              // Try compatibility layer first
              await FirebaseCompat.setDoc('users', user.uid, updatedData);
              updatedProfile = updatedData;
              console.log('[ProfileContext] Profile updated using compatibility layer');
            } catch (compatError) {
              console.error('[ProfileContext] Error updating with compatibility layer:', compatError);
              
              // Try direct Firestore as last resort
              const userDocRef = doc(firestore, 'users', user.uid);
              await setDoc(userDocRef, updatedData);
              updatedProfile = updatedData;
              console.log('[ProfileContext] Profile updated using direct Firestore');
            }
          }
        } catch (directError) {
          console.error('[ProfileContext] Error in direct Firestore update:', directError);
          throw directError;
        }
      }
      
      if (updatedProfile) {
        setProfile(updatedProfile);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update profile');
      setError(error);
      console.error('[ProfileContext] Error updating profile:', err);
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
        console.log('[ProfileContext] Profile refreshed successfully');
      } else {
        console.log('[ProfileContext] No profile found during refresh, trying loadProfile');
        await loadProfile(); // Try to create profile if it doesn't exist
      }
    } catch (error) {
      console.error('[ProfileContext] Error refreshing profile:', error);
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
        forceProfileRefresh
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileContext;
