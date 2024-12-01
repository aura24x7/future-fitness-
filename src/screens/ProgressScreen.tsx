import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { Stack, XStack, YStack, Text, View, Tabs } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import { useScrollToTabBar } from '../hooks/useScrollToTabBar';
import { Ionicons } from '@expo/vector-icons';
import { StatCardsContainer } from '../components/StatCardsContainer';
import { WeightChart } from '../components/charts/WeightChart';
import { WorkoutPieChart } from '../components/charts/WorkoutPieChart';
import { ActivityBarChart } from '../components/charts/ActivityBarChart';

// Sample data
const weightData = [
  { date: '2024-01-01', weight: 70 },
  { date: '2024-01-08', weight: 69.5 },
  { date: '2024-01-15', weight: 69 },
  { date: '2024-01-22', weight: 68.8 },
  { date: '2024-01-29', weight: 68.5 },
];

const workoutData = [
  { type: "Strength", percentage: 40 },
  { type: "Cardio", percentage: 30 },
  { type: "HIIT", percentage: 20 },
  { type: "Yoga", percentage: 10 },
];

const weeklyActivityData = [
  { day: "Mon", duration: 45 },
  { day: "Tue", duration: 30 },
  { day: "Wed", duration: 60 },
  { day: "Thu", duration: 45 },
  { day: "Fri", duration: 30 },
  { day: "Sat", duration: 75 },
  { day: "Sun", duration: 0 },
];

const ProgressScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState("weight");
  const { scrollViewRef, handleScroll } = useScrollToTabBar();

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <YStack space="$4">
          <YStack>
            <LinearGradient
              colors={['#6366f1', '#818cf8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                padding: 20,
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
              }}
            >
              <Text color="white" fontSize="$8" fontWeight="bold">
                Progress
              </Text>
              <Text color="white" fontSize="$4" opacity={0.9}>
                Track your fitness journey
              </Text>
            </LinearGradient>
          </YStack>

          <YStack space="$4" padding="$4">
            <StatCardsContainer />

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              flexDirection="column"
              width="100%"
              height="auto"
              borderRadius="$4"
              backgroundColor="$background"
              borderColor="$borderColor"
            >
              <Tabs.List space="$4">
                <Tabs.Tab flex={1} value="weight">
                  <XStack space="$2" alignItems="center">
                    <Ionicons name="scale-outline" size={20} />
                    <Text>Weight</Text>
                  </XStack>
                </Tabs.Tab>
                <Tabs.Tab flex={1} value="workouts">
                  <XStack space="$2" alignItems="center">
                    <Ionicons name="fitness-outline" size={20} />
                    <Text>Workouts</Text>
                  </XStack>
                </Tabs.Tab>
                <Tabs.Tab flex={1} value="activity">
                  <XStack space="$2" alignItems="center">
                    <Ionicons name="bar-chart-outline" size={20} />
                    <Text>Activity</Text>
                  </XStack>
                </Tabs.Tab>
              </Tabs.List>

              <YStack paddingVertical="$4" space="$4">
                <Tabs.Content value="weight">
                  <YStack space="$4">
                    <Text fontSize="$6" fontWeight="bold">Weight Progress</Text>
                    <WeightChart data={weightData} />
                  </YStack>
                </Tabs.Content>

                <Tabs.Content value="workouts">
                  <YStack space="$4">
                    <Text fontSize="$6" fontWeight="bold">Workout Distribution</Text>
                    <WorkoutPieChart data={workoutData} />
                  </YStack>
                </Tabs.Content>

                <Tabs.Content value="activity">
                  <YStack space="$4">
                    <Text fontSize="$6" fontWeight="bold">Weekly Activity</Text>
                    <ActivityBarChart data={weeklyActivityData} />
                  </YStack>
                </Tabs.Content>
              </YStack>
            </Tabs>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
};

export default ProgressScreen;
