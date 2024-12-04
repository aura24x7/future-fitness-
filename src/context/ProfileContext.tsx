import React, { createContext, useContext, useEffect, useState } from 'react';
import { userProfileService, UserProfile } from '../services/userProfileService';
import { useAuth } from './AuthContext';

interface ProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  loading: true,
  error: null,
  updateProfile: async () => {},
  refreshProfile: async () => {},
});

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
      setProfile(userProfile);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load profile'));
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load profile when user changes
  useEffect(() => {
    loadProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedProfile = await userProfileService.updateProfile(updates);
      setProfile(updatedProfile);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
      console.error('Error updating profile:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    await loadProfile();
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export default ProfileContext;
