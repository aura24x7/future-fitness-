import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getMessaging, Messaging } from 'firebase/messaging';
import { getAnalytics } from 'firebase/analytics';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Updated Firebase configuration for Ai-calories project
const firebaseConfig = {
  apiKey: "AIzaSyDwDaMxenn_2HfwyhLJtaq_Yc8e8HkVFGI",
  authDomain: "ai-calories-150d7.firebaseapp.com",
  projectId: "ai-calories-150d7",
  storageBucket: "ai-calories-150d7.firebasestorage.app",
  messagingSenderId: "550020013634",
  appId: "1:550020013634:web:acb2ef7dfc3587ad8757db",
  measurementId: "G-RDNSNXL5WR",
  databaseURL: `https://${Platform.OS === 'web' ? '' : Platform.OS + '.'}ai-calories-150d7.firebaseio.com`
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services - simplify auth initialization to not use persistence
// This avoids the need for the react-native specific module
const auth = getAuth(app);

const firestore = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);
let messaging: Messaging | null = null;
let analytics = null;

// Only initialize messaging and analytics on web platform
if (Platform.OS === 'web') {
  messaging = getMessaging(app);
  analytics = getAnalytics(app);
}

export { app, auth, firestore, storage, functions, messaging, analytics, firebaseConfig }; 