import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme/ThemeProvider';

// Import screens
import ProfileGroupsScreen from '../screens/ProfileGroupsScreen';
import FoodScannerScreen from '../screens/FoodScannerScreen';
import { BottomTaskbar } from '../components/BottomTaskbar';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      tabBar={props => <BottomTaskbar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.headerBackground,
        },
        headerShadowVisible: false,
      }}
    >
      <Tab.Screen
        name="ProfileGroups"
        component={ProfileGroupsScreen}
        options={{
          headerShown: true,
          title: 'Groups'
        }}
      />
      <Tab.Screen
        name="FoodScanner"
        component={FoodScannerScreen}
        options={{
          headerShown: true,
          title: 'Scan Food'
        }}
      />
    </Tab.Navigator>
  );
};
