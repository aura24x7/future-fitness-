import { initializeApp, getApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBAkq6elriSkPSj6Ab8xWY_sbtyZDNoUOg",
  authDomain: "ai-fitness-be667.firebaseapp.com",
  projectId: "ai-fitness-be667",
  storageBucket: "ai-fitness-be667.firebasestorage.app",
  messagingSenderId: "822972139614",
  appId: "1:822972139614:web:ab8cebc647e2ccf81a4ccf",
  measurementId: "G-Q2CJ17MDN2"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Cloud Firestore with settings for React Native
const firestore = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});

export { auth, firestore };
