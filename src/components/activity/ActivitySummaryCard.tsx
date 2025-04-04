import React from 'react';
import { View } from 'react-native';
import { Card, Text, YStack, XStack } from 'tamagui';
import { useActivity } from '../../contexts/ActivityContext';

export const ActivitySummaryCard: React.FC = () => {
  const { activityStats, activitySettings, isLoading } = useActivity();

  if (isLoading || !activityStats) {
    return (
      <Card elevate size="$4" bordered>
        <Card.Header padded>
          <Text>Loading activity summary...</Text>
        </Card.Header>
      </Card>
    );
  }

  const weeklyGoalProgress = Math.min(
    (activityStats.totalActiveMinutes / activitySettings.weeklyGoal.minutes) * 100,
    100
  );

  const calorieGoalProgress = Math.min(
    (activityStats.weeklyCaloriesBurned / activitySettings.weeklyGoal.calories) * 100,
    100
  );

  return (
    <Card elevate size="$4" bordered>
      <Card.Header padded>
        <Text fontSize={18} fontWeight="600">
          Activity Summary
        </Text>
      </Card.Header>
      <Card.Footer padded>
        <YStack space="$3">
          <XStack justifyContent="space-between">
            <Text>Active Minutes</Text>
            <Text>
              {activityStats.totalActiveMinutes} / {activitySettings.weeklyGoal.minutes} min
            </Text>
          </XStack>
          <View style={{ height: 4, backgroundColor: '#E0E0E0', borderRadius: 2 }}>
            <View
              style={{
                height: '100%',
                width: `${weeklyGoalProgress}%`,
                backgroundColor: '#4CAF50',
                borderRadius: 2,
              }}
            />
          </View>

          <XStack justifyContent="space-between" marginTop="$2">
            <Text>Calories Burned</Text>
            <Text>
              {activityStats.weeklyCaloriesBurned} / {activitySettings.weeklyGoal.calories} cal
            </Text>
          </XStack>
          <View style={{ height: 4, backgroundColor: '#E0E0E0', borderRadius: 2 }}>
            <View
              style={{
                height: '100%',
                width: `${calorieGoalProgress}%`,
                backgroundColor: '#2196F3',
                borderRadius: 2,
              }}
            />
          </View>

          <XStack justifyContent="space-between" marginTop="$2">
            <Text>Activity Streak</Text>
            <Text>{activityStats.activityStreak} days</Text>
          </XStack>

          <XStack justifyContent="space-between">
            <Text>Most Frequent Activity</Text>
            <Text>{activityStats.mostFrequentActivity}</Text>
          </XStack>

          <XStack justifyContent="space-between">
            <Text>Average Intensity</Text>
            <Text style={{ textTransform: 'capitalize' }}>
              {activityStats.averageIntensity.replace('_', ' ')}
            </Text>
          </XStack>
        </YStack>
      </Card.Footer>
    </Card>
  );
}; 