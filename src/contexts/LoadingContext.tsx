import React, { createContext, useContext, useState, useEffect } from 'react';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { firebaseCore } from '../services/firebase/firebaseCore';

interface LoadingContextType {
  isLoading: boolean;
  isInitialized: boolean;
  error: Error | null;
  progress?: number;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: true,
  isInitialized: false,
  error: null,
  progress: 0,
});

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let mounted = true;

    const initialize = async () => {
      try {
        console.log('[LoadingProvider] Starting initialization...');
        if (!mounted) return;
        setProgress(10);

        // Add initial delay to ensure native modules are ready
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (!mounted) return;
        setProgress(20);

        // Initialize Firebase first and wait for it to complete
        await firebaseCore.initialize();
        console.log('[LoadingProvider] Firebase core initialized');
        if (!mounted) return;
        setProgress(50);

        // Wait for auth to be ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!mounted) return;
        setProgress(70);

        // Verify auth is initialized
        const auth = firebaseCore.getAuth();
        if (!auth) {
          throw new Error('Auth failed to initialize');
        }

        // Set up auth listener only after Firebase is initialized
        unsubscribe = firebaseCore.onAuthStateChanged((user: FirebaseAuthTypes.User | null) => {
          if (!mounted) return;
          
          try {
            console.log('[LoadingProvider] Auth state changed, user:', user ? 'logged in' : 'logged out');
            setIsInitialized(true);
            setIsLoading(false);
            setProgress(100);
          } catch (e) {
            console.error('[LoadingProvider] Error in auth state change handler:', e);
            setError(e instanceof Error ? e : new Error('Unknown error in auth state change'));
            setIsLoading(false);
          }
        });

      } catch (e) {
        console.error('[LoadingProvider] Error during initialization:', e);
        if (!mounted) return;
        setError(e instanceof Error ? e : new Error('Unknown error during initialization'));
        setIsLoading(false);
      }
    };

    initialize();

    return () => {
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  if (error) {
    console.error('[LoadingProvider] Error state:', error);
    return (
      <LoadingContext.Provider value={{ isLoading: false, isInitialized: false, error, progress }}>
        {children}
      </LoadingContext.Provider>
    );
  }

  return (
    <LoadingContext.Provider value={{ isLoading, isInitialized, error, progress }}>
      {children}
    </LoadingContext.Provider>
  );
};