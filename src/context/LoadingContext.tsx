import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as SplashScreen from 'expo-splash-screen';
import { initializeApp, initializeFirebaseAuth, hasCachedCredentials } from '../utils/AppInitializer';
import { loadProfile, isProfileLoading } from '../utils/ProfileManager';

interface LoadingState {
  firebase: boolean;
  auth: boolean;
  profile: boolean;
  assets: boolean;
}

interface LoadingContextType {
  isLoading: boolean;
  loadingState: LoadingState;
  progress: number;
  setLoadingState: (state: Partial<LoadingState>) => void;
}

const initialLoadingState: LoadingState = {
  firebase: true,
  auth: true,
  profile: true,
  assets: true,
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loadingState, setLoadingStateInternal] = useState<LoadingState>(initialLoadingState);
  const { isAuthenticated, user } = useAuth();
  const [authInitialized, setAuthInitialized] = useState(false);
  const [appInitialized, setAppInitialized] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileLoadAttempts, setProfileLoadAttempts] = useState(0);

  // Calculate overall loading state - consider both loading states and initialization
  const isLoading = Object.values(loadingState).some(state => state) || !appInitialized || !authInitialized;

  // Calculate progress (0 to 1)
  const progress = Object.values(loadingState).filter(state => !state).length / Object.values(loadingState).length;

  // Update loading states
  const setLoadingState = (newState: Partial<LoadingState>) => {
    setLoadingStateInternal(prev => ({
      ...prev,
      ...newState,
    }));
  };

  // Check for cached credentials
  useEffect(() => {
    const checkCredentials = async () => {
      const hasCache = await hasCachedCredentials();
      setHasCredentials(hasCache);
    };
    checkCredentials();
  }, []);

  // Handle app initialization
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeApp();
        setAppInitialized(true);
      } catch (error) {
        console.error('Error during app initialization:', error);
        setAppInitialized(true); // Still set to true to prevent blocking
      }
    };

    initialize();
  }, []);

  // Handle Firebase initialization
  useEffect(() => {
    const initFirebase = async () => {
      try {
        await initializeFirebaseAuth();
        setLoadingState({ firebase: false });
      } catch (error) {
        console.error('Error initializing Firebase:', error);
        setLoadingState({ firebase: false });
      }
    };

    if (appInitialized) {
      initFirebase();
    }
  }, [appInitialized]);

  // Handle Auth state
  useEffect(() => {
    if (!hasCredentials || isAuthenticated !== undefined) {
      setAuthInitialized(true);
      setLoadingState({ auth: false });
    }
  }, [hasCredentials, isAuthenticated]);

  // Handle Profile loading with retries
  useEffect(() => {
    const loadUserProfile = async () => {
      // Only proceed if auth is ready and we have a user
      if (!user || loadingState.auth) return;

      try {
        // Check if profile is already loading
        const isLoading = await isProfileLoading(user.uid);
        if (isLoading) {
          // Wait and retry
          setTimeout(() => setProfileLoadAttempts(prev => prev + 1), 1000);
          return;
        }

        // Try to load profile
        const profile = await loadProfile(user.uid);
        if (profile) {
          setProfileLoaded(true);
          setLoadingState({ profile: false });
        } else if (profileLoadAttempts < 3) {
          // Retry if profile load failed
          setTimeout(() => setProfileLoadAttempts(prev => prev + 1), 1000);
        } else {
          // Give up after 3 attempts
          setLoadingState({ profile: false });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        if (profileLoadAttempts < 3) {
          // Retry on error
          setTimeout(() => setProfileLoadAttempts(prev => prev + 1), 1000);
        } else {
          // Give up after 3 attempts
          setLoadingState({ profile: false });
        }
      }
    };

    if (!isAuthenticated) {
      setLoadingState({ profile: false });
      return;
    }

    loadUserProfile();
  }, [isAuthenticated, user, loadingState.auth, profileLoadAttempts]);

  // Handle Assets loading
  useEffect(() => {
    const loadAssets = async () => {
      try {
        await Promise.all([
          // Add any required assets here
          new Promise(resolve => setTimeout(resolve, 3000)), // Minimum display time of 3 seconds
        ]);
        setLoadingState({ assets: false });
      } catch (error) {
        console.error('Error loading assets:', error);
        setLoadingState({ assets: false });
      }
    };

    // Only load assets after Firebase is initialized
    if (!loadingState.firebase) {
      loadAssets();
    }
  }, [loadingState.firebase]);

  const value = {
    isLoading,
    loadingState,
    progress,
    setLoadingState,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
}; 