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
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  useSharedValue,
  interpolate,
} from 'react-native-reanimated';
import Card from '../components/Card';
import Button from '../components/Button';
import CalorieTrackerCard from '../components/CalorieTrackerCard';
import { mockAuth, mockWaterService, mockWorkoutService } from '../services/mockData';
import { workoutTrackingService } from '../services/workoutTrackingService';
import { useTheme } from '../theme/ThemeProvider';
import { getStartOfDay } from '../utils/dateUtils';
import { useMeals } from '../contexts/MealContext';
import { useTabBarScroll } from '../hooks/useTabBarScroll';
import { formatDate } from '../utils/dateUtils';
import { getGreeting } from '../utils/dateUtils';
import BottomTaskbar from '../components/BottomTaskbar';
import SimpleFoodLogSection from '../components/SimpleFoodLogSection';

interface TodayStats {
  burned: number;
  consumed: number;
  remaining: number;
  steps: number;
  water: number;
  waterIntake?: number;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface ShortcutButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  delay?: number;
  isLocked?: boolean;
  style?: any;
  isDarkMode: boolean;
}

const ShortcutButton: React.FC<ShortcutButtonProps> = ({ 
  icon, 
  label, 
  onPress, 
  delay = 0, 
  isLocked = true,
  style,
  isDarkMode
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const pressed = useSharedValue(1);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withSpring(1, {
        damping: 12,
        stiffness: 100,
      })
    );
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 500 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pressed.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    pressed.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    pressed.value = withSpring(1);
  };

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { 
        scale: interpolate(
          pressed.value,
          [0.95, 1],
          [0.9, 1]
        )
      }
    ],
  }));

  return (
    <AnimatedTouchableOpacity
      style={[styles.shortcutButton, style, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View 
        style={[
          styles.shortcutIcon, 
          { backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.1)' : '#6366F110' },
          iconStyle
        ]}
      >
        <View style={styles.iconWrapper}>
          <Ionicons name={icon} size={24} color="#6366F1" />
          {isLocked && (
            <Animated.View style={[styles.lockIconContainer, iconStyle]}>
              <Ionicons 
                name="lock-closed" 
                size={14} 
                color="#6366F1" 
                style={styles.lockIcon} 
              />
            </Animated.View>
          )}
        </View>
      </Animated.View>
      <Text color={colors.text} fontSize={14} fontWeight="600">{label}</Text>
    </AnimatedTouchableOpacity>
  );
};

const DashboardScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const [userData, setUserData] = useState(null);
  const [todayStats, setTodayStats] = useState<TodayStats>({
    burned: 0,
    consumed: 0,
    remaining: 0,
    steps: 0,
    water: 0,
    waterIntake: 0,
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

  const handleScanFood = () => {
    navigation.navigate('ScanFood');
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
            <ShortcutButton
              icon="restaurant-outline"
              label="Food Log"
              onPress={() => Alert.alert("Coming Soon!", "Something is cooking! This feature will be available in future updates.")}
              delay={100}
              isDarkMode={isDarkMode}
              style={{ 
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderWidth: 1,
              }}
            />

            <ShortcutButton
              icon="trending-up-outline"
              label="Progress"
              onPress={() => Alert.alert("Coming Soon!", "Something is cooking! This feature will be available in future updates.")}
              delay={200}
              isDarkMode={isDarkMode}
              style={{ 
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderWidth: 1,
              }}
            />

            <ShortcutButton
              icon="fitness-outline"
              label="Workouts"
              onPress={() => Alert.alert("Coming Soon!", "Something is cooking! This feature will be available in future updates.")}
              delay={300}
              isDarkMode={isDarkMode}
              style={{ 
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderWidth: 1,
              }}
            />

            <ShortcutButton
              icon="person-outline"
              label="Profile"
              onPress={() => navigation.navigate('Profile')}
              delay={400}
              isLocked={false}
              isDarkMode={isDarkMode}
              style={{ 
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderWidth: 1,
              }}
            />
          </View>

          {/* Simple Food Log Section */}
          <SimpleFoodLogSection 
            onScanFood={handleScanFood}
          />
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
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
    marginTop: 16,
    gap: 8,
  },
  shortcutButton: {
    width: '31%',
    padding: 12,
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
    marginBottom: 8,
  },
  shortcutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIconContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'transparent',
  },
  lockIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
});

export default DashboardScreen;
