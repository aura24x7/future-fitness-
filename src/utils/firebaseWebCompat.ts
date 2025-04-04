/**
 * Firebase Web API Compatibility Layer
 * 
 * This module provides compatibility between the React Native Firebase API
 * and the web Firebase API.
 */

import { firestore } from '../config/firebaseWebConfig';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';

class FirestoreWebCompat {
  // Reference to the firestore instance
  _firestore: any;

  constructor() {
    this._firestore = firestore;
    
    // Create a native object with methods that match the native API
    this._firestore.native = {
      // Collection operations
      collectionOnSnapshot: (collectionPath: string, callback: Function) => {
        console.log(`[FirebaseWebCompat] collectionOnSnapshot: ${collectionPath}`);
        const collectionRef = collection(this._firestore, collectionPath);
        
        return onSnapshot(
          collectionRef,
          (snapshot) => {
            callback({ 
              docs: snapshot.docs.map(doc => ({
                id: doc.id,
                data: () => doc.data(),
                exists: true
              }))
            });
          },
          (error) => console.error(`[FirebaseWebCompat] Error in collectionOnSnapshot: ${error}`)
        );
      },
      
      // Document operations
      documentGet: async (collectionPath: string, docId: string) => {
        console.log(`[FirebaseWebCompat] documentGet: ${collectionPath}/${docId}`);
        const docRef = doc(this._firestore, collectionPath, docId);
        const docSnap = await getDoc(docRef);
        
        return {
          exists: docSnap.exists(),
          data: () => docSnap.data(),
          id: docSnap.id
        };
      },
      
      documentSet: async (collectionPath: string, docId: string, data: any, options?: any) => {
        console.log(`[FirebaseWebCompat] documentSet: ${collectionPath}/${docId}`);
        const docRef = doc(this._firestore, collectionPath, docId);
        return await setDoc(docRef, data, options);
      },
      
      documentOnSnapshot: (collectionPath: string, docId: string, callback: Function) => {
        console.log(`[FirebaseWebCompat] documentOnSnapshot: ${collectionPath}/${docId}`);
        const docRef = doc(this._firestore, collectionPath, docId);
        
        return onSnapshot(
          docRef,
          (docSnap) => {
            callback({
              exists: docSnap.exists(),
              data: () => docSnap.data(),
              id: docSnap.id
            });
          },
          (error) => console.error(`[FirebaseWebCompat] Error in documentOnSnapshot: ${error}`)
        );
      },
      
      documentUpdate: async (collectionPath: string, docId: string, data: any) => {
        console.log(`[FirebaseWebCompat] documentUpdate: ${collectionPath}/${docId}`);
        const docRef = doc(this._firestore, collectionPath, docId);
        return await updateDoc(docRef, data);
      },
      
      documentDelete: async (collectionPath: string, docId: string) => {
        console.log(`[FirebaseWebCompat] documentDelete: ${collectionPath}/${docId}`);
        const docRef = doc(this._firestore, collectionPath, docId);
        return await deleteDoc(docRef);
      }
    };
  }
  
  // Return the enhanced Firestore instance
  getInstance() {
    return this._firestore;
  }
}

// Helper to convert between Firebase timestamp formats
export const timestampHelpers = {
  fromFirestoreTimestamp: (timestamp: any) => {
    if (!timestamp) return null;
    
    // Handle different types of timestamps
    if (timestamp instanceof Timestamp) {
      return timestamp;
    } else if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp;
    } else if (typeof timestamp === 'string') {
      return new Date(timestamp);
    }
    
    return null;
  },
  
  toFirestoreTimestamp: () => {
    return serverTimestamp();
  },
  
  now: () => {
    return Timestamp.now();
  }
};

// Export a singleton instance
const firestoreCompat = new FirestoreWebCompat();
export default firestoreCompat.getInstance(); 