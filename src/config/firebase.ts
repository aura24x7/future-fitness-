import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC29iWAOAY09SDEf9poSzPFeQiTdhWFnW0",
  authDomain: "ai-fitness-be667.firebaseapp.com",
  projectId: "ai-fitness-be667",
  storageBucket: "ai-fitness-be667.firebasestorage.app",
  messagingSenderId: "822972139614",
  appId: "1:822972139614:android:f2337a71711689f51a4ccf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

export { auth, db, storage };
export default app;
