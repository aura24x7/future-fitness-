import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar, View } from 'react-native';
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
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      // Set up auth state listener
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log('Auth state changed:', user ? 'User logged in' : 'No user');
        setIsReady(true);
      }, (error) => {
        console.error('Auth state change error:', error);
        setIsReady(true);
      });

      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.error('Error during app initialization:', error);
      setIsReady(true);
    }
  }, []);

  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: '#4c669f' }} />;
  }

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const { theme } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppProvider>
            <OnboardingProvider>
              <TabBarProvider>
                <NavigationContainer theme={theme}>
                  <StatusBar barStyle={theme.dark ? 'light' : 'dark'} />
                  <AppNavigator />
                </NavigationContainer>
              </TabBarProvider>
            </OnboardingProvider>
          </AppProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
