/* master
Restoring the actual Firebase configuration values
*/

import { Platform } from 'react-native';

// Platform-specific Firebase configurations
const androidConfig = {
  apiKey: "AIzaSyBAkq6elriSkPSj6Ab8xWY_sbtyZDNoUOg",
  authDomain: "ai-fitness-be667.firebaseapp.com",
  projectId: "ai-fitness-be667",
  storageBucket: "ai-fitness-be667.firebasestorage.app",
  messagingSenderId: "822972139614",
  appId: "1:822972139614:android:f2337a71711689f51a4ccf",
  measurementId: "G-Q2CJ17MDN2",
  databaseURL: "https://ai-fitness-be667.firebaseio.com"
};

const iosConfig = {
  apiKey: "AIzaSyBAkq6elriSkPSj6Ab8xWY_sbtyZDNoUOg",
  authDomain: "ai-fitness-be667.firebaseapp.com",
  projectId: "ai-fitness-be667",
  storageBucket: "ai-fitness-be667.firebasestorage.app",
  messagingSenderId: "822972139614",
  appId: "1:822972139614:ios:ab8cebc647e2ccf81a4ccf",
  measurementId: "G-Q2CJ17MDN2",
  databaseURL: "https://ai-fitness-be667.firebaseio.com"
};

// Export the configuration based on platform
const config = Platform.select({
  android: androidConfig,
  ios: iosConfig,
  default: androidConfig // Fallback to Android config
});

if (!config) {
  throw new Error('No valid Firebase configuration found for platform');
}

export const firebaseConfig = config;