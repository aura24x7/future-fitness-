import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ONBOARDING_COMPLETE_KEY } from './OnboardingContext';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
}

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

const AUTH_PERSISTENCE_KEY = '@auth_persistence';
const AUTH_CREDENTIALS_KEY = '@auth_credentials';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Initial load of saved auth state
  useEffect(() => {
    const initializeAuthState = async () => {
      try {
        const persistedAuth = await AsyncStorage.getItem(AUTH_PERSISTENCE_KEY);
        if (persistedAuth) {
          const userData = JSON.parse(persistedAuth);
          // Don't set authenticated state yet, wait for Firebase
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading persisted auth state:', error);
      }
    };

    initializeAuthState();
  }, []);

  // Handle auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Auth state changed:', currentUser?.email);
      setAuthInitialized(true);
      
      if (currentUser) {
        try {
          // First check if user has a profile in Firestore
          const userRef = doc(firestore, 'users', currentUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            console.log('Existing user profile found');
            // User has a profile, update persistence and login
            await AsyncStorage.setItem(AUTH_PERSISTENCE_KEY, JSON.stringify({ 
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              lastLoginAt: new Date().toISOString()
            }));

            // Mark onboarding as complete since they have a profile
            await AsyncStorage.setItem(`${ONBOARDING_COMPLETE_KEY}_${currentUser.uid}`, 'true');

            // Update last login in Firestore
            await setDoc(userRef, {
              lastLoginAt: serverTimestamp()
            }, { merge: true });

            // Set as authenticated user
            setUser(currentUser);
            setIsAuthenticated(true);
          } else {
            console.log('No existing profile, checking onboarding status');
            // No profile in Firestore, check if they're mid-onboarding
            const onboardingComplete = await AsyncStorage.getItem(`${ONBOARDING_COMPLETE_KEY}_${currentUser.uid}`);
            
            if (onboardingComplete === 'true') {
              // They completed onboarding but profile not in Firestore (rare case)
              // Set as authenticated but they'll need to redo onboarding
              setUser(currentUser);
              setIsAuthenticated(false);
              // Clear onboarding status since profile is missing
              await AsyncStorage.removeItem(`${ONBOARDING_COMPLETE_KEY}_${currentUser.uid}`);
            } else {
              // New user or incomplete onboarding
              setUser(currentUser);
              setIsAuthenticated(false);
            }
          }
        } catch (error) {
          console.error('Error during auth state change:', error);
          // On error, set user but not authenticated to ensure safe state
          setUser(currentUser);
          setIsAuthenticated(false);
        }
      } else {
        // Handle logout/no user case
        try {
          const savedCredentials = await AsyncStorage.getItem(AUTH_CREDENTIALS_KEY);
          const persistedAuth = await AsyncStorage.getItem(AUTH_PERSISTENCE_KEY);
          
          if (savedCredentials && persistedAuth) {
            const { email, password } = JSON.parse(savedCredentials);
            await signInWithEmailAndPassword(auth, email, password);
            return; // Auth state change will trigger again
          }
          
          setUser(null);
          setIsAuthenticated(false);
        } catch (error) {
          console.error('Auto-login failed:', error);
          await AsyncStorage.multiRemove([AUTH_PERSISTENCE_KEY, AUTH_CREDENTIALS_KEY]);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Update loading state based on initialization
  useEffect(() => {
    if (authInitialized) {
      setLoading(false);
    }
  }, [authInitialized]);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Save credentials for auto-login
      await AsyncStorage.setItem(AUTH_CREDENTIALS_KEY, JSON.stringify({ email, password }));
      console.log('Login successful:', userCredential.user.email);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: name });
      
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Create initial user document in Firestore
      await setDoc(doc(firestore, 'users', user.uid), userProfile);
      
      // Explicitly set onboarding as incomplete for new users
      await AsyncStorage.setItem(`${ONBOARDING_COMPLETE_KEY}_${user.uid}`, 'false');
      
      // Save credentials for auto-login
      await AsyncStorage.setItem(AUTH_CREDENTIALS_KEY, JSON.stringify({ email, password }));
      
      // Set authenticated state to false to force onboarding
      setIsAuthenticated(false);
      
      console.log('Registration successful:', user.email);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear all auth data before signing out to prevent auto-login
      await AsyncStorage.multiRemove([AUTH_PERSISTENCE_KEY, AUTH_CREDENTIALS_KEY]);
      await signOut(auth);
      setUser(null);
      setIsAuthenticated(false);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
    if (!user) throw new Error('No authenticated user');
    try {
      await updateProfile(user, data);
      
      const userRef = doc(firestore, 'users', user.uid);
      await setDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true });
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent');
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUserProfile,
    resetPassword,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
