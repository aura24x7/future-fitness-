import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface WorkoutStatsProps {
  caloriesBurned: number;
  timeSpentMinutes: number;
}

export const WorkoutStats: React.FC<WorkoutStatsProps> = ({
  caloriesBurned,
  timeSpentMinutes,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.statContainer}>
        <Text style={[styles.statValue, { color: theme.text }]}>
          {caloriesBurned}
        </Text>
        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
          Calories Burned
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.statContainer}>
        <Text style={[styles.statValue, { color: theme.text }]}>
          {timeSpentMinutes}
        </Text>
        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
          Minutes Active
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statContainer: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: '70%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});
