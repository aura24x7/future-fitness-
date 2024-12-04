import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { Stack, XStack, YStack, Text, View, Tabs, Card } from 'tamagui';
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

  const handleTabChange = (value: string) => {
    if (value === 'workouts' || value === 'activity') {
      Alert.alert(
        'Coming Soon!',
        `${value.charAt(0).toUpperCase() + value.slice(1)} tracking feature will be available in the next update.`,
        [{ text: 'OK', onPress: () => {} }]
      );
      return;
    }
    setActiveTab(value);
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <YStack space="$2">
          <LinearGradient
            colors={['#6366f1', '#818cf8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              padding: 16,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
            }}
          >
            <Text color="white" fontSize="$7" fontWeight="bold" marginBottom="$1">
              Progress
            </Text>
            <Text color="white" fontSize="$4" opacity={0.9}>
              Track your fitness journey
            </Text>
          </LinearGradient>

          <YStack space="$2" padding="$2">
            <StatCardsContainer />

            <Card 
              backgroundColor="$background" 
              borderRadius="$4" 
              borderColor="$borderColor"
              marginTop="$2"
            >
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                flexDirection="column"
                width="100%"
                height="auto"
              >
                <Tabs.List space="$2" padding="$2">
                  <Tabs.Tab flex={1} value="weight">
                    <XStack space="$2" alignItems="center">
                      <Ionicons name="scale-outline" size={18} />
                      <Text>Weight</Text>
                    </XStack>
                  </Tabs.Tab>
                  <Tabs.Tab flex={1} value="workouts">
                    <XStack space="$2" alignItems="center" opacity={0.5}>
                      <Ionicons name="fitness-outline" size={18} />
                      <Text>Workouts</Text>
                      <Ionicons name="lock-closed" size={14} color="#6B7280" />
                    </XStack>
                  </Tabs.Tab>
                  <Tabs.Tab flex={1} value="activity">
                    <XStack space="$2" alignItems="center" opacity={0.5}>
                      <Ionicons name="bar-chart-outline" size={18} />
                      <Text>Activity</Text>
                      <Ionicons name="lock-closed" size={14} color="#6B7280" />
                    </XStack>
                  </Tabs.Tab>
                </Tabs.List>

                <YStack padding="$3" space="$3">
                  <Tabs.Content value="weight">
                    <YStack space="$3">
                      <Text fontSize="$5" fontWeight="bold">Weight Progress</Text>
                      <WeightChart data={weightData} />
                    </YStack>
                  </Tabs.Content>

                  <Tabs.Content value="workouts">
                    <YStack space="$3">
                      <Text fontSize="$5" fontWeight="bold">Workout Distribution</Text>
                      <WorkoutPieChart data={workoutData} />
                    </YStack>
                  </Tabs.Content>

                  <Tabs.Content value="activity">
                    <YStack space="$3">
                      <Text fontSize="$5" fontWeight="bold">Weekly Activity</Text>
                      <ActivityBarChart data={weeklyActivityData} />
                    </YStack>
                  </Tabs.Content>
                </YStack>
              </Tabs>
            </Card>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
};

export default ProgressScreen;
