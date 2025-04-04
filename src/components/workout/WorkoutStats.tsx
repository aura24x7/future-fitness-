import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Card, YStack, XStack, Progress } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { exerciseProgressService } from '../../services/exerciseProgressService';
import { startOfWeek, endOfWeek, format, isToday } from 'date-fns';
import { useTheme } from '../../theme/ThemeProvider';

interface WorkoutStatsProps {
  date?: Date;
  showWeeklyProgress?: boolean;
  showDailyStats?: boolean;
}

interface WeeklyStats {
  totalWorkouts: number;
  totalCalories: number;
  totalDuration: number;
  completionRate: number;
}

interface DailyStats {
  totalCalories: number;
  totalDuration: number;
  workoutsCount: number;
}

const WorkoutStats: React.FC<WorkoutStatsProps> = ({
  date = new Date(),
  showWeeklyProgress = true,
  showDailyStats = true,
}) => {
  const { colors, isDarkMode } = useTheme();
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [isLoadingWeekly, setIsLoadingWeekly] = useState(false);
  const [isLoadingDaily, setIsLoadingDaily] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (showWeeklyProgress) {
      loadWeeklyStats();
    }
    
    if (showDailyStats) {
      loadDailyStats();
    }
  }, [date, showWeeklyProgress, showDailyStats]);

  const loadWeeklyStats = async () => {
    try {
      setIsLoadingWeekly(true);
      setError(null);
      
      const start = startOfWeek(date, { weekStartsOn: 1 }); // Start on Monday
      const end = endOfWeek(date, { weekStartsOn: 1 });
      const stats = await exerciseProgressService.getWeeklyStats(start, end);
      
      setWeeklyStats({
        totalWorkouts: stats.totalWorkouts,
        totalCalories: stats.totalCalories,
        totalDuration: stats.totalDuration,
        completionRate: stats.completionRate,
      });
    } catch (err) {
      setError('Failed to load weekly stats');
      console.error(err);
    } finally {
      setIsLoadingWeekly(false);
    }
  };

  const loadDailyStats = async () => {
    try {
      setIsLoadingDaily(true);
      setError(null);
      
      const stats = await exerciseProgressService.getDailyStats(date);
      
      setDailyStats({
        totalCalories: stats.totalCalories,
        totalDuration: stats.totalDuration,
        workoutsCount: stats.workouts.length,
      });
    } catch (err) {
      setError('Failed to load daily stats');
      console.error(err);
    } finally {
      setIsLoadingDaily(false);
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={24} color="#EF4444" />
        <Text color="#EF4444">{error}</Text>
      </View>
    );
  }

  return (
    <YStack space="$4">
      {showWeeklyProgress && (
        <Card
          bordered
          style={{
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
          }}
        >
          <Card.Header>
            <Text fontSize={18} fontWeight="bold" color={colors.text}>
              Weekly Progress
            </Text>
            <Text fontSize={14} color={colors.textSecondary}>
              {format(startOfWeek(date, { weekStartsOn: 1 }), 'MMM d')} - {format(endOfWeek(date, { weekStartsOn: 1 }), 'MMM d, yyyy')}
            </Text>
          </Card.Header>

          {isLoadingWeekly ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : weeklyStats ? (
            <Card.Footer>
              <YStack space="$3" width="100%">
                <XStack justifyContent="space-between">
                  <StatItem
                    icon="barbell-outline"
                    value={weeklyStats.totalWorkouts.toString()}
                    label="Workouts"
                    color={colors.primary}
                  />
                  <StatItem
                    icon="time-outline"
                    value={formatDuration(weeklyStats.totalDuration)}
                    label="Duration"
                    color="#3B82F6"
                  />
                  <StatItem
                    icon="flame-outline"
                    value={`${weeklyStats.totalCalories}`}
                    label="Calories"
                    color="#F59E0B"
                  />
                </XStack>

                <YStack space="$1">
                  <XStack justifyContent="space-between">
                    <Text fontSize={14} color={colors.textSecondary}>
                      Completion Rate
                    </Text>
                    <Text fontSize={14} fontWeight="bold" color={colors.text}>
                      {Math.round(weeklyStats.completionRate * 100)}%
                    </Text>
                  </XStack>
                  <Progress value={weeklyStats.completionRate * 100}>
                    <Progress.Indicator 
                      backgroundColor={colors.primary} 
                    />
                  </Progress>
                </YStack>
              </YStack>
            </Card.Footer>
          ) : (
            <Card.Footer>
              <Text color={colors.textSecondary}>
                No workout data for this week yet
              </Text>
            </Card.Footer>
          )}
        </Card>
      )}

      {showDailyStats && (
        <Card
          bordered
          style={{
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
          }}
        >
          <Card.Header>
            <Text fontSize={18} fontWeight="bold" color={colors.text}>
              {isToday(date) ? "Today's Stats" : format(date, "MMM d") + " Stats"}
            </Text>
          </Card.Header>

          {isLoadingDaily ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : dailyStats ? (
            <Card.Footer>
              <XStack justifyContent="space-between" width="100%">
                <StatItem
                  icon="barbell-outline"
                  value={dailyStats.workoutsCount.toString()}
                  label="Workouts"
                  color={colors.primary}
                />
                <StatItem
                  icon="time-outline"
                  value={formatDuration(dailyStats.totalDuration)}
                  label="Duration"
                  color="#3B82F6"
                />
                <StatItem
                  icon="flame-outline"
                  value={`${dailyStats.totalCalories}`}
                  label="Calories"
                  color="#F59E0B"
                />
              </XStack>
            </Card.Footer>
          ) : (
            <Card.Footer>
              <Text color={colors.textSecondary}>
                No workout data for {isToday(date) ? 'today' : format(date, 'MMM d')} yet
              </Text>
            </Card.Footer>
          )}
        </Card>
      )}
    </YStack>
  );
};

interface StatItemProps {
  icon: any;
  value: string;
  label: string;
  color: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, value, label, color }) => {
  const { colors } = useTheme();
  
  return (
    <YStack alignItems="center" space="$1">
      <Ionicons name={icon} size={22} color={color} />
      <Text fontSize={16} fontWeight="600" color={colors.text}>
        {value}
      </Text>
      <Text fontSize={12} color={colors.textSecondary}>
        {label}
      </Text>
    </YStack>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});

export default WorkoutStats; 