import React from 'react';
import { ScrollView } from 'react-native';
import { YStack } from 'tamagui';
import { ActivityProvider } from '../contexts/ActivityContext';
import { ActivityLogForm } from '../components/activity/ActivityLogForm';
import { ActivitySummaryCard } from '../components/activity/ActivitySummaryCard';

export const ActivityScreen: React.FC = () => {
  return (
    <ActivityProvider>
      <ScrollView>
        <YStack space="$4" padding="$4">
          <ActivitySummaryCard />
          <ActivityLogForm />
        </YStack>
      </ScrollView>
    </ActivityProvider>
  );
}; 