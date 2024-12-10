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
import { useTheme } from '../theme/ThemeProvider';
import { getStartOfDay } from '../utils/dateUtils';
import { useMeals } from '../contexts/MealContext';
import { useTabBarScroll } from '../hooks/useTabBarScroll';
import { formatDate } from '../utils/dateUtils';
import { format } from 'date-fns';
import { getGreeting } from '../utils/dateUtils';

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
        <Text style={styles.loadingText}>Loading...</Text>
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
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.greeting, { color: colors.text }]}>
          {getGreeting()}, {userData?.name || 'User'}
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {format(new Date(), 'EEEE, MMMM d')}
        </Text>
      </View>

      {/* Content */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
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
              <Text style={[styles.statValue, { color: colors.text }]}>
                {todayStats.waterIntake}ml
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Water
              </Text>
            </View>

            <View style={[styles.statCard, { 
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              borderWidth: 1,
            }]}>
              <View style={[styles.iconContainer, { 
                backgroundColor: isDarkMode ? 'rgba(255, 178, 54, 0.2)' : '#FFB23620' 
              }]}>
                <Ionicons name="body-outline" size={24} color="#FFB236" />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {calculateBMI(userData?.weight, userData?.height).toFixed(1)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                BMI
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.statCard, styles.scanCard, { 
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderWidth: 1,
              }]}
              onPress={() => navigation.navigate('FoodScanner')}
            >
              <View style={[styles.iconContainer, { 
                backgroundColor: isDarkMode ? 'rgba(255, 107, 107, 0.2)' : '#FF6B6B20' 
              }]}>
                <Ionicons name="scan-outline" size={24} color="#FF6B6B" />
              </View>
              <Text style={[styles.statValue, { color: '#FF6B6B' }]}>Scan</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Food
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight + 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
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
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
});

export default DashboardScreen;
