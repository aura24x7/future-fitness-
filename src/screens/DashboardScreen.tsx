import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'tamagui';
import { Header } from '../components/Header';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { firebaseCore } from '../services/firebase/firebaseCore';
import { useTheme } from '../theme/ThemeProvider';
import { useMeals } from '../contexts/MealContext';
import { useTabBarScroll } from '../hooks/useTabBarScroll';
import { formatDate, getStartOfDay, getGreeting } from '../utils/dateUtils';
import { dataMigrationService } from '../utils/dataMigration';
import CalorieTrackerCard from '../components/CalorieTrackerCard';
import BottomTaskbar from '../components/BottomTaskbar';
import SimpleFoodLogSection from '../components/SimpleFoodLogSection';
import { waterService } from '../services/waterService';
import { workoutService } from '../services/workoutService';
import MigrationStatusModal from '../components/MigrationStatusModal';
import { logger } from '../utils/logger';
import { useProfile } from '../contexts/ProfileContext';
import { calculateMacroDistribution } from '../utils/profileCalculations';
import { RootStackParamList } from '../types/navigation';
import EventEmitter from '../utils/EventEmitter';

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

  // Define loadTodayStats before using it
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
      setLoading(false);
    } catch (error: any) {
      console.error('Error loading stats:', error);
      if (error?.message !== 'User not authenticated') {
        Alert.alert('Error', 'Failed to load today\'s stats');
      }
      setLoading(false);
    }
  }, [isAuthReady, userData, totalCalories, profile?.metrics?.recommendedCalories]);

  // Add meal update listener
  useEffect(() => {
    const unsubscribe = EventEmitter.addListener('meals_updated', () => {
      loadTodayStats();
    });

    return () => {
      unsubscribe();
    };
  }, [loadTodayStats]);

  // Add auth state listener
  useEffect(() => {
    authStateUnsubscribe.current = firebaseCore.onAuthStateChanged((user) => {
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

  const handleScanFood = () => {
    navigation.navigate('ScanFood');
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

          {/* Migration Status Modal */}
          <MigrationStatusModal
            visible={migrationStatus.visible}
            status={migrationStatus.status}
            onClose={() => setMigrationStatus(prev => ({ ...prev, visible: false }))}
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 16,
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
