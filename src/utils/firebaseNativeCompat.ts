/**
 * Firebase Native API Compatibility Layer
 * 
 * This module provides compatibility between the old native API pattern
 * and the current React Native Firebase API.
 */

import firestore from '@react-native-firebase/firestore';

class FirestoreNativeCompat {
  // Reference to the firestore instance
  _firestore: any;

  constructor() {
    this._firestore = firestore();
    
    // Create a native object with the missing methods
    this._firestore.native = {
      // Collection operations
      collectionOnSnapshot: (collectionPath: string, callback: Function) => {
        console.log(`[FirebaseCompat] collectionOnSnapshot: ${collectionPath}`);
        return this._firestore.collection(collectionPath).onSnapshot(
          (snapshot: any) => callback({ docs: snapshot.docs }),
          (error: any) => console.error(`[FirebaseCompat] Error in collectionOnSnapshot: ${error}`)
        );
      },
      
      // Document operations
      documentGet: async (collectionPath: string, docId: string) => {
        console.log(`[FirebaseCompat] documentGet: ${collectionPath}/${docId}`);
        const docRef = this._firestore.collection(collectionPath).doc(docId);
        const docSnap = await docRef.get();
        return {
          exists: docSnap.exists,
          data: () => docSnap.data()
        };
      },
      
      documentSet: async (collectionPath: string, docId: string, data: any, options?: any) => {
        console.log(`[FirebaseCompat] documentSet: ${collectionPath}/${docId}`);
        const docRef = this._firestore.collection(collectionPath).doc(docId);
        return await docRef.set(data, options);
      },
      
      documentOnSnapshot: (collectionPath: string, docId: string, callback: Function) => {
        console.log(`[FirebaseCompat] documentOnSnapshot: ${collectionPath}/${docId}`);
        return this._firestore.collection(collectionPath).doc(docId).onSnapshot(
          (snapshot: any) => callback(snapshot),
          (error: any) => console.error(`[FirebaseCompat] Error in documentOnSnapshot: ${error}`)
        );
      },
      
      documentUpdate: async (collectionPath: string, docId: string, data: any) => {
        console.log(`[FirebaseCompat] documentUpdate: ${collectionPath}/${docId}`);
        const docRef = this._firestore.collection(collectionPath).doc(docId);
        return await docRef.update(data);
      },
      
      documentDelete: async (collectionPath: string, docId: string) => {
        console.log(`[FirebaseCompat] documentDelete: ${collectionPath}/${docId}`);
        const docRef = this._firestore.collection(collectionPath).doc(docId);
        return await docRef.delete();
      }
    };
  }
  
  // Return the enhanced Firestore instance
  getInstance() {
    return this._firestore;
  }
}

// Export a singleton instance
const firestoreCompat = new FirestoreNativeCompat();
export default firestoreCompat.getInstance(); 