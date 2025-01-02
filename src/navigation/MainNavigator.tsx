import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import FoodScannerScreen from '../screens/FoodScannerScreen';
import ProfileGroupsScreen from '../screens/ProfileGroupsScreen';
import ScannedFoodDetailsScreen from '../screens/ScannedFoodDetailsScreen';
import GroupDetailsScreen from '../screens/GroupDetailsScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';
import InviteMembersScreen from '../screens/InviteMembersScreen';
import ManageInvitesScreen from '../screens/ManageInvitesScreen';
import AddIndividualScreen from '../screens/AddIndividualScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FoodTextInputScreen from '../screens/FoodTextInputScreen';

// Import custom bottom taskbar
import BottomTaskbar from '../components/BottomTaskbar';

const Stack = createNativeStackNavigator<RootStackParamList>();

const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Dashboard"
    >
      {/* Main Dashboard Screen */}
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          headerShown: false,
        }}
      />

      {/* Food Scanner Screen */}
      <Stack.Screen
        name="FoodScanner"
        component={FoodScannerScreen}
        options={{
          headerShown: true,
          title: 'Scan Food',
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerTransparent: true,
          headerTintColor: '#6366f1',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />

      {/* Food Text Input Screen */}
      <Stack.Screen
        name="FoodTextInput"
        component={FoodTextInputScreen}
        options={{
          headerShown: false
        }}
      />

      {/* Scanned Food Details Screen */}
      <Stack.Screen
        name="ScannedFoodDetails"
        component={ScannedFoodDetailsScreen}
        options={{
          headerShown: false
        }}
      />

      {/* Group Related Screens */}
      <Stack.Screen
        name="ProfileGroups"
        component={ProfileGroupsScreen}
        options={{
          headerShown: true,
          title: 'Groups'
        }}
      />
      <Stack.Screen
        name="GroupDetails"
        component={GroupDetailsScreen}
        options={{
          headerShown: true,
          title: 'Group Details'
        }}
      />
      <Stack.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
        options={{
          headerShown: true,
          title: 'Create Group'
        }}
      />
      <Stack.Screen
        name="InviteMembers"
        component={InviteMembersScreen}
        options={{
          headerShown: true,
          title: 'Invite Members'
        }}
      />
      <Stack.Screen
        name="ManageInvites"
        component={ManageInvitesScreen}
        options={{
          headerShown: true,
          title: 'Manage Invites'
        }}
      />
      <Stack.Screen
        name="AddIndividual"
        component={AddIndividualScreen}
        options={{
          headerShown: true,
          title: 'Add Individual'
        }}
      />

      {/* Profile & Settings */}
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: true,
          title: 'Settings',
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerTransparent: true,
          headerTintColor: '#6366f1',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;
