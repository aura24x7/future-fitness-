import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme/ThemeProvider';
import { TabParamList } from '../types/navigation';

// Import screens
import ProfileGroupsScreen from '../screens/ProfileGroupsScreen';
import FoodScannerScreen from '../screens/FoodScannerScreen';
import FoodTextInputScreen from '../screens/FoodTextInputScreen';
import BottomTaskbar from '../components/BottomTaskbar';

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        tabBarShowLabel: false,
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
        name="FoodTextInput"
        component={FoodTextInputScreen}
        options={{
          headerShown: false,
          title: 'Text Log'
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

export default TabNavigator;
