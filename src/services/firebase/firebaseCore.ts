import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { initializeFirebase } from './firebaseInit';
// Remove unused imports
// import { initializeApp, getApp } from '@react-native-firebase/app';
// import auth from '@react-native-firebase/auth';

// Use the synchronized initialization from firebaseInit.js
import { 
  firebaseApp, 
  auth as syncAuth, 
  firestore as syncFirestore 
} from '../../firebase/firebaseInit';

import {
  User,
  Auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';

import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  Timestamp,
  DocumentReference,
  DocumentSnapshot,
  DocumentData
} from 'firebase/firestore';

// Define type for web User to match FirebaseAuthTypes.User
type WebUser = User;

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
  onboardingComplete: boolean;
}

class FirebaseCore {
  private static instance: FirebaseCore;
  private initialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;
  private readonly usersCollection = 'users';
  private _auth: Auth | null = null;
  private _firestore: Firestore | null = null;
  private _authStateListeners: Set<(user: WebUser | null) => void> = new Set();
  private _unsubscribers: Map<string, () => void> = new Map();

  private constructor() {}

  static getInstance(): FirebaseCore {
    if (!FirebaseCore.instance) {
      FirebaseCore.instance = new FirebaseCore();
    }
    return FirebaseCore.instance;
  }

  private async initializeServices(): Promise<void> {
    try {
      // Use the pre-initialized Firebase services from firebaseInit.js
      this._auth = syncAuth;
      if (!this._auth) {
        throw new Error('Auth module failed to initialize');
      }
      
      this._firestore = syncFirestore;
      if (!this._firestore) {
        throw new Error('Firestore module failed to initialize');
      }
      console.log('[FirebaseCore] Auth and Firestore initialized successfully');
      
      // Set up auth state listener
      onAuthStateChanged(this._auth, (user: WebUser | null) => {
        this._authStateListeners.forEach(listener => {
          try {
            listener(user);
          } catch (error) {
            console.error('[FirebaseCore] Error in auth state listener:', error);
          }
        });
      });
    } catch (error) {
      console.error('[FirebaseCore] Service initialization error:', error);
      throw error;
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('[FirebaseCore] Already initialized');
      return;
    }

    if (this.initializationPromise) {
      console.log('[FirebaseCore] Initialization in progress, waiting...');
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      try {
        console.log('[FirebaseCore] Starting initialization...');
        
        // Firebase is already initialized in firebaseInit.js
        // No need to call initializeFirebase() here
        
        // Initialize services
        await this.initializeServices();
        
        this.initialized = true;
        console.log('[FirebaseCore] Initialization completed successfully');
      } catch (error) {
        console.error('[FirebaseCore] Initialization error:', error);
        this.initialized = false;
        this.initializationPromise = null;
        throw error;
      }
    })();

    return this.initializationPromise;
  }

  async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  getAuth() {
    if (!this._auth) {
      throw new Error('[FirebaseCore] Auth not initialized. Call initialize() first.');
    }
    return this._auth;
  }

  getFirestore() {
    if (!this._firestore) {
      throw new Error('[FirebaseCore] Firestore not initialized. Call initialize() first.');
    }
    return this._firestore;
  }

  async createUserProfile(user: WebUser): Promise<void> {
    await this.ensureInitialized();

    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastLoginAt: Timestamp.now(),
      onboardingComplete: false,
    };

    try {
      const userDocRef = doc(this.getFirestore(), this.usersCollection, user.uid);
      await setDoc(userDocRef, userProfile);
      console.log('[FirebaseCore] User profile created successfully');
    } catch (error) {
      console.error('[FirebaseCore] Error creating user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    await this.ensureInitialized();

    const updatedData = {
      ...updates,
      updatedAt: Timestamp.now()
    };

    try {
      const userDocRef = doc(this.getFirestore(), this.usersCollection, uid);
      await updateDoc(userDocRef, updatedData);
      console.log('[FirebaseCore] User profile updated successfully');
    } catch (error) {
      console.error('[FirebaseCore] Error updating user profile:', error);
      throw error;
    }
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    await this.ensureInitialized();

    try {
      const userDocRef = doc(this.getFirestore(), this.usersCollection, uid);
      const docSnap = await getDoc(userDocRef);
      return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
    } catch (error) {
      console.error('[FirebaseCore] Error getting user profile:', error);
      throw error;
    }
  }

  watchUserProfile(uid: string, callback: (profile: UserProfile | null) => void): () => void {
    const userDocRef = doc(this.getFirestore(), this.usersCollection, uid);
    
    // Remove any existing listener for this user
    this.unwatchUserProfile(uid);
    
    // Set up new listener
    const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as UserProfile);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('[FirebaseCore] Error watching user profile:', error);
      callback(null);
    });

    // Store the unsubscribe function
    this._unsubscribers.set(`user_${uid}`, unsubscribe);
    
    return unsubscribe;
  }

  unwatchUserProfile(uid: string): void {
    const key = `user_${uid}`;
    const unsubscribe = this._unsubscribers.get(key);
    if (unsubscribe) {
      unsubscribe();
      this._unsubscribers.delete(key);
    }
  }

  getCurrentUser(): WebUser | null {
    return this._auth?.currentUser || null;
  }

  onAuthStateChanged(callback: (user: WebUser | null) => void): () => void {
    this._authStateListeners.add(callback);
    
    // If not initialized, initialize in background
    if (!this.initialized) {
      this.initialize().catch(error => {
        console.error('[FirebaseCore] Background initialization failed:', error);
      });
    }
    
    // If already initialized and we have auth, trigger callback immediately with current user
    if (this.initialized && this._auth) {
      callback(this._auth.currentUser);
    }
    
    // Return cleanup function
    return () => {
      this._authStateListeners.delete(callback);
    };
  }
}

export const firebaseCore = FirebaseCore.getInstance();
