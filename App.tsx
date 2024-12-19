import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { OnboardingProvider } from './src/context/OnboardingContext';
import { TabBarProvider } from './src/context/TabBarContext';
import { AuthProvider } from './src/context/AuthContext';
import { ProfileGroupsProvider } from './src/contexts/ProfileGroupsContext';
import { GymBuddyAlertProvider } from './src/contexts/GymBuddyAlertContext';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { AlertNotificationManager } from './src/components/GymBuddyAlert/AlertNotificationManager';
import { ProfileProvider } from './src/context/ProfileContext';
import { MealProvider } from './src/contexts/MealContext';
import { SimpleFoodLogProvider } from './src/contexts/SimpleFoodLogContext';
import { LoadingProvider } from './src/contexts/LoadingContext';
import SplashScreenComponent from './src/components/SplashScreen';
import * as SplashScreen from 'expo-splash-screen';
import { useLoading } from './src/contexts/LoadingContext';
import ErrorBoundary from './src/components/ErrorBoundary';
import { initializeApp } from './src/utils/AppInitializer';

// Initialize app essentials
initializeApp().catch(console.error);

const AppContent = () => {
  const { isLoading, progress } = useLoading();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync().catch(console.error);
    }
  }, [isLoading]);

  return (
    <>
      <NavigationContainer>
        <ProfileProvider>
          <OnboardingProvider>
            <TabBarProvider>
              <MealProvider>
                <SimpleFoodLogProvider>
                  <ProfileGroupsProvider>
                    <GymBuddyAlertProvider>
                      <StatusBar barStyle="dark-content" />
                      <AppNavigator />
                      <AlertNotificationManager />
                    </GymBuddyAlertProvider>
                  </ProfileGroupsProvider>
                </SimpleFoodLogProvider>
              </MealProvider>
            </TabBarProvider>
          </OnboardingProvider>
        </ProfileProvider>
      </NavigationContainer>
      {isLoading && <SplashScreenComponent isLoading={isLoading} progress={progress} />}
    </>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <ErrorBoundary>
            <AuthProvider>
              <LoadingProvider>
                <AppContent />
              </LoadingProvider>
            </AuthProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
