/**
 * Firebase API Compatibility Layer
 * 
 * This provides compatibility between 
 * - The modern Firebase Web API (firebaseInit.js)
 * - The native React Native Firebase API pattern
 */

import { 
  firestore as webFirestore, 
  auth as webAuth,
  firebaseApp
} from './firebaseInit';

// Use the safer import method from the compatibility module
import { 
  getNativeFirebaseApp, 
  getNativeFirestore, 
  getNativeAuth, 
  isNativeFirebaseAvailable 
} from './firebaseCompat';

// Import Firebase web SDK for types
import {
  collection, doc, getDoc, getDocs, setDoc, 
  updateDoc, deleteDoc, query, where, onSnapshot,
  Timestamp as FirestoreTimestamp,
  orderBy, limit,
  WhereFilterOp,
  DocumentData
} from 'firebase/firestore';

import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User
} from 'firebase/auth';

// Detect which Firebase implementation to use
// Only use native if web Firebase is unavailable or if native is explicitly available
const useNative = (!webFirestore || !webAuth) && isNativeFirebaseAvailable();
console.log('[FirebaseCompat] Using', useNative ? 'native' : 'web', 'Firebase implementation');

// Type definitions to match React Native Firebase patterns
export type Unsubscribe = () => void;

export interface DocumentSnapshot {
  exists: boolean;
  id: string;
  data: () => DocumentData | undefined;
}

export interface QuerySnapshot {
  docs: DocumentSnapshot[];
}

export interface CollectionReference {
  doc: (id: string) => DocumentReference;
  where: (field: string, operator: WhereFilterOp, value: any) => Query;
  orderBy: (field: string, direction?: 'asc' | 'desc') => Query;
  get: () => Promise<QuerySnapshot>;
  onSnapshot: (callback: (snapshot: QuerySnapshot) => void, onError?: (error: Error) => void) => Unsubscribe;
}

export interface DocumentReference {
  get: () => Promise<DocumentSnapshot>;
  set: (data: any) => Promise<void>;
  update: (data: any) => Promise<void>;
  delete: () => Promise<void>;
  collection: (path: string) => CollectionReference;
  onSnapshot: (callback: (snapshot: DocumentSnapshot) => void, onError?: (error: Error) => void) => Unsubscribe;
}

export interface Query {
  get: () => Promise<QuerySnapshot>;
  onSnapshot: (callback: (snapshot: QuerySnapshot) => void, onError?: (error: Error) => void) => Unsubscribe;
  orderBy: (field: string, direction?: 'asc' | 'desc') => Query;
  limit: (n: number) => Query;
  where: (field: string, operator: WhereFilterOp, value: any) => Query;
}

export interface FirestoreType {
  collection: (path: string) => CollectionReference;
  doc: (path: string) => DocumentReference;
}

export interface AuthType {
  currentUser: User | null;
  onAuthStateChanged: (callback: (user: User | null) => void) => Unsubscribe;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<any>;
  createUserWithEmailAndPassword: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updateProfile: (user: User, profileData: {displayName?: string, photoURL?: string}) => Promise<void>;
}

// Legacy pattern compatibility for firestore()
export const firestore = (): FirestoreType => {
  // Use native Firestore if web Firestore is not available and native is available
  if (useNative) {
    const nativeFirestoreInstance = getNativeFirestore();
    if (nativeFirestoreInstance) {
      console.log('[FirebaseCompat] Using native Firestore');
      return nativeFirestoreInstance;
    } else {
      console.log('[FirebaseCompat] Native Firestore unavailable, falling back to web');
    }
  }
  
  console.log('[FirebaseCompat] Using web Firestore with compatibility layer');
  
  // Helper function to create a document reference with collection capability
  const createDocWithCollection = (docRef: any): DocumentReference => {
    return {
      get: async () => {
        const snapshot = await getDoc(docRef);
        return {
          exists: snapshot.exists(),
          data: () => snapshot.data() as DocumentData | undefined,
          id: snapshot.id
        };
      },
      set: async (data) => {
        return setDoc(docRef, data);
      },
      update: async (data) => {
        return updateDoc(docRef, data);
      },
      delete: async () => {
        return deleteDoc(docRef);
      },
      onSnapshot: (callback, onError) => {
        return onSnapshot(docRef, 
          (snapshot) => {
            callback({
              exists: snapshot.exists(),
              data: () => snapshot.data() as DocumentData | undefined,
              id: snapshot.id
            });
          }, 
          onError
        );
      },
      collection: (subcollectionPath) => {
        const subcollectionRef = collection(docRef, subcollectionPath);
        return createCollectionReference(subcollectionRef);
      }
    };
  };

  // Helper function to create a collection reference
  const createCollectionReference = (collectionRef: any): CollectionReference => {
    return {
      doc: (id) => {
        const documentRef = doc(collectionRef, id);
        return createDocWithCollection(documentRef);
      },
      where: (field, operator, value) => {
        const q = query(collectionRef, where(field, operator, value));
        return createQueryReference(q);
      },
      orderBy: (field, direction = 'asc') => {
        const q = query(collectionRef, orderBy(field, direction));
        return createQueryReference(q);
      },
      get: async () => {
        const querySnapshot = await getDocs(collectionRef);
        return {
          docs: querySnapshot.docs.map((doc: any) => ({
            id: doc.id,
            data: () => doc.data() as DocumentData | undefined,
            exists: doc.exists()
          }))
        };
      },
      onSnapshot: (callback, onError) => {
        return onSnapshot(collectionRef, 
          (querySnapshot) => {
            callback({
              docs: querySnapshot.docs.map((doc: any) => ({
                id: doc.id,
                data: () => doc.data() as DocumentData | undefined,
                exists: doc.exists()
              }))
            });
          }, 
          onError
        );
      }
    };
  };

  // Helper function to create a query reference
  const createQueryReference = (q: any): Query => {
    return {
      get: async () => {
        const querySnapshot = await getDocs(q);
        return {
          docs: querySnapshot.docs.map((doc: any) => ({
            id: doc.id,
            data: () => doc.data() as DocumentData | undefined,
            exists: doc.exists()
          }))
        };
      },
      onSnapshot: (callback, onError) => {
        return onSnapshot(q, 
          (querySnapshot) => {
            callback({
              docs: querySnapshot.docs.map((doc: any) => ({
                id: doc.id,
                data: () => doc.data() as DocumentData | undefined,
                exists: doc.exists()
              }))
            });
          }, 
          onError
        );
      },
      orderBy: (field, direction = 'asc') => {
        const orderedQuery = query(q, orderBy(field, direction));
        return createQueryReference(orderedQuery);
      },
      limit: (n) => {
        const limitedQuery = query(q, limit(n));
        return createQueryReference(limitedQuery);
      },
      where: (field, operator, value) => {
        const filteredQuery = query(q, where(field, operator, value));
        return createQueryReference(filteredQuery);
      }
    };
  };

  // Return an object that mimics React Native Firebase structure
  return {
    collection: (path) => {
      const collectionRef = collection(webFirestore, path);
      return createCollectionReference(collectionRef);
    },
    doc: (path) => {
      const pathParts = path.split('/');
      let docRef;
      
      if (pathParts.length === 2) {
        // Simple path like 'collection/docId'
        docRef = doc(webFirestore, pathParts[0], pathParts[1]);
      } else {
        // Handle complex paths by breaking them down
        docRef = doc(webFirestore, path);
      }
      
      return createDocWithCollection(docRef);
    }
  };
};

// Legacy pattern compatibility for auth()
export const auth = (): AuthType => {
  // Use native Auth if web Auth is not available and native is available
  if (useNative) {
    const nativeAuthInstance = getNativeAuth();
    if (nativeAuthInstance) {
      console.log('[FirebaseCompat] Using native Auth');
      return nativeAuthInstance;
    } else {
      console.log('[FirebaseCompat] Native Auth unavailable, falling back to web');
    }
  }
  
  console.log('[FirebaseCompat] Using web Auth with compatibility layer');
  return {
    currentUser: webAuth.currentUser,
    onAuthStateChanged: (callback) => {
      return onAuthStateChanged(webAuth, (user) => {
        callback(user);
      });
    },
    signInWithEmailAndPassword: (email, password) => {
      return signInWithEmailAndPassword(webAuth, email, password);
    },
    createUserWithEmailAndPassword: (email, password) => {
      return createUserWithEmailAndPassword(webAuth, email, password);
    },
    signOut: () => {
      return signOut(webAuth);
    },
    sendPasswordResetEmail: (email) => {
      return sendPasswordResetEmail(webAuth, email);
    },
    updateProfile: (user, profileData) => {
      return updateProfile(user, profileData);
    }
  };
};

// Export Timestamp functionality
export const Timestamp = {
  now: () => FirestoreTimestamp.now(),
  fromDate: (date: Date) => FirestoreTimestamp.fromDate(date),
  toDate: (timestamp: any) => {
    if (timestamp instanceof Date) {
      return timestamp;
    }
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    return new Date(timestamp);
  }
};

// Export Firebase compatibility layer initialization success
console.log('[FirebaseCompat] Compatibility layer initialized successfully');

// Direct references to the web API if needed
export { webFirestore, webAuth, firebaseApp }; 