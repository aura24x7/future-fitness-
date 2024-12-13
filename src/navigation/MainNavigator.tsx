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
import FoodLogScreen from '../screens/FoodLogScreen';
import ProgressScreen from '../screens/ProgressScreen';
import WorkoutScreen from '../screens/WorkoutScreen';

// Import custom bottom taskbar
import { BottomTaskbar } from '../components/BottomTaskbar';

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

      {/* Profile Screen */}
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: true,
          title: 'Profile',
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

      {/* Food Log Screen */}
      <Stack.Screen
        name="FoodLog"
        component={FoodLogScreen}
        options={{
          headerShown: true,
          title: 'Food Log',
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

      {/* Progress Screen */}
      <Stack.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          headerShown: true,
          title: 'Progress',
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

      {/* Workout Screen */}
      <Stack.Screen
        name="Workouts"
        component={WorkoutScreen}
        options={{
          headerShown: true,
          title: 'Workouts',
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

      {/* Food Related Screens */}
      <Stack.Screen
        name="FoodScanner"
        component={FoodScannerScreen}
        options={{
          headerShown: true,
          title: 'Scan Food'
        }}
      />
      <Stack.Screen
        name="ScannedFoodDetails"
        component={ScannedFoodDetailsScreen}
        options={{
          headerShown: true,
          title: 'Food Details'
        }}
      />

      {/* Settings */}
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
