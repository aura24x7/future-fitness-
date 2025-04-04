/**
 * Firebase Compatibility Layer
 * 
 * This file provides a compatibility layer between the old React Native Firebase
 * and the new Web Firebase SDK. This allows for a gradual migration without
 * breaking existing code.
 */

// Import from our synchronized Firebase initialization
import { 
  firebaseApp, 
  auth as syncAuth, 
  firestore as syncFirestore, 
  storage as syncStorage 
} from '../firebase/firebaseInit';

import {
  collection, 
  doc as firestoreDoc, 
  getDoc as firestoreGetDoc, 
  getDocs, 
  setDoc as firestoreSetDoc, 
  updateDoc as firestoreUpdateDoc, 
  deleteDoc as firestoreDeleteDoc, 
  query, 
  where, 
  onSnapshot,
  Timestamp,
  DocumentSnapshot,
  serverTimestamp,
  Firestore,
  User
} from 'firebase/firestore';
import { Auth } from 'firebase/auth';

// Export a singleton instance that mimics the @react-native-firebase/firestore
let firestoreInstance: any = null;
let authInstance: any = null;

// Initialize instances synchronously to avoid timing issues
const initializeInstances = () => {
  try {
    // Use the pre-initialized Firebase services from firebaseInit.js
    firestoreInstance = {
      // Collection methods
      collection: (path: string) => {
        const collectionRef = collection(syncFirestore, path);
        return {
          doc: (docId: string) => {
            const docRef = firestoreDoc(syncFirestore, path, docId);
            return {
              set: (data: any) => firestoreSetDoc(docRef, data),
              update: (data: any) => firestoreUpdateDoc(docRef, data),
              delete: () => firestoreDeleteDoc(docRef),
              get: async () => {
                const docSnap = await firestoreGetDoc(docRef);
                return {
                  exists: docSnap.exists(),
                  data: () => docSnap.data(),
                  id: docSnap.id
                };
              },
              onSnapshot: (callback: Function) => {
                return onSnapshot(docRef, (docSnap) => {
                  callback({
                    exists: docSnap.exists(),
                    data: () => docSnap.data(),
                    id: docSnap.id
                  });
                });
              }
            };
          },
          where: (field: string, op: string, value: any) => {
            const q = query(collectionRef, where(field, op, value));
            return {
              get: async () => {
                const querySnapshot = await getDocs(q);
                return {
                  docs: querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    data: () => doc.data(),
                    exists: true
                  }))
                };
              },
              onSnapshot: (callback: Function) => {
                return onSnapshot(q, (querySnapshot) => {
                  callback({
                    docs: querySnapshot.docs.map(doc => ({
                      id: doc.id,
                      data: () => doc.data(),
                      exists: true
                    }))
                  });
                });
              }
            };
          },
          get: async () => {
            const querySnapshot = await getDocs(collectionRef);
            return {
              docs: querySnapshot.docs.map(doc => ({
                id: doc.id,
                data: () => doc.data(),
                exists: true
              }))
            };
          },
          onSnapshot: (callback: Function) => {
            return onSnapshot(collectionRef, (querySnapshot) => {
              callback({
                docs: querySnapshot.docs.map(doc => ({
                  id: doc.id,
                  data: () => doc.data(),
                  exists: true
                }))
              });
            });
          }
        };
      },
      // Timestamp methods
      Timestamp: {
        now: () => Timestamp.now(),
        fromDate: (date: Date) => Timestamp.fromDate(date)
      }
    };
    
    // Create compatibility layer for auth
    authInstance = {
      currentUser: syncAuth.currentUser,
      onAuthStateChanged: (callback: (user: User | null) => void) => {
        return syncAuth.onAuthStateChanged(callback);
      }
    };
    
    return { firestoreInstance, authInstance };
  } catch (error) {
    console.error('[FirebaseCompat] Error initializing compatibility layer:', error);
    throw error;
  }
};

// Initialize synchronously
try {
  initializeInstances();
  console.log('[FirebaseCompat] Compatibility layer initialized successfully');
} catch (error) {
  console.error('[FirebaseCompat] Error initializing compatibility layer:', error);
}

// Export functions that mimic direct imports
export const firestore = () => firestoreInstance;
export const auth = () => authInstance;

// Export utility functions that use our initialized instances
export const getFirestore = () => syncFirestore;
export const getAuth = () => syncAuth;
export const timestamp = () => Timestamp.now();

// Helper functions for direct document operations
export const getDoc = async (collectionName: string, docId: string) => {
  const docRef = firestoreDoc(syncFirestore, collectionName, docId);
  const docSnap = await firestoreGetDoc(docRef);
  return {
    exists: docSnap.exists(),
    data: () => docSnap.data(),
    id: docSnap.id
  };
};

export const setDoc = async (collectionName: string, docId: string, data: any) => {
  const docRef = firestoreDoc(syncFirestore, collectionName, docId);
  return firestoreSetDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now()
  });
};

export const updateDoc = async (collectionName: string, docId: string, data: any) => {
  const docRef = firestoreDoc(syncFirestore, collectionName, docId);
  return firestoreUpdateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now()
  });
};

export const deleteDoc = async (collectionName: string, docId: string) => {
  const docRef = firestoreDoc(syncFirestore, collectionName, docId);
  return firestoreDeleteDoc(docRef);
};

// Testing function to verify Firebase is working correctly
export const testFirebaseConnection = async () => {
  try {
    // Test auth
    console.log('[FirebaseCompat] Auth initialized:', !!syncAuth);
    
    // Test firestore
    console.log('[FirebaseCompat] Firestore initialized:', !!syncFirestore);
    
    // Test document operations
    const testDocRef = firestoreDoc(syncFirestore, '_test_', 'test_doc');
    await setDoc('_test_', 'test_doc', {
      timestamp: timestamp(),
      testValue: 'Test document'
    });
    
    const docSnap = await getDoc('_test_', 'test_doc');
    console.log('[FirebaseCompat] Test document exists:', docSnap.exists);
    
    await deleteDoc('_test_', 'test_doc');
    console.log('[FirebaseCompat] Test successful');
    
    return { success: true };
  } catch (error) {
    console.error('[FirebaseCompat] Test failed:', error);
    return { success: false, error };
  }
}; 