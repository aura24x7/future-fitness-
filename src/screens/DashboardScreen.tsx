import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'tamagui';
import { Header } from '../components/Header';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../components/Card';
import Button from '../components/Button';
import CalorieTrackerCard from '../components/CalorieTrackerCard';
import { mockAuth, mockWaterService, mockWorkoutService } from '../services/mockData';
import { workoutTrackingService } from '../services/workoutTrackingService';
import { MealType } from '../types/calorie';
import { MealLog } from '../services/ai/meal/types';
import { CalorieGoal, CalorieStats } from '../types/calorie';
import { colors, spacing, borderRadius } from '../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeProvider';
import { getStartOfDay } from '../utils/dateUtils';
import { useMeals } from '../contexts/MealContext';
import { useTabBarScroll } from '../hooks/useTabBarScroll';
import { formatDate } from '../utils/dateUtils';
import { format } from 'date-fns';
import { getGreeting } from '../utils/dateUtils';
import BottomTaskbar from '../components/BottomTaskbar';

const DashboardScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const [userData, setUserData] = useState(null);
  const [todayStats, setTodayStats] = useState({
    burned: 0,
    consumed: 0,
    remaining: 0,
    steps: 0,
    water: 0,
  });
  const [loading, setLoading] = useState(true);
  const { selectedDate, setSelectedDate, meals, totalCalories, totalMacros } = useMeals();
  const { scrollViewRef, handleScroll } = useTabBarScroll();
  const lastFocusTime = useRef(0);

  const formattedDate = selectedDate ? formatDate(selectedDate) : '';

  // Load user data once on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await mockAuth.getCurrentUser();
        setUserData(user);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserData();
  }, []);

  // Load workout and water stats
  const loadTodayStats = useCallback(async () => {
    try {
      setLoading(true);
      const workoutStats = await workoutTrackingService.getTodayWorkoutStats();
      const waterIntake = await mockWaterService.getTodayWaterIntake();
      
      setTodayStats({
        burned: workoutStats.totalCaloriesBurned,
        waterIntake
      });
    } catch (error) {
      console.error('Error loading today stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update stats and refresh meal data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      // Prevent multiple updates within 100ms instead of 300ms for more responsive updates
      if (now - lastFocusTime.current < 100) {
        return;
      }
      lastFocusTime.current = now;

      // Load today's stats
      loadTodayStats();

      // Reset to current date if no date is selected
      if (!selectedDate) {
        setSelectedDate(getStartOfDay(new Date()));
      }
    }, [loadTodayStats, selectedDate, setSelectedDate])
  );

  const handleDateChange = useCallback((newDate: Date) => {
    setSelectedDate(getStartOfDay(newDate));
  }, [setSelectedDate]);

  const handleAddMeal = () => {
    navigation.navigate('TrackMeal');
  };

  const calculateBMI = (weight?: number, height?: number) => {
    if (!weight || !height) return 0;
    // Convert height from cm to meters
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text color="$gray12">Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      <Header />

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.content}>
          {/* Calorie Tracker Card */}
          <CalorieTrackerCard
            targetCalories={userData?.calorieGoal || 2500}
            date={selectedDate}
            onDateChange={handleDateChange}
            currentCalories={totalCalories}
            macros={totalMacros}
          />
          
          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={[styles.statCard, { 
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              borderWidth: 1,
            }]}>
              <View style={[styles.iconContainer, { 
                backgroundColor: isDarkMode ? 'rgba(78, 205, 196, 0.2)' : '#4ECDC420' 
              }]}>
                <Ionicons name="water-outline" size={24} color="#4ECDC4" />
              </View>
              <Text color={colors.text} fontSize={18} fontWeight="bold" marginBottom={4}>
                {todayStats.waterIntake}ml
              </Text>
              <Text color={colors.textSecondary} fontSize={14}>
                Water
              </Text>
            </View>

            <View style={[styles.statCard, { 
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              borderWidth: 1,
            }]}>
              <View style={[styles.iconContainer, {
                backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.2)' : '#6366F120'
              }]}>
                <Ionicons name="body-outline" size={24} color="#6366F1" />
              </View>
              <Text color={colors.text} fontSize={18} fontWeight="bold" marginBottom={4}>
                {calculateBMI(userData?.weight, userData?.height).toFixed(1)}
              </Text>
              <Text color={colors.textSecondary} fontSize={14}>
                BMI
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.statCard, { 
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderWidth: 1,
              }]}
              onPress={handleAddMeal}
            >
              <View style={[styles.iconContainer, {
                backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#EF444420'
              }]}>
                <Ionicons name="scan-outline" size={24} color="#EF4444" />
              </View>
              <Text color={colors.textSecondary} fontSize={14}>
                Scan
              </Text>
              <Text color={colors.textSecondary} fontSize={14}>
                Food
              </Text>
            </TouchableOpacity>
          </View>

          {/* Shortcut Buttons */}
          <View style={styles.shortcutContainer}>
            <TouchableOpacity
              style={[styles.shortcutButton, { backgroundColor: colors.cardBackground }]}
              onPress={() => navigation.navigate('FoodLog')}
            >
              <View style={[styles.shortcutIcon, { backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.1)' : '#6366F110' }]}>
                <Ionicons name="restaurant-outline" size={24} color="#6366F1" />
              </View>
              <Text color={colors.text} fontSize={14} fontWeight="600">Food Log</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shortcutButton, { backgroundColor: colors.cardBackground }]}
              onPress={() => navigation.navigate('Progress')}
            >
              <View style={[styles.shortcutIcon, { backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.1)' : '#6366F110' }]}>
                <Ionicons name="trending-up-outline" size={24} color="#6366F1" />
              </View>
              <Text color={colors.text} fontSize={14} fontWeight="600">Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shortcutButton, { backgroundColor: colors.cardBackground }]}
              onPress={() => navigation.navigate('Workouts')}
            >
              <View style={[styles.shortcutIcon, { backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.1)' : '#6366F110' }]}>
                <Ionicons name="fitness-outline" size={24} color="#6366F1" />
              </View>
              <Text color={colors.text} fontSize={14} fontWeight="600">Workouts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shortcutButton, { backgroundColor: colors.cardBackground }]}
              onPress={() => navigation.navigate('Settings')}
            >
              <View style={[styles.shortcutIcon, { backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.1)' : '#6366F110' }]}>
                <Ionicons name="settings-outline" size={24} color="#6366F1" />
              </View>
              <Text color={colors.text} fontSize={14} fontWeight="600">Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <BottomTaskbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    padding: 20,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    padding: 15,
    borderRadius: 16,
    marginHorizontal: 5,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  scanCard: {
    borderWidth: 0,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  shortcutContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  shortcutButton: {
    width: '47%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 12,
  },
  shortcutIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  }
});

export default DashboardScreen;
