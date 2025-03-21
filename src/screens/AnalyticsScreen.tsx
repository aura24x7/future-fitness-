import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Text, YStack, XStack } from 'tamagui';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../theme/ThemeProvider';
import MacroBarChart from '../components/analytics/MacroBarChart';
import TimeRangeSelector, { TimeRange } from '../components/analytics/TimeRangeSelector';
import { useAnalytics } from '../hooks/useAnalytics';
import StatCard from '../components/analytics/StatCard';
import { WeightProvider } from '../contexts/WeightContext';
import { WeightTrackingCard } from '../components/analytics/WeightTrackingCard';

type AnalyticsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Analytics'>;

interface Props {
  navigation: AnalyticsScreenNavigationProp;
}

const AnalyticsContent: React.FC<Props> = () => {
  const { colors } = useTheme();
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly');
  const { getAnalyticsData, getAverages, getProgressMetrics } = useAnalytics();

  const chartData = getAnalyticsData(timeRange);
  const averages = getAverages(timeRange);
  const progress = getProgressMetrics(timeRange);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text 
            style={{ color: colors.text }}
            fontSize={24}
            fontWeight="700"
          >
            Progress Analytics
          </Text>
        </View>

        <TimeRangeSelector
          selectedRange={timeRange}
          onRangeChange={setTimeRange}
        />

        {/* Stats Overview */}
        <YStack padding="$2">
          <XStack 
            space="$3" 
            justifyContent="space-between" 
            alignItems="stretch"
            paddingHorizontal="$2"
          >
            <StatCard 
              title="Daily Average" 
              value={`${averages.averageCalories} cal`}
              description={`${averages.adherenceRate.toFixed(1)}% tracking rate`}
              gradient={['#4361EE', '#3730A3']}
              delay={0}
            />
            <StatCard 
              title="Current Streak" 
              value={`${progress.currentStreak} days`}
              description={`Best: ${progress.maxStreak} days`}
              gradient={['#7209B7', '#5B21B6']}
              delay={100}
            />
            <StatCard 
              title="Consistency" 
              value={`${progress.consistency.toFixed(1)}%`}
              description="of days on target"
              gradient={['#10B981', '#059669']}
              delay={200}
            />
          </XStack>
        </YStack>
        
        {/* Weight Tracking Section */}
        <View style={styles.sectionContainer}>
          <Text
            style={{ color: colors.text }}
            fontSize={20}
            fontWeight="600"
            marginBottom={16}
          >
            Weight Tracking
          </Text>
          <WeightTrackingCard recommendedDailyCalories={2000} />
        </View>

        {/* Nutrition Section */}
        <View style={styles.sectionContainer}>
          <Text
            style={{ color: colors.text }}
            fontSize={20}
            fontWeight="600"
            marginBottom={16}
          >
            Nutrition Analysis
          </Text>
          <View style={styles.chartSection}>
            <MacroBarChart
              data={chartData}
              title={`${timeRange === 'weekly' ? 'Weekly' : 'Monthly'} Macro Distribution`}
              height={300}
              timeRange={timeRange}
            />
          </View>

          {/* Macro Breakdown */}
          <View style={styles.summarySection}>
            <Text
              style={{ color: colors.text }}
              fontSize={18}
              fontWeight="600"
              marginBottom={10}
            >
              Macro Breakdown
            </Text>
            <YStack space="$2">
              <Text color={colors.text}>
                Protein: {averages.averageMacros.protein}g
              </Text>
              <Text color={colors.text}>
                Carbs: {averages.averageMacros.carbs}g
              </Text>
              <Text color={colors.text}>
                Fat: {averages.averageMacros.fat}g
              </Text>
            </YStack>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const AnalyticsScreen: React.FC<Props> = (props) => {
  return (
    <WeightProvider>
      <AnalyticsContent {...props} />
    </WeightProvider>
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
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  sectionContainer: {
    marginVertical: 24,
  },
  chartSection: {
    marginVertical: 20,
  },
  summarySection: {
    marginTop: 20,
  },
});

export default AnalyticsScreen; 