import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, CircleProps } from 'react-native-svg';
import { format, addDays, startOfWeek } from 'date-fns';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card } from './common/Card';
import { ProgressBar } from './common/ProgressBar';
import { useTheme } from '../theme';
import { analyticsService } from '../services/analyticsService';

// Professional Color Palette
const COLORS = {
  primary: '#6366F1', // Indigo primary
  secondary: '#F8FAFC', // Light background
  consumed: '#FF6B6B', // Warm red for calories consumed
  burned: '#4ADE80', // Energetic green for calories burned
  water: '#60A5FA', // Fresh blue for water intake
  text: {
    primary: '#1E293B', // Slate 800
    secondary: '#64748B', // Slate 500
    light: '#94A3B8', // Slate 400
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F1F5F9', // Slate 100
    accent: '#E2E8F0', // Slate 200
  }
};

interface CalorieGoalsProps {
  onUpdate?: () => void;
}

interface CalorieStats {
  caloriesConsumed: number;
  caloriesBurned: number;
  waterIntake: number;
  dailyCalorieGoal: number;
  dailyWaterGoal: number;
}

export const CalorieGoals: React.FC<CalorieGoalsProps> = ({ onUpdate }) => {
  const theme = useTheme();
  const [stats, setStats] = useState<CalorieStats>({
    caloriesConsumed: 0,
    caloriesBurned: 0,
    waterIntake: 0,
    dailyCalorieGoal: 2000, // Default value
    dailyWaterGoal: 2000, // Default value in ml
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCalorieStats();
  }, []);

  const loadCalorieStats = async () => {
    try {
      setIsLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get today's data from analytics service
      const dailyTotals = await analyticsService.getDailyTotals(today);
      
      if (dailyTotals) {
        setStats({
          caloriesConsumed: dailyTotals.calories || 0,
          caloriesBurned: dailyTotals.caloriesBurned || 0,
          waterIntake: dailyTotals.waterIntake || 0,
          dailyCalorieGoal: dailyTotals.dailyCalorieGoal || 2000,
          dailyWaterGoal: dailyTotals.dailyWaterGoal || 2000,
        });
      }
    } catch (error) {
      console.error('[CalorieGoals] Error loading calorie stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const {
    caloriesConsumed,
    caloriesBurned,
    waterIntake,
    dailyCalorieGoal,
    dailyWaterGoal,
  } = stats;

  const calorieProgress = Math.min((caloriesConsumed / dailyCalorieGoal) * 100, 100);
  const waterProgress = Math.min((waterIntake / dailyWaterGoal) * 100, 100);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <Card style={styles.container}>
      <View style={styles.section}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Calories
        </Text>
        <ProgressBar
          progress={calorieProgress}
          color={theme.colors.primary}
          style={styles.progressBar}
        />
        <View style={styles.statsRow}>
          <Text style={[styles.stat, { color: theme.colors.text }]}>
            {caloriesConsumed} / {dailyCalorieGoal} kcal
          </Text>
          <Text style={[styles.burnedText, { color: theme.colors.success }]}>
            -{caloriesBurned} kcal burned
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Water Intake
        </Text>
        <ProgressBar
          progress={waterProgress}
          color={theme.colors.info}
          style={styles.progressBar}
        />
        <Text style={[styles.stat, { color: theme.colors.text }]}>
          {waterIntake} / {dailyWaterGoal} ml
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBar: {
    marginVertical: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stat: {
    fontSize: 14,
  },
  burnedText: {
    fontSize: 14,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
});
