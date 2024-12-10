import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
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

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <NavigationContainer>
            <AuthProvider>
              <ProfileProvider>
                <OnboardingProvider>
                  <TabBarProvider>
                    <MealProvider>
                      <ProfileGroupsProvider>
                        <GymBuddyAlertProvider>
                          <StatusBar barStyle="dark-content" />
                          <AppNavigator />
                          <AlertNotificationManager />
                        </GymBuddyAlertProvider>
                      </ProfileGroupsProvider>
                    </MealProvider>
                  </TabBarProvider>
                </OnboardingProvider>
              </ProfileProvider>
            </AuthProvider>
          </NavigationContainer>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
