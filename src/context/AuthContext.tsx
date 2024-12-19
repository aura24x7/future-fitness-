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
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { migrationService } from '../services/migration.service';

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
          // Update persistence
          await AsyncStorage.setItem(AUTH_PERSISTENCE_KEY, JSON.stringify({ 
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            lastLoginAt: new Date().toISOString()
          }));

          // Update Firestore
          const userRef = doc(firestore, 'users', currentUser.uid);
          await setDoc(userRef, {
            lastLoginAt: serverTimestamp()
          }, { merge: true });

          setUser(currentUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error during auth state change:', error);
        }
      } else {
        // Try auto-login if we have credentials
        try {
          const savedCredentials = await AsyncStorage.getItem(AUTH_CREDENTIALS_KEY);
          if (savedCredentials) {
            const { email, password } = JSON.parse(savedCredentials);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Auto-login successful:', userCredential.user.email);
            return;
          }
        } catch (error) {
          console.error('Auto-login failed:', error);
          // Clear persistence on failed auto-login
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

      await setDoc(doc(firestore, 'users', user.uid), userProfile);
      // Save credentials for auto-login
      await AsyncStorage.setItem(AUTH_CREDENTIALS_KEY, JSON.stringify({ email, password }));
      console.log('Registration successful:', user.email);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Clear all auth data
      await AsyncStorage.multiRemove([AUTH_PERSISTENCE_KEY, AUTH_CREDENTIALS_KEY]);
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
