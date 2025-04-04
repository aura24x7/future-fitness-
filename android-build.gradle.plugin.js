const { withDangerousMod, createRunOncePlugin } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withCustomBuildGradle = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const buildGradlePath = path.join(projectRoot, 'android', 'build.gradle');
      
      // Create the android directory if it doesn't exist
      const androidDir = path.join(projectRoot, 'android');
      if (!fs.existsSync(androidDir)) {
        fs.mkdirSync(androidDir, { recursive: true });
      }
      
      // Create a custom build.gradle file with proper Firebase configuration
      const buildGradleContent = `// Top-level build file where you can add configuration options common to all sub-projects/modules.

buildscript {
    ext {
        buildToolsVersion = "34.0.0"
        minSdkVersion = 24
        compileSdkVersion = 35
        targetSdkVersion = 34
        ndkVersion = "26.1.10909125"
        kotlinVersion = "1.9.22"
        firebaseBomVersion = "33.9.0"
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle:8.6.0")
        classpath("com.facebook.react:react-native-gradle-plugin")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")
        classpath("com.google.gms:google-services:4.4.1")
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
        maven {
            // All of React Native (JS, Obj-C sources, Android binaries) is installed from npm
            url("$rootDir/../node_modules/react-native/android")
        }
        maven {
            // Android JSC is installed from npm
            url("$rootDir/../node_modules/jsc-android/dist")
        }
        maven {
            url "$rootDir/../node_modules/expo/node_modules/expo-camera/android/maven"
        }
        maven {
            url "$rootDir/../node_modules/expo-camera/android/maven"
        }
        mavenLocal()
        maven { url 'https://www.jitpack.io' }
    }

    // Force consistent versions of Firebase dependencies
    configurations.all {
        resolutionStrategy {
            // Force a specific version of Firebase Common
            force "com.google.firebase:firebase-common:20.3.3"
            force "com.google.firebase:firebase-annotations:16.2.0"
        }
    }
}`;

      // Write the custom build.gradle file
      fs.writeFileSync(buildGradlePath, buildGradleContent);
      
      return config;
    },
  ]);
};

module.exports = createRunOncePlugin(
  withCustomBuildGradle,
  'custom-build-gradle',
  '1.0.0'
); 