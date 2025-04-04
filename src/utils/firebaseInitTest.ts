/**
 * Firebase Initialization Test Utility
 * 
 * This utility helps diagnose Firebase initialization and operation issues.
 * It provides functions to test different aspects of Firebase functionality.
 */

// Import from our synchronized Firebase initialization
import { 
  firebaseApp, 
  auth as syncAuth, 
  firestore as syncFirestore 
} from '../firebase/firebaseInit';

import * as FirebaseCompat from './firebaseCompatibility';
import { getDoc, doc, setDoc, collection, Timestamp } from 'firebase/firestore';

export const testFirebaseInitialization = async () => {
  console.log('======= FIREBASE INITIALIZATION TEST =======');
  
  try {
    // Test Firebase app
    try {
      console.log('[FirebaseInitTest] Firebase app exists:', !!firebaseApp);
      console.log('[FirebaseInitTest] Firebase app name:', firebaseApp.name);
      console.log('[FirebaseInitTest] Firebase app options:', firebaseApp.options);
    } catch (error) {
      console.error('[FirebaseInitTest] Error getting Firebase app:', error);
    }
    
    // Test Auth
    try {
      console.log('[FirebaseInitTest] Auth initialized:', !!syncAuth);
      console.log('[FirebaseInitTest] Current user:', syncAuth.currentUser ? 'Logged in' : 'Not logged in');
    } catch (error) {
      console.error('[FirebaseInitTest] Error initializing Auth:', error);
    }
    
    // Test Firestore
    try {
      console.log('[FirebaseInitTest] Firestore initialized:', !!syncFirestore);
    } catch (error) {
      console.error('[FirebaseInitTest] Error initializing Firestore:', error);
    }
    
    // Test Firestore methods
    try {
      console.log('[FirebaseInitTest] Testing Firestore methods:');
      
      // Test collection method
      const testCollection = collection(syncFirestore, 'test');
      console.log('[FirebaseInitTest] collection method:', !!testCollection ? 'Available' : 'Not available');
      
      // Test doc method
      const testDoc = doc(syncFirestore, 'test', 'test');
      console.log('[FirebaseInitTest] doc method:', !!testDoc ? 'Available' : 'Not available');
      
      // Check if methods exist (without executing them)
      console.log('[FirebaseInitTest] set method available:', typeof setDoc === 'function' ? 'Yes' : 'No');
      console.log('[FirebaseInitTest] get method available:', typeof getDoc === 'function' ? 'Yes' : 'No');
    } catch (error) {
      console.error('[FirebaseInitTest] Error testing Firestore methods:', error);
    }
    
    // Test compatibility layer
    try {
      console.log('[FirebaseInitTest] Testing compatibility layer:');
      const testResult = await FirebaseCompat.testFirebaseConnection();
      console.log('[FirebaseInitTest] Compatibility layer test result:', testResult.success ? 'Success' : 'Failed');
    } catch (error) {
      console.error('[FirebaseCompat] Test failed:', error);
    }
    
  } catch (error) {
    console.error('[FirebaseInitTest] Unexpected error during tests:', error);
  }
  
  console.log('======= END FIREBASE INITIALIZATION TEST =======');
};

export const testFirestoreWrite = async () => {
  console.log('======= TESTING FIRESTORE WRITE =======');
  
  try {
    // Test direct write
    try {
      console.log('[FirebaseInitTest] Testing direct Firestore write...');
      const testRef = doc(syncFirestore, '_test_', 'test_direct');
      await setDoc(testRef, {
        timestamp: Timestamp.now(),
        testValue: 'Direct write test'
      });
      console.log('[FirebaseInitTest] Direct write successful');
    } catch (error) {
      console.error('[FirebaseInitTest] Direct write failed:', error);
    }
    
    // Test compatibility layer write
    try {
      console.log('[FirebaseInitTest] Testing compatibility layer write...');
      await FirebaseCompat.setDoc('_test_', 'test_compat', {
        timestamp: FirebaseCompat.timestamp(),
        testValue: 'Compatibility layer write test'
      });
      console.log('[FirebaseInitTest] Compatibility layer write successful');
    } catch (error) {
      console.error('[FirebaseInitTest] Compatibility layer write failed:', error);
    }
    
  } catch (error) {
    console.error('[FirebaseInitTest] Unexpected error during write tests:', error);
  }
  
  console.log('======= END TESTING FIRESTORE WRITE =======');
};

export const runAllTests = async () => {
  await testFirebaseInitialization();
  await testFirestoreWrite();
}; 