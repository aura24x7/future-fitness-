import React, { useEffect, useState, useCallback } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../components/Card';
import Button from '../components/Button';
import CalorieTracker from '../components/calorie/CalorieTracker';
import { mockAuth, mockWaterService, mockWorkoutService } from '../services/mockData';
import { workoutTrackingService } from '../services/workoutTrackingService';
import { MealLog, CalorieGoal, CalorieStats, MealType, WorkoutLog } from '../types/calorie';
import { colors, shadows, spacing, borderRadius } from '../theme/colors';
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

const MEALS_STORAGE_KEY = '@meals';
const getStorageKeyForDate = (date: Date) => `${MEALS_STORAGE_KEY}_${date.toISOString().split('T')[0]}`;

const DashboardScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [todayStats, setTodayStats] = useState<CalorieStats>({
    consumed: 0,
    burned: 0,
    remaining: 2000,
    macros: {
      proteins: 0,
      carbs: 0,
      fats: 0,
    },
  });

  const [calorieGoal] = useState<CalorieGoal>({
    daily: 2000,
    macros: {
      proteins: 150,
      carbs: 250,
      fats: 70,
    },
  });

  const [recentMeals, setRecentMeals] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);

  const calculateTotalStats = useCallback((meals: { [key: string]: MealLog[] }) => {
    let totalCalories = 0;
    let totalProteins = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    
    // Calculate totals from completed meals only
    Object.values(meals).forEach(mealArray => {
      mealArray.forEach(meal => {
        if (meal.completed) {
          totalCalories += meal.calories || 0;
          totalProteins += meal.protein || 0;
          totalCarbs += meal.carbs || 0;
          totalFats += meal.fat || 0;
        }
      });
    });

    return {
      calories: totalCalories,
      macros: {
        proteins: totalProteins,
        carbs: totalCarbs,
        fats: totalFats,
      }
    };
  }, []);

  const loadTodayStats = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date();
      const storageKey = getStorageKeyForDate(today);
      
      // Load meals from AsyncStorage
      const savedMealsStr = await AsyncStorage.getItem(storageKey);
      const savedMeals = savedMealsStr ? JSON.parse(savedMealsStr) : {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: []
      };

      // Calculate totals
      const stats = calculateTotalStats(savedMeals);
      
      // Load workout stats
      const workoutStats = await workoutTrackingService.getTodayWorkoutStats();

      // Update today's stats
      setTodayStats({
        consumed: stats.calories,
        burned: workoutStats.totalCaloriesBurned,
        remaining: calorieGoal.daily - stats.calories + workoutStats.totalCaloriesBurned,
        macros: stats.macros,
      });

      // Create recent meals list
      const allMeals = Object.values(savedMeals)
        .flat()
        .map((meal: MealLog) => ({
          id: meal.id || undefined,
          name: meal.name || '',
          calories: meal.calories || 0,
          protein: meal.protein || 0,
          carbs: meal.carbs || 0,
          fat: meal.fat || 0,
          completed: meal.completed || false,
          mealType: meal.mealType || MealType.Snack
        }));
      setRecentMeals(allMeals);

    } catch (error) {
      console.error('Error loading today stats:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [calorieGoal.daily, calculateTotalStats]);

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

  // Update stats when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTodayStats();
    }, [loadTodayStats])
  );

  const { handleScroll } = useScrollToTabBar();

  // Define the allowed icon names type
  type IoniconName = 
    | 'restaurant-outline' 
    | 'water-outline' 
    | 'fitness-outline'
    | 'person';

  const quickActions: Array<{
    id: string;
    title: string;
    icon: IoniconName;
    gradient: [string, string];
    onPress: () => void;
  }> = [
    {
      id: 'meal-log',
      title: 'Log Meal',
      icon: 'restaurant-outline',
      gradient: ['#FF6B6B', '#4ECDC4'],
      onPress: () => navigation.navigate('FoodLog'),
    },
    {
      id: 'water-intake',
      title: 'Water Intake',
      icon: 'water-outline',
      gradient: ['#5F27CD', '#48DBFB'],
      onPress: () => navigation.navigate('WaterIntake'),
    },
    {
      id: 'workout',
      title: 'Start Workout',
      icon: 'fitness-outline',
      gradient: ['#FF9FF3', '#54A0FF'],
      onPress: () => navigation.navigate('Workout'),
    },
  ];

  const handleAddMeal = () => {
    navigation.navigate('TrackMeal');
  };

  const handleMealPress = (meal: MealLog) => {
    Alert.alert(
      'Meal Details',
      `${meal.name}\n\nCalories: ${meal.calories}\nProtein: ${meal.protein}g\nCarbs: ${meal.carbs}g\nFats: ${meal.fat}g`,
      [
        { text: 'Edit', onPress: () => navigation.navigate('TrackMeal') },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  const pulse1 = useSharedValue(1.1);
  const pulse2 = useSharedValue(1.2);
  const opacity1 = useSharedValue(0.2);
  const opacity2 = useSharedValue(0.2);

  React.useEffect(() => {
    // Start pulsing animations
    pulse1.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1.1, { duration: 1000 })
      ),
      -1,
      true
    );
    opacity1.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 1000 }),
        withTiming(0.1, { duration: 1000 })
      ),
      -1,
      true
    );

    // Slightly delayed second pulse
    pulse2.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(1.3, { duration: 1000 }),
          withTiming(1.2, { duration: 1000 })
        ),
        -1,
        true
      )
    );
    opacity2.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(0.25, { duration: 1000 }),
          withTiming(0.05, { duration: 1000 })
        ),
        -1,
        true
      )
    );
  }, []);

  const pulseStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: pulse1.value }],
    opacity: opacity1.value,
  }));

  const pulseStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: pulse2.value }],
    opacity: opacity2.value,
  }));

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#4F46E5', '#6366F1', '#818CF8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.6 }}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Main Scrollable Content */}
      <Animated.ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={true}
      >
        {/* Floating Header */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={['rgba(79, 70, 229, 0.9)', 'rgba(99, 102, 241, 0.9)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.userName}>{userData?.name || 'User'}</Text>
              </View>
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => navigation.navigate('Profile')}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                  style={styles.profileGradient}
                >
                  <Ionicons name="person" size={22} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Content Sections */}
        <View style={styles.mainContent}>
          {/* Calorie Tracker Card */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Today's Overview</Text>
            <View style={styles.trackerContainer}>
              <CalorieTracker
                stats={todayStats}
                goal={calorieGoal}
                recentMeals={recentMeals}
                onAddMeal={handleAddMeal}
                onMealPress={handleMealPress}
              />
            </View>
          </View>

          {/* Quick Actions Grid */}
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  onPress={action.onPress}
                  style={styles.quickActionButton}
                >
                  <LinearGradient
                    colors={action.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[StyleSheet.absoluteFill, styles.quickActionGradient]}
                  />
                  <View style={styles.quickActionContent}>
                    <Ionicons name={action.icon} size={24} color="#FFF" style={styles.quickActionIcon} />
                    <Text style={styles.quickActionTitle}>{action.title}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      {/* AI Food Scanner Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('FoodScanner')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#6366f1', '#818cf8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <View style={styles.fabContent}>
              <Ionicons name="scan-circle" size={24} color="#fff" />
              <View style={styles.fabTextContainer}>
                <Text style={styles.fabText}>AI Food</Text>
                <Text style={styles.fabText}>Scanner</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
        
        {/* Pulsing Effect */}
        <Animated.View style={[styles.pulseCircle, pulseStyle1]} />
        <Animated.View style={[styles.pulseCircle, pulseStyle2]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  headerContainer: {
    paddingTop: StatusBar.currentHeight || 0,
    marginBottom: 8,
  },
  headerGradient: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    marginHorizontal: 12,
    ...(Platform.OS === 'ios' 
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        }
      : {
          elevation: 4,
        }),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        }
      : {
          elevation: 3,
        }),
  },
  profileGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContent: {
    paddingHorizontal: 16,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  trackerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        }
      : {
          elevation: 6,
        }),
  },
  quickActionsSection: {
    marginTop: 8,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  quickActionButton: {
    width: '48%',
    aspectRatio: 1.5,
    margin: '1%',
    borderRadius: 16,
    overflow: 'hidden',
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.2,
          shadowRadius: 6,
        }
      : {
          elevation: 4,
        }),
  },
  quickActionGradient: {
    borderRadius: 16,
  },
  quickActionContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  quickActionIcon: {
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  loadingText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 2,
  },
  fabGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fabTextContainer: {
    marginLeft: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'left',
    lineHeight: 14,
  },
  pulseCircle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: '#6366f1',
    opacity: 0.2,
    zIndex: 1,
  },
  pulse1: {
    transform: [{ scale: 1.1 }],
  },
  pulse2: {
    transform: [{ scale: 1.2 }],
  },
});

export default DashboardScreen;
