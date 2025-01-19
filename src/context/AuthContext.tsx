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
import { ONBOARDING_COMPLETE_KEY, ONBOARDING_STORAGE_KEY } from './OnboardingContext';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
  completeOnboarding: () => Promise<void>;
}

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  onboardingComplete: boolean;
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
            const userData = userDoc.data();
            console.log('User profile found, checking onboarding status');
            
            // Check if user has completed onboarding
            const onboardingComplete = userData.onboardingComplete === true;
            
            // Update persistence
            await AsyncStorage.setItem(AUTH_PERSISTENCE_KEY, JSON.stringify({ 
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              lastLoginAt: new Date().toISOString()
            }));

            if (onboardingComplete) {
              console.log('User has completed onboarding');
              await AsyncStorage.setItem(`${ONBOARDING_COMPLETE_KEY}_${currentUser.uid}`, 'true');
              setUser(currentUser);
              setIsAuthenticated(true);
            } else {
              console.log('User needs to complete onboarding');
              await AsyncStorage.setItem(`${ONBOARDING_COMPLETE_KEY}_${currentUser.uid}`, 'false');
              setUser(currentUser);
              setIsAuthenticated(false);
            }

            // Update last login in Firestore
            await setDoc(userRef, {
              lastLoginAt: serverTimestamp()
            }, { merge: true });
          } else {
            console.log('No existing profile, new user registration flow');
            // Clear any existing onboarding data for this user
            await AsyncStorage.removeItem(`${ONBOARDING_COMPLETE_KEY}_${currentUser.uid}`);
            await AsyncStorage.removeItem(`${ONBOARDING_STORAGE_KEY}_${currentUser.uid}`);
            
            // Set user but not authenticated to trigger onboarding
            setUser(currentUser);
            setIsAuthenticated(false);
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
      
      // Check if user has completed onboarding
      const userRef = doc(firestore, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.error('No user profile found during login');
        throw new Error('User profile not found');
      }
      
      const userData = userDoc.data();
      const hasRequiredData = userData.fitnessGoal && 
                            userData.gender && 
                            userData.height && 
                            userData.weight && 
                            userData.birthday;
      
      // Only save credentials if onboarding is complete and has required data
      if (userData.onboardingComplete === true && hasRequiredData) {
        await AsyncStorage.setItem(AUTH_CREDENTIALS_KEY, JSON.stringify({ email, password }));
        console.log('Login successful with complete profile:', userCredential.user.email);
      } else {
        console.log('Login successful but onboarding incomplete:', userCredential.user.email);
      }
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
        updatedAt: new Date().toISOString(),
        onboardingComplete: false
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

  const completeOnboarding = async () => {
    if (!user) throw new Error('No authenticated user');
    try {
      const userRef = doc(firestore, 'users', user.uid);
      
      // Mark onboarding as complete and update timestamp
      await setDoc(userRef, {
        onboardingComplete: true,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      // Update local storage and state
      await AsyncStorage.setItem(`${ONBOARDING_COMPLETE_KEY}_${user.uid}`, 'true');
      setIsAuthenticated(true);
      console.log('Onboarding marked as complete');
    } catch (error) {
      console.error('Error completing onboarding:', error);
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
    isAuthenticated,
    completeOnboarding
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
