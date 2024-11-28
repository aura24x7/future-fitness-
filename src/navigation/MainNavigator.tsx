import React, { useState, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

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
import AchievementsScreen from '../screens/AchievementsScreen';
import CreateChallengeScreen from '../screens/CreateChallengeScreen';
import ShareWorkoutPlanScreen from '../screens/ShareWorkoutPlanScreen';
import SelectRecipientsScreen from '../screens/SelectRecipientsScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

// Import custom tab bar
import { FloatingTabBar } from '../components/FloatingTabBar';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export type MainStackParamList = {
  MainTabs: undefined;
  WorkoutDetails: undefined;
  AddCustomWorkout: undefined;
  FoodScanner: undefined;
  ScannedFoodDetails: undefined;
  CreateGroup: undefined;
  GroupDetails: undefined;
  InviteMembers: undefined;
  ManageInvites: undefined;
  GroupWorkouts: undefined;
  SelectWorkout: undefined;
  ShareWorkout: undefined;
  GroupAnalytics: undefined;
  GroupChallenges: undefined;
  Achievements: undefined;
  CreateChallenge: undefined;
  ShareWorkoutPlan: undefined;
  SelectRecipients: undefined;
  QRScanner: undefined;
  Notifications: undefined;
};

const TabNavigator = () => {
  const navigation = useNavigation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnreadCount = async () => {
      const currentUser = await userService.getCurrentUser();
      if (currentUser) {
        const count = await workoutNotificationService.getUnreadCount(currentUser.id);
        setUnreadCount(count);
      }
    };

    loadUnreadCount();
  }, []);

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
        component={WorkoutScreen}
        options={{
          title: 'Workout',
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
        }}
      />
      <Tab.Screen
        name="Groups"
        component={GroupsScreen}
        options={{
          title: 'Groups',
        }}
      />
      <Tab.Screen
        name="Challenges"
        component={GroupChallengesScreen}
        options={{
          title: 'Challenges',
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: 16 }}
              onPress={() => navigation.navigate('CreateChallenge')}
            >
              <Ionicons name="add-circle-outline" size={24} color="#6366F1" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View>
              <Ionicons
                name={focused ? 'notifications' : 'notifications-outline'}
                size={24}
                color={color}
              />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = {
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
};

const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen 
        name="WorkoutDetails" 
        component={WorkoutDetails}
        options={{
          headerShown: true,
          headerTitle: 'Workout Details',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#F5F6FA',
          },
        }}
      />
      <Stack.Screen 
        name="AddCustomWorkout" 
        component={AddCustomWorkoutScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen 
        name="FoodScanner" 
        component={FoodScannerScreen}
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
          animation: 'fade',
        }}
      />
      <Stack.Screen 
        name="ScannedFoodDetails" 
        component={ScannedFoodDetailsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Food Analysis',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#F5F6FA',
          },
        }}
      />
      <Stack.Screen 
        name="CreateGroup" 
        component={CreateGroupScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen 
        name="GroupDetails" 
        component={GroupDetailsScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="InviteMembers" 
        component={InviteMembersScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen 
        name="ManageInvites" 
        component={ManageInvitesScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="GroupWorkouts" 
        component={GroupWorkoutsScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="SelectWorkout" 
        component={SelectWorkoutScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen 
        name="ShareWorkout" 
        component={ShareWorkoutScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen 
        name="GroupAnalytics" 
        component={GroupAnalyticsScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="GroupChallenges" 
        component={GroupChallengesScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="Achievements" 
        component={AchievementsScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="CreateChallenge"
        component={CreateChallengeScreen}
        options={{
          title: 'Create Challenge',
          headerShown: true,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="ShareWorkoutPlan"
        component={ShareWorkoutPlanScreen}
        options={{
          title: 'Share Workout Plan',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="SelectRecipients"
        component={SelectRecipientsScreen}
        options={{
          title: 'Select Recipients',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="QRScanner"
        component={QRScannerScreen}
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;
