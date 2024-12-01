import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { OnboardingProvider } from './src/context/OnboardingContext';
import { AppProvider } from './src/context/AppContext';
import { TabBarProvider } from './src/context/TabBarContext';
import { AuthProvider } from './src/context/AuthContext';
import { auth } from './src/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ThemeProvider as TamaguiThemeProvider } from '@tamagui/core';
import { TamaguiProvider } from 'tamagui';
import { ThemeProvider } from './src/theme/ThemeProvider';
import config from './tamagui.config';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      // Set up auth state listener
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setIsReady(true);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error in auth state change:', error);
      setIsReady(true);
    }
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <TamaguiProvider config={config}>
      <TamaguiThemeProvider defaultTheme="light">
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
              <AppProvider>
                <OnboardingProvider>
                  <TabBarProvider>
                    <ThemeProvider>
                      <NavigationContainer>
                        <StatusBar barStyle="dark-content" />
                        <AppNavigator />
                      </NavigationContainer>
                    </ThemeProvider>
                  </TabBarProvider>
                </OnboardingProvider>
              </AppProvider>
            </AuthProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </TamaguiThemeProvider>
    </TamaguiProvider>
  );
}
