import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Platform,
  PanResponder,
  useColorScheme,
} from 'react-native';
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
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
  withDelay,
} from 'react-native-reanimated';
import { useScrollToTabBar } from '../hooks/useScrollToTabBar';
import { useMeals } from '../contexts/MealContext';
import { useWorkoutTracking } from '../hooks/useWorkoutTracking';
import { formatDate, getStartOfDay, isSameDay } from '../utils/dateUtils';

const DashboardScreen = ({ navigation }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [userData, setUserData] = useState(null);
  const [todayStats, setTodayStats] = useState({
    burned: 0,
    waterIntake: 0
  });
  const [loading, setLoading] = useState(true);
  const { selectedDate, setSelectedDate, meals, totalCalories, totalMacros } = useMeals();
  const { handleScroll } = useScrollToTabBar();
  const lastFocusTime = useRef(0);

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
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={isDarkMode ? [colors.background.dark, colors.background.dark] : [colors.background.light, colors.background.light]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.6 }}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Main Scrollable Content */}
      <Animated.ScrollView 
        style={[
          styles.scrollView, 
          { 
            backgroundColor: isDarkMode ? colors.background.dark : colors.background.light 
          }
        ]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={true}
        nestedScrollEnabled={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }]}>
            Hello{userData?.name ? `, ${userData.name}` : ''}
          </Text>
          <Text style={[styles.date, { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }]}>
            {formatDate(new Date(), 'EEEE, MMM d')}
          </Text>
        </View>
        
        {/* Content Sections */}
        <View style={styles.content}>
          <CalorieTrackerCard
            targetCalories={userData?.calorieGoal || 2500}
            date={selectedDate}
            onDateChange={handleDateChange}
            currentCalories={totalCalories}
            macros={totalMacros}
          />
          
          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.statCard}>
              <View style={styles.iconContainer}>
                <Ionicons name="water-outline" size={24} color="#4ECDC4" />
              </View>
              <Text style={styles.statValue}>{todayStats.waterIntake}ml</Text>
              <Text style={styles.statLabel}>Water</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.iconContainer}>
                <Ionicons name="body-outline" size={24} color="#FFB236" />
              </View>
              <Text style={styles.statValue}>{calculateBMI(userData?.weight, userData?.height).toFixed(1)}</Text>
              <Text style={styles.statLabel}>BMI</Text>
            </View>
            <TouchableOpacity 
              style={[styles.statCard, styles.scanCard]}
              onPress={() => navigation.navigate('FoodScanner')}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#FF6B6B20' }]}>
                <Ionicons name="scan-outline" size={24} color="#FF6B6B" />
              </View>
              <Text style={[styles.statValue, { color: '#FF6B6B' }]}>Scan</Text>
              <Text style={styles.statLabel}>Food</Text>
            </TouchableOpacity>
          </View>
          
          {/* Meals List */}
          <View style={styles.mealsList}>
            {Object.entries(meals || {}).map(([type, mealList]) => (
              mealList.map((meal, index) => (
                <TouchableOpacity
                  key={`${type}-${index}`}
                  style={styles.mealCard}
                  onPress={() => navigation.navigate('MealDetails', { mealId: meal.id })}
                >
                  <View style={styles.mealInfo}>
                    <Text style={[styles.mealType, { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }]}>
                      {meal.name || type}
                    </Text>
                    <Text style={[styles.mealCalories, { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }]}>
                      {meal.calories} kcal
                    </Text>
                  </View>
                  <Ionicons 
                    name="chevron-forward-outline" 
                    size={20} 
                    color={isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light} 
                  />
                </TouchableOpacity>
              ))
            ))}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: spacing.medium,
    marginBottom: spacing.medium,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '600',
  },
  date: {
    fontSize: 16,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.medium,
    marginBottom: spacing.medium,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.card.light,
    borderRadius: borderRadius.medium,
    padding: spacing.medium,
    marginHorizontal: spacing.tiny,
    alignItems: 'center',
  },
  scanCard: {
    backgroundColor: '#FF6B6B10',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4ECDC420',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary.light,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.text.secondary.light,
  },
  mealsList: {
    paddingHorizontal: spacing.medium,
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.card.light,
    borderRadius: borderRadius.medium,
    padding: spacing.medium,
    marginBottom: spacing.small,
  },
  mealInfo: {
    flex: 1,
  },
  mealType: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  mealCalories: {
    fontSize: 14,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.primary.light,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default DashboardScreen;
