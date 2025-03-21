const fs = require('fs');
const path = require('path');

// Import the base config from app.json
const baseConfig = require('./app.json');

// Create a dynamic configuration
module.exports = {
  ...baseConfig.expo,
  hooks: {
    postPublish: [
      {
        file: "sentry-expo/upload-sourcemaps",
        config: {
          organization: "your-organization",
          project: "future-fitness",
          authToken: process.env.SENTRY_AUTH_TOKEN
        }
      }
    ],
  },
  extra: {
    ...baseConfig.expo.extra,
    firebaseBomVersion: "33.9.0",
    forceFirebaseCommonVersion: "20.3.3",
    // Debug flag for development
    enableFirebaseDebug: process.env.EXPO_DEBUG === "true",
  },
  // Process plugins with dynamic configuration
  plugins: [
    ["@react-native-firebase/app", {
      android_package_name: "com.aifit.aifitness",
      firebase_bom_version: "33.9.0"
    }],
    "@react-native-firebase/auth",
    ["@react-native-firebase/messaging", {
      auto_init: true,
      android_channel_id: "default"
    }],
    [
      "expo-camera",
      {
        cameraPermission: "Allow Future Fitness to access your camera."
      }
    ],
    [
      "expo-notifications",
      {
        icon: "./assets/icon.png",
        color: "#4c669f",
        defaultChannel: "default",
        enableBackgroundRemoteNotifications: false
      }
    ],
    "./app.config.plugin.js",
    "./firebase-dependency-plugin.js",
    "./android-build.gradle.plugin.js",
    "./android-app-build.gradle.plugin.js"
  ],
}; 