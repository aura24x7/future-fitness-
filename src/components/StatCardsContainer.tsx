import React from 'react';
import { XStack, YStack } from 'tamagui';
import { StatCard } from './StatCard';

export const StatCardsContainer = () => {
  return (
    <YStack space="$4" padding="$4">
      <XStack space="$4" flexWrap="wrap">
        <StatCard
          icon="fitness"
          title="Workouts"
          value="12"
          subtitle="This week"
          colors={['#818cf8', '#6366f1']}
          delay={0}
        />
        <StatCard
          icon="trending-up"
          title="Progress"
          value="+2.5kg"
          subtitle="This month"
          colors={['#34d399', '#10b981']}
          delay={100}
        />
      </XStack>
      
      <XStack space="$4" flexWrap="wrap">
        <StatCard
          icon="flame"
          title="Calories"
          value="2,450"
          subtitle="Daily avg"
          colors={['#fb923c', '#f97316']}
          delay={200}
        />
        <StatCard
          icon="trophy"
          title="Streak"
          value="7 days"
          subtitle="Personal best"
          colors={['#fbbf24', '#f59e0b']}
          delay={300}
        />
      </XStack>
    </YStack>
  );
};
