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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setIsAuthenticated(!!user);
      setLoading(false);

      if (user) {
        try {
          const migrationResult = await migrationService.migrateUserData(user.uid);
          if (!migrationResult.success) {
            console.error('Migration failed:', migrationResult.error);
          }
          
          await AsyncStorage.setItem(AUTH_PERSISTENCE_KEY, JSON.stringify({ uid: user.uid }));
          const userRef = doc(firestore, 'users', user.uid);
          await setDoc(userRef, {
            lastLoginAt: serverTimestamp()
          }, { merge: true });
        } catch (error) {
          console.error('Error during auth state change:', error);
        }
      } else {
        await AsyncStorage.removeItem(AUTH_PERSISTENCE_KEY);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
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
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem(AUTH_PERSISTENCE_KEY);
    } catch (error) {
      throw error;
    }
  };

  const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
    if (!user) throw new Error('No user logged in');
    await updateProfile(user, data);
    
    const userRef = doc(firestore, 'users', user.uid);
    await setDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
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
