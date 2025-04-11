const fs = require('fs');
const path = require('path');

// Import the base config from app.json
const baseConfig = require('./app.json');

// Create a dynamic configuration
module.exports = ({ config }) => {
  // Start with the static config
  let finalConfig = {
    ...config, // Use the config passed in by Expo CLI, which includes app.json
    // Optionally override or add dynamic values here
    extra: {
      ...config.extra,
      firebaseBomVersion: "33.9.0",
      forceFirebaseCommonVersion: "20.3.3",
      // Debug flag for development
      enableFirebaseDebug: process.env.EXPO_DEBUG === "true",
    },
  };

  // Return the final configuration object
  return finalConfig;
};

// Original plugins array - keeping it separate for clarity,
// ensure these are correctly processed within the dynamic config if needed,
// although Expo CLI usually handles plugins defined in app.json automatically.
// const originalPlugins = [
//   ["@react-native-firebase/app", {
//     android_package_name: "com.aifit.aifitness",
//     firebase_bom_version: "33.9.0"
//   }],
//   "@react-native-firebase/auth",
//   ["@react-native-firebase/messaging", {
//     auto_init: true,
//     android_channel_id: "default"
//   }],
//   [
//     "expo-camera",
//     {
//       cameraPermission: "Allow Future Fitness to access your camera."
//     }
//   ],
//   [
//     "expo-notifications",
//     {
//       icon: "./assets/icon.png",
//       color: "#4c669f",
//       defaultChannel: "default",
//       enableBackgroundRemoteNotifications: false
//     }
//   ],
//   "./app.config.plugin.js",
//   "./firebase-dependency-plugin.js",
//   "./android-build.gradle.plugin.js"
// ]; 