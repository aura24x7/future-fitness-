import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';

// Import module resolver utility
import { preResolvedModules, isExpoGo } from './src/utils/moduleResolver';

// Use pre-resolved WebRTC module (real or mock based on environment)
if (!isExpoGo) {
  try {
    // Only call registerGlobals when we have the real WebRTC module
    // and not running in Expo Go
    const { registerGlobals } = preResolvedModules.webrtc;
    if (typeof registerGlobals === 'function') {
      registerGlobals();
      console.log('LiveKit WebRTC globals registered successfully');
    } else {
      console.warn('Invalid registerGlobals function');
    }
  } catch (error) {
    console.warn('Failed to register LiveKit WebRTC globals:', error);
  }
} else {
  console.log('Running in Expo Go - Using mocked LiveKit modules');
}

// STEP 1: Initialize the web version of Firebase first
import './src/firebase/firebaseInit';

// STEP 2: Initialize the compatibility layer
import './src/firebase/firebaseCompat';

// STEP 3: Import the Compatibility API layer which safely handles both implementations
import { firestore, auth } from './src/firebase/firebaseInstances';

// STEP 4: Set flag to silence deprecation warnings
console.log('📱 Setting up Firebase compatibility mode...');
// @ts-ignore
global.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

// Import app components
import { ThemeProvider } from './src/theme/ThemeProvider';
import { ProfileProvider } from './src/contexts/ProfileContext';
import { OnboardingProvider } from './src/contexts/OnboardingContext';
import { TabBarProvider } from './src/contexts/TabBarContext';
import { MealProvider } from './src/contexts/MealContext';
import { SimpleFoodLogProvider } from './src/contexts/SimpleFoodLogContext';
import { ProfileGroupsProvider } from './src/contexts/ProfileGroupsContext';
import { GymBuddyAlertProvider } from './src/contexts/GymBuddyAlertContext';
import { LoadingProvider, useLoading } from './src/contexts/LoadingContext';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { AlertNotificationManager } from './src/components/GymBuddyAlert/AlertNotificationManager';
import SplashScreenComponent from './src/components/SplashScreen';
import * as SplashScreen from 'expo-splash-screen';
import ErrorBoundary from './src/components/ErrorBoundary';
import { isFirebaseInitialized } from './src/firebase/firebaseInit';
import { TamaguiProvider } from './src/providers/TamaguiProvider';
import { WorkoutProvider } from './src/contexts/WorkoutContext';
import { LiveKitProvider } from './src/contexts/LiveKitContext';

// Declare the global property for TypeScript
declare global {
  var RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS: boolean;
}

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(console.warn);

const AppContent = () => {
  const { isLoading, progress } = useLoading();
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('[App] Starting app initialization...');
        
        // Verify Firebase is initialized properly
        if (!isFirebaseInitialized()) {
          console.warn('[App] Firebase appears not initialized, waiting briefly...');
          await new Promise(resolve => setTimeout(resolve, 500));
          
          if (!isFirebaseInitialized()) {
            throw new Error('Firebase initialization failed after retry');
          } else {
            console.log('[App] Firebase initialized successfully after waiting');
          }
        } else {
          console.log('[App] Firebase already initialized successfully');
        }
        
        // Test Firebase compatibility layer by accessing firestore and auth
        try {
          const firestoreInstance = firestore();
          const authInstance = auth();
          console.log('[App] Firebase compatibility layer working correctly');
        } catch (fbError) {
          console.warn('[App] Firebase compatibility layer error (non-critical):', fbError);
          // Continue anyway as we'll fall back to web Firebase
        }
        
        setIsInitialized(true);
        console.log('[App] App initialization completed');
      } catch (err) {
        console.error('[App] Initialization error:', err);
        setError(err instanceof Error ? err : new Error('Initialization failed'));
      }
    };

    initializeApp();
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
        <Text style={styles.errorText}>Please restart the app to try again.</Text>
      </View>
    );
  }

  if (!isInitialized || isLoading) {
    return <SplashScreenComponent progress={progress} isLoading={isLoading} />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <AppNavigator />
      <AlertNotificationManager />
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <TamaguiProvider>
        <LoadingProvider>
          <AuthProvider>
            <ThemeProvider>
              <ProfileProvider>
                <OnboardingProvider>
                  <ProfileGroupsProvider>
                    <TabBarProvider>
                      <MealProvider>
                        <SimpleFoodLogProvider>
                          <GymBuddyAlertProvider>
                            <WorkoutProvider>
                              <LiveKitProvider>
                                <AppContent />
                              </LiveKitProvider>
                            </WorkoutProvider>
                          </GymBuddyAlertProvider>
                        </SimpleFoodLogProvider>
                      </MealProvider>
                    </TabBarProvider>
                  </ProfileGroupsProvider>
                </OnboardingProvider>
              </ProfileProvider>
            </ThemeProvider>
          </AuthProvider>
        </LoadingProvider>
      </TamaguiProvider>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    margin: 10,
  },
});

export default App;
