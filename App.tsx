import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { ProfileProvider } from './src/context/ProfileContext';
import { OnboardingProvider } from './src/context/OnboardingContext';
import { TabBarProvider } from './src/context/TabBarContext';
import { MealProvider } from './src/contexts/MealContext';
import { SimpleFoodLogProvider } from './src/contexts/SimpleFoodLogContext';
import { ProfileGroupsProvider } from './src/contexts/ProfileGroupsContext';
import { GymBuddyAlertProvider } from './src/contexts/GymBuddyAlertContext';
import { LoadingProvider, useLoading } from './src/contexts/LoadingContext';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { AlertNotificationManager } from './src/components/GymBuddyAlert/AlertNotificationManager';
import SplashScreenComponent from './src/components/SplashScreen';
import * as SplashScreen from 'expo-splash-screen';
import ErrorBoundary from './src/components/ErrorBoundary';
import { initializeApp, getInitializationState } from './src/utils/AppInitializer';

// Initialize app essentials
initializeApp().catch(console.error);

const AppContent = () => {
  const { isLoading, progress } = useLoading();
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        while (!getInitializationState().isInitialized || !getInitializationState().authInitialized) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        setIsAppReady(true);
        
        if (!isLoading) {
          await SplashScreen.hideAsync();
        }
      } catch (error) {
        console.error('Error preparing app:', error);
      }
    }

    prepare();
  }, [isLoading]);

  if (!isAppReady) {
    return null;
  }

  return (
    <>
      <ProfileProvider>
        <OnboardingProvider>
          <TabBarProvider>
            <MealProvider>
              <SimpleFoodLogProvider>
                <ProfileGroupsProvider>
                  <GymBuddyAlertProvider>
                    <StatusBar style="auto" />
                    <AppNavigator />
                    <AlertNotificationManager />
                  </GymBuddyAlertProvider>
                </ProfileGroupsProvider>
              </SimpleFoodLogProvider>
            </MealProvider>
          </TabBarProvider>
        </OnboardingProvider>
      </ProfileProvider>
      {isLoading && <SplashScreenComponent isLoading={isLoading} progress={progress} />}
    </>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <LoadingProvider>
            <NavigationContainer>
              <AppContent />
            </NavigationContainer>
          </LoadingProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
