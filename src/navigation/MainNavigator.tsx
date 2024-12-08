import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, View } from 'react-native';
import { RootStackParamList } from '../types/navigation';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import FoodLogScreen from '../screens/FoodLogScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WorkoutDetails from '../screens/WorkoutDetails';
import AddCustomWorkoutScreen from '../screens/AddCustomWorkoutScreen';
import FoodScannerScreen from '../screens/FoodScannerScreen';
import ScannedFoodDetailsScreen from '../screens/ScannedFoodDetailsScreen';
import GroupsScreen from '../screens/GroupsScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';
import GroupDetailsScreen from '../screens/GroupDetailsScreen';
import InviteMembersScreen from '../screens/InviteMembersScreen';
import ManageInvitesScreen from '../screens/ManageInvitesScreen';
import GroupWorkoutsScreen from '../screens/GroupWorkoutsScreen';
import SelectWorkoutScreen from '../screens/SelectWorkoutScreen';
import ShareWorkoutScreen from '../screens/ShareWorkoutScreen';
import GroupAnalyticsScreen from '../screens/GroupAnalyticsScreen';
import GroupChallengesScreen from '../screens/GroupChallengesScreen';
import ProfileGroupsScreen from '../screens/ProfileGroupsScreen';
import AddIndividualScreen from '../screens/AddIndividualScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import LockedFeatureScreen from '../components/LockedFeatureScreen';

// Import custom tab bar
import { FloatingTabBar } from '../components/FloatingTabBar';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <FloatingTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ffffff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
          color: '#1a1a1a',
        },
        headerTitleAlign: 'center',
        tabBarHideOnKeyboard: true,
        headerShadowVisible: false,
      }}
      initialRouteName="Dashboard"
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Workout"
        component={LockedFeatureScreen}
        options={{
          title: 'Workout',
          tabBarIcon: ({ focused, color }) => (
            <View style={{ alignItems: 'center' }}>
              <Ionicons
                name={focused ? 'fitness' : 'fitness-outline'}
                size={24}
                color={color}
              />
              <Ionicons
                name="lock-closed"
                size={12}
                color={color}
                style={{ position: 'absolute', right: -8, top: -4 }}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="FoodLog"
        component={FoodLogScreen}
        options={{
          title: 'Food Log',
          headerTitle: 'Food Log',
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          title: 'Progress',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Groups"
        component={ProfileGroupsScreen}
        options={{
          title: 'Groups',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="TabNavigator"
    >
      <Stack.Screen name="TabNavigator" component={TabNavigator} />
      <Stack.Screen
        name="WorkoutDetails"
        component={WorkoutDetails}
        options={{
          headerShown: true,
          title: 'Workout Details'
        }}
      />
      <Stack.Screen
        name="AddCustomWorkout"
        component={AddCustomWorkoutScreen}
        options={{
          headerShown: true,
          title: 'Add Custom Workout'
        }}
      />
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
      <Stack.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
        options={{
          headerShown: true,
          title: 'Create Group'
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
        name="GroupWorkouts"
        component={GroupWorkoutsScreen}
        options={{
          headerShown: true,
          title: 'Group Workouts'
        }}
      />
      <Stack.Screen
        name="SelectWorkout"
        component={SelectWorkoutScreen}
        options={{
          headerShown: true,
          title: 'Select Workout'
        }}
      />
      <Stack.Screen
        name="ShareWorkout"
        component={ShareWorkoutScreen}
        options={{
          headerShown: true,
          title: 'Share Workout'
        }}
      />
      <Stack.Screen
        name="GroupAnalytics"
        component={GroupAnalyticsScreen}
        options={{
          headerShown: true,
          title: 'Group Analytics'
        }}
      />
      <Stack.Screen
        name="GroupChallenges"
        component={GroupChallengesScreen}
        options={{
          headerShown: true,
          title: 'Group Challenges'
        }}
      />
      <Stack.Screen
        name="ProfileGroups"
        component={ProfileGroupsScreen}
        options={{
          headerShown: true,
          title: 'Groups'
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
