import { initializeApp, getApp } from '@react-native-firebase/app';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { firebaseConfig } from '../../config/firebaseConfig';

// Firebase app initialization
export const initializeFirebaseApp = () => {
  try {
    return initializeApp(firebaseConfig);
  } catch (error: any) {
    if (error?.code === 'app/duplicate-app') {
      return getApp();
    }
    console.error('Error initializing Firebase:', error);
    throw error;
  }
};

// Get Firestore instance - ensure we're using Namespace API consistently
export const getFirestoreInstance = () => {
  return firestore();
};

// Get Auth instance - ensure we're using Namespace API consistently
export const getAuthInstance = () => {
  return auth();
};

// Document references
export const getDocRef = (collectionName: string, docId: string) => {
  return firestore().collection(collectionName).doc(docId);
};

// Collection references
export const getCollectionRef = (collectionName: string) => {
  return firestore().collection(collectionName);
};

// Document operations
export const getDocument = async <T extends FirebaseFirestoreTypes.DocumentData>(
  collectionName: string, 
  docId: string
): Promise<(T & { id: string }) | null> => {
  try {
    const docRef = getDocRef(collectionName, docId);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) return null;
    
    return {
      id: docSnap.id,
      ...docSnap.data() as T
    };
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
};

export const setDocument = async <T extends FirebaseFirestoreTypes.DocumentData>(
  collectionName: string,
  docId: string,
  data: T,
  options?: { merge?: boolean }
) => {
  try {
    const docRef = getDocRef(collectionName, docId);
    await docRef.set({
      ...data,
      updatedAt: firestore.FieldValue.serverTimestamp()
    }, options);
  } catch (error) {
    console.error(`Error setting document in ${collectionName}:`, error);
    throw error;
  }
};

export const updateDocument = async <T extends Partial<FirebaseFirestoreTypes.DocumentData>>(
  collectionName: string,
  docId: string,
  data: T
) => {
  try {
    const docRef = getDocRef(collectionName, docId);
    await docRef.update({
      ...data,
      updatedAt: firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
};

// Collection listeners
export const onCollectionSnapshot = <T extends FirebaseFirestoreTypes.DocumentData>(
  collectionName: string,
  callback: (data: (T & { id: string })[]) => void
) => {
  try {
    const collectionRef = getCollectionRef(collectionName);
    
    return collectionRef.onSnapshot((snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as T
      }));
      callback(data);
    }, (error) => {
      console.error(`Error in collection snapshot for ${collectionName}:`, error);
    });
  } catch (error) {
    console.error(`Error setting up collection snapshot for ${collectionName}:`, error);
    throw error;
  }
};

export const onDocumentSnapshot = <T extends FirebaseFirestoreTypes.DocumentData>(
  collectionName: string,
  docId: string,
  callback: (data: (T & { id: string }) | null) => void
) => {
  try {
    const docRef = getDocRef(collectionName, docId);
    
    return docRef.onSnapshot((doc) => {
      if (!doc.exists) {
        callback(null);
        return;
      }
      callback({
        id: doc.id,
        ...doc.data() as T
      });
    }, (error) => {
      console.error(`Error in document snapshot for ${collectionName}/${docId}:`, error);
    });
  } catch (error) {
    console.error(`Error setting up document snapshot for ${collectionName}/${docId}:`, error);
    throw error;
  }
};

// User profile operations
export const getUserProfile = async (userId: string) => 
  getDocument('users', userId);

export const createUserProfile = async (userId: string, profileData: any) => 
  setDocument('users', userId, {
    ...profileData,
    createdAt: firestore.Timestamp.now(),
    updatedAt: firestore.Timestamp.now()
  });

export const updateUserProfile = async (userId: string, profileData: any) => 
  updateDocument('users', userId, profileData);

// Onboarding state operations
export const getOnboardingState = async (userId: string) => 
  getDocument('onboarding', userId);

export const saveOnboardingState = async (userId: string, state: any) => 
  setDocument('onboarding', userId, {
    ...state,
    updatedAt: firestore.Timestamp.now()
  });

// Auth state management
export const onAuthStateChanged = (callback: (user: FirebaseAuthTypes.User | null) => void) => 
  auth().onAuthStateChanged(callback);

// Auth operations
export const loginWithEmailAndPassword = async (email: string, password: string) => {
  return auth().signInWithEmailAndPassword(email, password);
};

export const registerWithEmailAndPassword = async (email: string, password: string) => {
  return auth().createUserWithEmailAndPassword(email, password);
};

export const logoutUser = async () => {
  return auth().signOut();
};

export const updateUserProfileAuth = async (user: FirebaseAuthTypes.User, data: { displayName?: string; photoURL?: string }) => {
  return user.updateProfile(data);
};

export const sendPasswordReset = async (email: string) => {
  return auth().sendPasswordResetEmail(email);
}; 