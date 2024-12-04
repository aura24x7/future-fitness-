import React from 'react';
import { XStack, YStack } from 'tamagui';
import { StatCard } from './StatCard';

export const StatCardsContainer = () => {
  return (
    <YStack space="$2" paddingHorizontal="$2">
      <XStack space="$2">
        <StatCard
          icon="fitness"
          title="Workouts"
          value="12"
          subtitle="This week"
          colors={['#818cf8', '#6366f1']}
          delay={0}
          style={{ flex: 1 }}
        />
        <StatCard
          icon="trending-up"
          title="Progress"
          value="+2.5kg"
          subtitle="This month"
          colors={['#34d399', '#10b981']}
          delay={100}
          style={{ flex: 1 }}
        />
      </XStack>
      
      <XStack space="$2">
        <StatCard
          icon="flame"
          title="Calories"
          value="2,450"
          subtitle="Daily avg"
          colors={['#fb923c', '#f97316']}
          delay={200}
          style={{ flex: 1 }}
        />
        <StatCard
          icon="trophy"
          title="Streak"
          value="7 days"
          subtitle="Personal best"
          colors={['#fbbf24', '#f59e0b']}
          delay={300}
          style={{ flex: 1 }}
        />
      </XStack>
    </YStack>
  );
};
