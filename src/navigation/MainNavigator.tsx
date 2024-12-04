import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import { RootStackParamList } from '../types/navigation';

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
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          headerShown: false,
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
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WorkoutDetails"
        component={WorkoutDetails}
        options={{
          headerTitle: 'Workout Details',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="AddCustomWorkout"
        component={AddCustomWorkoutScreen}
        options={{
          headerTitle: 'Add Custom Workout',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="FoodScanner"
        component={FoodScannerScreen}
        options={{
          headerTitle: 'Scan Food',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="ScannedFoodDetails"
        component={ScannedFoodDetailsScreen}
        options={{
          headerTitle: 'Food Details',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
        options={{
          headerTitle: 'Create Group',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="GroupDetails"
        component={GroupDetailsScreen}
        options={{
          headerTitle: 'Group Details',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="InviteMembers"
        component={InviteMembersScreen}
        options={{
          headerTitle: 'Invite Members',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="ManageInvites"
        component={ManageInvitesScreen}
        options={{
          headerTitle: 'Manage Invites',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="GroupWorkouts"
        component={GroupWorkoutsScreen}
        options={{
          headerTitle: 'Group Workouts',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="SelectWorkout"
        component={SelectWorkoutScreen}
        options={{
          headerTitle: 'Select Workout',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="ShareWorkout"
        component={ShareWorkoutScreen}
        options={{
          headerTitle: 'Share Workout',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="GroupAnalytics"
        component={GroupAnalyticsScreen}
        options={{
          headerTitle: 'Group Analytics',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="GroupChallenges"
        component={GroupChallengesScreen}
        options={{
          headerTitle: 'Group Challenges',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="ProfileGroups"
        component={ProfileGroupsScreen}
        options={{
          headerTitle: 'Groups',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="AddIndividual"
        component={AddIndividualScreen}
        options={{
          headerTitle: 'Add Individual',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: 'Settings',
          headerBackTitleVisible: false,
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
