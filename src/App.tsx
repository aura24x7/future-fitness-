import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './theme/ThemeProvider';
import { ProfileProvider } from './contexts/ProfileContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { TabBarProvider } from './contexts/TabBarContext';
import { MealProvider } from './contexts/MealContext';
import { SimpleFoodLogProvider } from './contexts/SimpleFoodLogContext';
import { ProfileGroupsProvider } from './contexts/ProfileGroupsContext';
import { GymBuddyAlertProvider } from './contexts/GymBuddyAlertContext';
import { LoadingProvider, useLoading } from './contexts/LoadingContext';
import { AuthProvider } from './contexts/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import { AlertNotificationManager } from './components/GymBuddyAlert/AlertNotificationManager';
import SplashScreenComponent from './components/SplashScreen';
import * as SplashScreen from 'expo-splash-screen';
import ErrorBoundary from './components/ErrorBoundary';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { appInitializer } from './services/appInitializer';

const App = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function initializeApp() {
      try {
        await appInitializer.initialize();
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // You might want to show an error screen here
      }
    }

    initializeApp();
  }, []);

  if (!isReady) {
    return <SplashScreenComponent />;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <AuthProvider>
            <ProfileProvider>
              <OnboardingProvider>
                <TabBarProvider>
                  <MealProvider>
                    <SimpleFoodLogProvider>
                      <ProfileGroupsProvider>
                        <GymBuddyAlertProvider>
                          <LoadingProvider>
                            <NavigationContainer>
                              <AlertNotificationManager>
                                <ErrorBoundary>
                                  <AppNavigator />
                                </ErrorBoundary>
                              </AlertNotificationManager>
                            </NavigationContainer>
                          </LoadingProvider>
                        </GymBuddyAlertProvider>
                      </ProfileGroupsProvider>
                    </SimpleFoodLogProvider>
                  </MealProvider>
                </TabBarProvider>
              </OnboardingProvider>
            </ProfileProvider>
          </AuthProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default App;