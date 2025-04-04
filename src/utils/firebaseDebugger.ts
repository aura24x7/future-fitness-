import { 
  firebaseApp, 
  auth as syncAuth, 
  firestore as syncFirestore 
} from '../firebase/firebaseInit';

import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  Timestamp 
} from 'firebase/firestore';

/**
 * Firebase Debugger Utility
 * 
 * A utility to help diagnose Firebase integration issues.
 * Use this in development to check Firebase module status and report errors.
 */

interface MethodCheckResult {
  exists: boolean;
  type: string;
}

export const checkFirebaseStatus = () => {
  try {
    // Check Firebase app status
    console.log('[FirebaseDebugger] Firebase app exists:', !!firebaseApp);
    
    // Check Auth availability
    console.log('[FirebaseDebugger] Auth module exists:', !!syncAuth);
    
    // Check Firestore availability
    console.log('[FirebaseDebugger] Firestore module exists:', !!syncFirestore);
    
    // Check current user
    const currentUser = syncAuth.currentUser;
    console.log('[FirebaseDebugger] Current user:', currentUser ? `Logged in (${currentUser.uid})` : 'Not logged in');
    
    // Check Firestore methods
    const firestoreMethods = [
      { name: 'collection', method: collection },
      { name: 'doc', method: doc },
      { name: 'getDoc', method: getDoc },
      { name: 'setDoc', method: setDoc },
      { name: 'deleteDoc', method: deleteDoc },
    ];
    
    console.log('[FirebaseDebugger] Checking Firestore methods:');
    firestoreMethods.forEach(({ name, method }) => {
      const result = checkMethod(method);
      console.log(`- ${name}: ${result.exists ? 'Available' : 'Missing'} (${result.type})`);
    });
    
    return {
      appInitialized: !!firebaseApp,
      authInitialized: !!syncAuth,
      firestoreInitialized: !!syncFirestore,
      userLoggedIn: !!currentUser,
    };
  } catch (error) {
    console.error('[FirebaseDebugger] Error checking Firebase status:', error);
    return {
      appInitialized: false,
      authInitialized: false,
      firestoreInitialized: false,
      userLoggedIn: false,
      error,
    };
  }
};

const checkMethod = (method: any): MethodCheckResult => {
  if (!method) {
    return { exists: false, type: 'undefined' };
  }
  return { exists: true, type: typeof method };
};

// Run a test Firestore operation to verify connectivity
export const testFirestoreOperation = async () => {
  try {
    const testDocRef = doc(syncFirestore, '_debug_test_', 'test_doc');
    
    // Try to write
    console.log('[FirebaseDebugger] Testing Firestore write operation...');
    await setDoc(testDocRef, {
      timestamp: Timestamp.now(),
      testValue: 'This is a test document'
    });
    console.log('[FirebaseDebugger] Write successful');
    
    // Try to read
    console.log('[FirebaseDebugger] Testing Firestore read operation...');
    const docSnap = await getDoc(testDocRef);
    console.log('[FirebaseDebugger] Read successful:', docSnap.exists());
    
    // Cleanup
    await deleteDoc(testDocRef);
    console.log('[FirebaseDebugger] Test document deleted');
    
    return { success: true };
  } catch (error) {
    console.error('[FirebaseDebugger] Firestore test operation failed:', error);
    return { success: false, error };
  }
};

// Add this call to any screen where you need to debug Firebase
export const debugFirebase = async () => {
  console.log('======= FIREBASE DEBUGGER =======');
  const status = checkFirebaseStatus();
  console.log('[FirebaseDebugger] Status:', status);
  
  if (status.firestoreInitialized) {
    const testResult = await testFirestoreOperation();
    console.log('[FirebaseDebugger] Test result:', testResult);
  }
  console.log('======= END FIREBASE DEBUGGER =======');
  
  return { status };
}; 