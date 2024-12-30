import React, { useEffect, useRef, useState, useCallback } from 'react';
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  useSharedValue,
  interpolate,
} from 'react-native-reanimated';
import { auth } from '../config/firebase';
import { useTheme } from '../theme/ThemeProvider';
import { useMeals } from '../contexts/MealContext';
import { useTabBarScroll } from '../hooks/useTabBarScroll';
import { formatDate, getStartOfDay, getGreeting } from '../utils/dateUtils';
import { dataMigrationService } from '../utils/dataMigration';
import Card from '../components/Card';
import Button from '../components/Button';
import CalorieTrackerCard from '../components/CalorieTrackerCard';
import BottomTaskbar from '../components/BottomTaskbar';
import SimpleFoodLogSection from '../components/SimpleFoodLogSection';
import { waterService } from '../services/waterService';
import { workoutService } from '../services/workoutService';
import MigrationStatusModal from '../components/MigrationStatusModal';
import { logger } from '../utils/logger';
import { useProfile } from '../context/ProfileContext';
import { calculateMacroDistribution } from '../utils/profileCalculations';
import { RootStackParamList } from '../types/navigation';

type DashboardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

interface Props {
  navigation: DashboardScreenNavigationProp;
}

interface TodayStats {
  burned: number;
  consumed: number;
  remaining: number;
  steps: number;
  water: number;
  waterIntake?: number;
}

interface UserData {
  id: string;
  name: string;
  email: string;
}

interface ShortcutButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  delay?: number;
  isLocked?: boolean;
  style?: any;
  isDarkMode: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

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

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const { profile } = useProfile();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [todayStats, setTodayStats] = useState<TodayStats>({
    burned: 0,
    consumed: 0,
    remaining: 0,
    steps: 0,
    water: 0,
    waterIntake: 0,
  });
  const [loading, setLoading] = useState(true);
  const [migrationStatus, setMigrationStatus] = useState<{
    visible: boolean;
    status: {
      phase: 'backup' | 'water' | 'workout' | 'complete' | 'error';
      message: string;
      error?: string;
      progress?: number;
    };
  }>({
    visible: false,
    status: {
      phase: 'backup',
      message: 'Preparing migration...',
    },
  });
  const { selectedDate, setSelectedDate, meals, totalCalories, totalMacros } = useMeals();
  const { scrollViewRef, handleScroll } = useTabBarScroll();
  const lastFocusTime = useRef(0);
  const authStateUnsubscribe = useRef<(() => void) | null>(null);

  // Add auth state listener
  useEffect(() => {
    authStateUnsubscribe.current = auth.onAuthStateChanged((user) => {
      setIsAuthReady(true);
      if (user) {
        const userData: UserData = {
          id: user.uid,
          name: user.displayName || 'User',
          email: user.email || '',
        };
        setUserData(userData);
      } else {
        setUserData(null);
      }
    });

    return () => {
      if (authStateUnsubscribe.current) {
        authStateUnsubscribe.current();
      }
    };
  }, []);

  // Modify loadTodayStats to check auth
  const loadTodayStats = useCallback(async () => {
    if (!isAuthReady || !userData) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [waterIntake, workoutStats] = await Promise.all([
        waterService.getTodayWater(),
        workoutService.getTodayWorkoutStats()
      ]);

      const recommendedCalories = profile?.metrics?.recommendedCalories || 2000;

      setTodayStats({
        burned: workoutStats.totalCaloriesBurned,
        consumed: totalCalories || 0,
        remaining: recommendedCalories - (totalCalories || 0),
        steps: 0,
        water: waterIntake,
        waterIntake,
      });
    } catch (error: any) {
      console.error('Error loading stats:', error);
      // Don't show alert for auth errors
      if (error?.message !== 'User not authenticated') {
        Alert.alert('Error', 'Failed to load today\'s stats');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthReady, userData, totalCalories, profile?.metrics?.recommendedCalories]);

  // Modify useFocusEffect to check auth
  useFocusEffect(
    useCallback(() => {
      if (!isAuthReady) return;

      const now = Date.now();
      if (now - lastFocusTime.current < 100) {
        return;
      }
      lastFocusTime.current = now;

      if (!selectedDate) {
        setSelectedDate(getStartOfDay(new Date()));
      }

      loadTodayStats();
    }, [isAuthReady, loadTodayStats, selectedDate, setSelectedDate])
  );

  const handleDateChange = useCallback((newDate: Date) => {
    setSelectedDate(getStartOfDay(newDate));
  }, [setSelectedDate]);

  const handleAddMeal = () => {
    navigation.navigate('TrackMeal', undefined);
  };

  const handleScanFood = () => {
    navigation.navigate('ScanFood', undefined);
  };

  const handleProfileNavigation = () => {
    navigation.navigate('Profile', undefined);
  };

  const calculateBMI = (weight?: number, height?: number) => {
    if (!weight || !height) return 0;
    // Convert height from cm to meters
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  // Calculate recommended macros based on profile data
  const recommendedMacros = React.useMemo(() => {
    if (profile?.metrics?.recommendedCalories) {
      return calculateMacroDistribution(
        profile.metrics.recommendedCalories,
        profile?.weightGoal || 'MAINTAIN_WEIGHT'
      );
    }
    return {
      proteins: 0,
      carbs: 0,
      fats: 0
    };
  }, [profile?.metrics?.recommendedCalories, profile?.weightGoal]);

  // Show loading state while auth is initializing
  if (!isAuthReady) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
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
            targetCalories={profile?.metrics?.recommendedCalories || 0}
            date={selectedDate}
            onDateChange={handleDateChange}
            currentCalories={totalCalories}
            macros={totalMacros}
            recommendedMacros={recommendedMacros}
          />

          {/* Simple Food Log Section */}
          <SimpleFoodLogSection
            onScanFood={handleScanFood}
          />

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
              onPress={handleProfileNavigation}
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
        </View>
      </ScrollView>
      <MigrationStatusModal
        visible={migrationStatus.visible}
        status={migrationStatus.status}
      />
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
