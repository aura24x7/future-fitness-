import { useState, useEffect, useCallback } from 'react';
import { userProfileService, UserProfile } from '../services/userProfileService';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load profile
  useEffect(() => {
    loadProfile();
  }, []);

  // Load profile function
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userProfile = await userProfileService.getProfile();
      setProfile(userProfile);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load profile'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Update profile function
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedProfile = await userProfileService.updateProfile(updates);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get calculated metrics
  const getMetrics = useCallback(() => {
    if (!profile?.metrics) return null;
    return {
      bmi: profile.metrics.bmi,
      bmr: profile.metrics.bmr,
      tdee: profile.metrics.tdee,
      recommendedCalories: profile.metrics.recommendedCalories,
    };
  }, [profile?.metrics]);

  // Get measurement preferences
  const getMeasurementSystem = useCallback(() => {
    return profile?.preferences?.measurementSystem || 'metric';
  }, [profile?.preferences?.measurementSystem]);

  return {
    profile,
    loading,
    error,
    loadProfile,
    updateProfile,
    getMetrics,
    getMeasurementSystem,
  };
}
