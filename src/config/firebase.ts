import { initializeApp, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
let app;
try {
  app = getApp();
} catch (error) {
  app = initializeApp(firebaseConfig);
}

// Initialize Auth
const auth = getAuth(app);

// Initialize Cloud Firestore
const firestore = getFirestore(app);

// Export initialized instances
export { auth, firestore };
