import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as firebaseUtils from '../services/firebase/firebaseUtils';
import { ONBOARDING_COMPLETE_KEY, AUTH_PERSISTENCE_KEY } from '../constants/storage';
import { workoutPlanService } from '../services/workoutPlanService';

// Import from our synchronized Firebase initialization
import { 
  initializeFirebase, 
  getFirebaseApp, 
  getFirebaseAuth, 
  getFirebaseFirestore 
} from '../services/firebase/firebaseInit';

// We'll set these up after Firebase initialization
let auth: any;
let firestore: any;

// Initialize Firebase first, then get the auth and firestore instances
const initializeAuthDependencies = async () => {
  try {
    await initializeFirebase();
    auth = getFirebaseAuth();
    firestore = getFirebaseFirestore();
    console.log('[AuthContext] Firebase dependencies initialized');
    return true;
  } catch (error) {
    console.error('[AuthContext] Failed to initialize Firebase dependencies:', error);
    // Fall back to web Firebase in config
    try {
      const { auth: webAuth, firestore: webFirestore } = require('../config/firebaseWebConfig');
      auth = webAuth;
      firestore = webFirestore;
      console.log('[AuthContext] Using web Firebase fallback');
      return true;
    } catch (webError) {
      console.error('[AuthContext] Web Firebase fallback failed:', webError);
      return false;
    }
  }
};

// Import type definitions from Firebase
import type { User, Auth } from 'firebase/auth';
// Add React Native Firebase types
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

// Import the compatibility layer
import * as FirebaseCompat from '../utils/firebaseCompatibility';

// Import the custom storage helper
import { saveUserToStorage, getStoredUser } from '../utils/firebase-storage-helper';

// Import navigation utils
import { NAV_ONBOARDING_KEY, lockNavigation, unlockNavigation } from '../utils/navigationUtils';

// Define types to manage different User objects from different Firebase SDKs
type RNFirebaseUser = FirebaseAuthTypes.User;
type WebFirebaseUser = User;
type AnyFirebaseUser = WebFirebaseUser | RNFirebaseUser;

// Update the interface to use the web Firebase User type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (name: string, photoURL?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
  completeOnboarding: () => Promise<void>;
  isAuthReady: boolean;
  checkOnboardingStatus: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

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
  const unsubscribeRef = useRef<(() => void) | undefined>(undefined);

  // Function to check onboarding status from Firestore
  const checkOnboardingStatus = async () => {
    if (!user) {
      console.log('[AuthContext] No user, cannot check onboarding status');
      return;
    }

    try {
      console.log('[AuthContext] Checking onboarding status for user:', user.uid);
      
      // Try using Firebase compatibility layer first
      try {
        const docSnap = await FirebaseCompat.getDoc('users', user.uid);
        if (docSnap.exists) {
          const userData = docSnap.data();
          const isComplete = userData?.onboardingComplete === true;
          console.log('[AuthContext] Onboarding status from compat layer:', isComplete);
          setIsAuthenticated(isComplete);
          
          // Cache the result
          if (isComplete) {
            await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
          }
          return;
        }
      } catch (compatError) {
        console.error('[AuthContext] Error checking onboarding with compat layer:', compatError);
      }
      
      // Try direct Firestore access
      try {
        // Make sure firestore is initialized
        if (!firestore) {
          await initializeAuthDependencies();
        }
        
        if (firestore) {
          let userDoc;
          let docSnap;
          
          // Check which firestore API we're using
          if (typeof firestore.collection === 'function') {
            // React Native Firebase
            userDoc = await firestore.collection('users').doc(user.uid).get();
            docSnap = userDoc;
          } else {
            // Web Firebase
            const { doc, getDoc } = require('firebase/firestore');
            userDoc = doc(firestore, 'users', user.uid);
            docSnap = await getDoc(userDoc);
          }
          
          const exists = typeof docSnap.exists === 'function' ? docSnap.exists() : docSnap.exists;
          
          if (exists) {
            const userData = typeof docSnap.data === 'function' ? docSnap.data() : docSnap.data;
            const isComplete = userData?.onboardingComplete === true;
            console.log('[AuthContext] Onboarding status from Firestore:', isComplete);
            setIsAuthenticated(isComplete);
            
            // Cache the result
            if (isComplete) {
              await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
            }
          } else {
            console.log('[AuthContext] No user document found, user needs onboarding');
            setIsAuthenticated(false);
          }
        }
      } catch (firestoreError) {
        console.error('[AuthContext] Error checking onboarding with Firestore:', firestoreError);
      }
      
      // Check AsyncStorage as a last resort
      try {
        const storedValue = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
        if (storedValue === 'true') {
          console.log('[AuthContext] Onboarding complete according to AsyncStorage');
          setIsAuthenticated(true);
        }
      } catch (storageError) {
        console.error('[AuthContext] Error checking onboarding in AsyncStorage:', storageError);
      }
    } catch (error) {
      console.error('[AuthContext] Error checking onboarding status:', error);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      try {
        console.log('[AuthContext] Starting auth initialization...');
        
        // Initialize Firebase dependencies first
        const initialized = await initializeAuthDependencies();
        if (!initialized && mounted) {
          console.error('[AuthContext] Firebase dependencies failed to initialize');
          setLoading(false);
          setAuthInitialized(true); // Set to true to allow retry
          return;
        }
        
        // Check for persisted auth state using our custom helper
        const storedUser = await getStoredUser();
        if (storedUser) {
          console.log('[AuthContext] Found persisted auth state');
        }
        
        // Set up auth state listener using Firebase auth
        const unsubscribe = auth.onAuthStateChanged(async (authUser: any) => {
          if (mounted) {
            setUser(authUser);
            
            if (authUser) {
              // Check if onboarding is complete
              try {
                // Check AsyncStorage first (fastest)
                const storedValue = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
                if (storedValue === 'true') {
                  console.log('[AuthContext] Onboarding complete according to AsyncStorage');
                  setIsAuthenticated(true);
                } else {
                  // If not in AsyncStorage, check Firestore
                  await checkOnboardingStatus();
                }
              } catch (error) {
                console.error('[AuthContext] Error checking onboarding status:', error);
              }
            } else {
              setIsAuthenticated(false);
            }
            
            setLoading(false);
            
            // Persist auth state when it changes using our custom helper
            saveUserToStorage(authUser);
          }
        });
        
        unsubscribeRef.current = unsubscribe;
        if (mounted) {
          setAuthInitialized(true);
        }
      } catch (error) {
        console.error('[AuthContext] Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
          setAuthInitialized(true); // Set to true even if there's an error to allow retry
        }
      }
    };
    
    initAuth();
    
    return () => {
      mounted = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // When the user changes, check onboarding status
  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
      
      // Initialize workout service and sync workout plans when user logs in
      try {
        console.log('[AuthContext] User authenticated, initializing workout plan service');
        // This will trigger plan sync from local storage to Firebase if needed
        workoutPlanService.syncLocalPlansToFirebase().catch(error => {
          console.error('[AuthContext] Error syncing workout plans:', error);
        });
      } catch (error) {
        console.error('[AuthContext] Error initializing workout plan service:', error);
      }
    }
  }, [user]);

  // Implement auth methods
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Ensure Firebase auth is initialized
      if (!auth) {
        await initializeAuthDependencies();
      }
      
      // Use the signInWithEmailAndPassword method from the right auth object
      if (auth.signInWithEmailAndPassword) {
        await auth.signInWithEmailAndPassword(email, password);
      } else {
        // Web Firebase style
        const { signInWithEmailAndPassword } = require('firebase/auth');
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      // Ensure Firebase auth is initialized
      if (!auth) {
        await initializeAuthDependencies();
      }
      
      let userCredential;
      if (typeof auth.createUserWithEmailAndPassword === 'function') {
        // React Native Firebase
        userCredential = await auth.createUserWithEmailAndPassword(email, password);
      } else {
        // Web Firebase
        const { createUserWithEmailAndPassword } = require('firebase/auth');
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }
      
      // Update profile with display name
      if (userCredential.user) {
        if (typeof userCredential.user.updateProfile === 'function') {
          // React Native Firebase
          await userCredential.user.updateProfile({
            displayName: name
          });
        } else {
          // Web Firebase
          const { updateProfile } = require('firebase/auth');
          await updateProfile(userCredential.user, {
            displayName: name
          });
        }
      }
    } catch (error) {
      console.error('[AuthContext] Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      console.log('[AuthContext] Starting logout process');
      
      // Reset authenticated state immediately
      setIsAuthenticated(false);
      
      // Clear AsyncStorage first
      await AsyncStorage.removeItem(AUTH_PERSISTENCE_KEY);
      await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
      
      // Then sign out from Firebase
      if (!auth) {
        // Make sure auth is initialized
        await initializeAuthDependencies();
      }

      if (auth) {
        // Check which type of auth object we have and use the appropriate signOut method
        if (typeof auth.signOut === 'function') {
          // React Native Firebase
          await auth.signOut();
        } else {
          // Web Firebase
          const { signOut } = require('firebase/auth');
          await signOut(auth);
        }
        console.log('[AuthContext] Firebase sign out completed');
      }
      
      console.log('[AuthContext] Logout completed successfully');
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (name: string, photoURL?: string) => {
    setLoading(true);
    
    try {
      if (!user) {
        throw new Error('User must be authenticated to update profile');
      }
      
      console.log('[AuthContext] Updating user profile: name:', name, 'photoURL:', photoURL);
      
      // Update both async storage and firebase
      let profileData: any = {
        displayName: name,
      };
      
      if (photoURL) {
        profileData.photoURL = photoURL;
      }
      
      // Try updating Firebase Auth user profile
      try {
        // Determine which Firebase SDK we're using by checking the user object properties/methods
        // Use type casting to handle both Firebase SDK types
        const firebaseUser = user as any;
        if (typeof firebaseUser.updateProfile === 'function') {
          // React Native Firebase
          await firebaseUser.updateProfile(profileData);
        } else {
          // Web Firebase SDK
          const { updateProfile } = require('firebase/auth');
          await updateProfile(user, profileData);
        }
        
        console.log('[AuthContext] Updated user profile in Firebase Auth');
      } catch (authError) {
        console.error('[AuthContext] Error updating profile in Firebase Auth:', authError);
      }
      
      // Also update Firestore user document if available
      try {
        if (firestore) {
          if (typeof firestore.collection === 'function') {
            // React Native Firebase
            await firestore.collection('users').doc(user.uid).update({
              displayName: name,
              ...(photoURL ? { photoURL } : {}),
              updatedAt: new Date()
            });
          } else {
            // Web Firebase
            const { doc, updateDoc } = require('firebase/firestore');
            const userDocRef = doc(firestore, 'users', user.uid);
            await updateDoc(userDocRef, {
              displayName: name,
              ...(photoURL ? { photoURL } : {}),
              updatedAt: new Date()
            });
          }
          console.log('[AuthContext] Updated user profile in Firestore');
        }
      } catch (firestoreError) {
        console.error('[AuthContext] Error updating profile in Firestore:', firestoreError);
      }
      
      // Update local state
      setUser({
        ...user,
        displayName: name,
        ...(photoURL ? { photoURL } : {})
      });
      
      console.log('[AuthContext] User profile updated successfully');
    } catch (error) {
      console.error('[AuthContext] Error in updateUserProfile:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Ensure Firebase auth is initialized
      if (!auth) {
        await initializeAuthDependencies();
      }
      
      if (typeof auth.sendPasswordResetEmail === 'function') {
        // React Native Firebase
        await auth.sendPasswordResetEmail(email);
      } else {
        // Web Firebase
        const { sendPasswordResetEmail } = require('firebase/auth');
        await sendPasswordResetEmail(auth, email);
      }
    } catch (error) {
      console.error('[AuthContext] Password reset error:', error);
      throw error;
    }
  };

  const completeOnboarding = async () => {
    if (!user) {
      throw new Error('User must be authenticated to complete onboarding');
    }
    
    // Lock navigation during onboarding completion
    await lockNavigation(NAV_ONBOARDING_KEY, 'Auth context completing onboarding');

    try {
      console.log('[AuthContext] Marking onboarding as complete');
      
      // Save to AsyncStorage first as most reliable
      try {
        await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
        console.log('[AuthContext] Saved onboarding complete flag to AsyncStorage');
      } catch (storageError) {
        console.error('[AuthContext] Error saving to AsyncStorage:', storageError);
      }
      
      // Update local state immediately to help with navigation
      setIsAuthenticated(true);
      console.log('[AuthContext] Local authenticated state updated');
      
      // Try updating Firestore using all available methods
      let firebaseSuccess = false;
      
      // Try compatibility layer first as it's most reliable
      try {
        await FirebaseCompat.updateDoc('users', user.uid, {
          onboardingComplete: true,
          updatedAt: new Date()
        });
        console.log('[AuthContext] Updated onboarding status with compatibility layer');
        firebaseSuccess = true;
      } catch (compatError) {
        console.error('[AuthContext] Compatibility layer update failed:', compatError);
      }
      
      // Try Firebase direct if compatibility layer fails
      if (!firebaseSuccess) {
        try {
          // Make sure firestore is initialized
          if (!firestore) {
            await initializeAuthDependencies();
          }
          
          if (firestore) {
            if (typeof firestore.collection === 'function') {
              // React Native Firebase
              await firestore.collection('users').doc(user.uid).update({
                onboardingComplete: true,
                updatedAt: new Date()
              });
            } else {
              // Web Firebase
              const { doc, updateDoc } = require('firebase/firestore');
              const userDocRef = doc(firestore, 'users', user.uid);
              await updateDoc(userDocRef, {
                onboardingComplete: true,
                updatedAt: new Date()
              });
            }
            console.log('[AuthContext] Updated onboarding status with Firebase direct');
            firebaseSuccess = true;
          }
        } catch (directError) {
          console.error('[AuthContext] Firebase direct update failed:', directError);
        }
      }
      
      console.log('[AuthContext] Onboarding completion process finished, success:', firebaseSuccess);
    } catch (error) {
      console.error('[AuthContext] Error in completeOnboarding:', error);
      
      // Set authenticated anyway if we at least saved to AsyncStorage
      try {
        const storedValue = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
        if (storedValue === 'true') {
          setIsAuthenticated(true);
          console.log('[AuthContext] Setting authenticated state based on AsyncStorage');
        } else {
          throw error;
        }
      } catch (asyncError) {
        console.error('[AuthContext] Error checking AsyncStorage in error handler:', asyncError);
        throw error;
      }
    } finally {
      // Always unlock navigation
      await unlockNavigation(NAV_ONBOARDING_KEY);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUserProfile,
        resetPassword,
        isAuthenticated,
        completeOnboarding,
        isAuthReady: authInitialized && !loading,
        checkOnboardingStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
