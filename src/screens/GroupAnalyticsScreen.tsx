import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { workoutSocialService } from '../services/workoutSocialService';
import { WorkoutAnalytics, WorkoutTrend, UserEngagement } from '../types/group';

interface GroupAnalyticsScreenProps {
  route: {
    params: {
      groupId: string;
      groupName: string;
    };
  };
}

const GroupAnalyticsScreen: React.FC<GroupAnalyticsScreenProps> = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId, groupName } = route.params as GroupAnalyticsScreenProps['route']['params'];

  const [analytics, setAnalytics] = useState<WorkoutAnalytics | null>(null);
  const [trends, setTrends] = useState<WorkoutTrend[]>([]);
  const [engagement, setEngagement] = useState<UserEngagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsData, trendsData, engagementData] = await Promise.all([
        workoutSocialService.getWorkoutAnalytics(groupId),
        workoutSocialService.getWorkoutTrends(groupId, selectedPeriod),
        workoutSocialService.getUserEngagement('current-user-id', groupId), // Replace with actual user ID
      ]);

      setAnalytics(analyticsData);
      setTrends(trendsData);
      setEngagement(engagementData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const renderAnalyticsCard = () => {
    if (!analytics) return null;

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Workout Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{analytics.totalWorkouts}</Text>
            <Text style={styles.statLabel}>Total Workouts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{analytics.totalDuration}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{analytics.totalCalories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{(analytics.completionRate * 100).toFixed(0)}%</Text>
            <Text style={styles.statLabel}>Completion</Text>
          </View>
        </View>

        <View style={styles.muscleGroupsContainer}>
          <Text style={styles.sectionTitle}>Top Muscle Groups</Text>
          {analytics.topMuscleGroups.map((group, index) => (
            <View key={index} style={styles.muscleGroupBar}>
              <Text style={styles.muscleGroupName}>{group.name}</Text>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${(group.count / analytics.totalWorkouts) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.muscleGroupCount}>{group.count}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderTrendsChart = () => {
    if (trends.length === 0) return null;

    const chartData = {
      labels: trends.map(t => t.period),
      datasets: [
        {
          data: trends.map(t => t.workoutCount),
        },
      ],
    };

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Workout Trends</Text>
        <View style={styles.periodSelector}>
          {(['week', 'month', 'year'] as const).map(period => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 64}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  const renderEngagementCard = () => {
    if (!engagement) return null;

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Engagement</Text>
        <View style={styles.engagementStats}>
          <View style={styles.engagementRow}>
            <View style={styles.engagementItem}>
              <Ionicons name="share-social" size={24} color="#6366F1" />
              <Text style={styles.engagementValue}>{engagement.workoutsShared}</Text>
              <Text style={styles.engagementLabel}>Shared</Text>
            </View>
            <View style={styles.engagementItem}>
              <Ionicons name="heart" size={24} color="#6366F1" />
              <Text style={styles.engagementValue}>{engagement.likesReceived}</Text>
              <Text style={styles.engagementLabel}>Likes</Text>
            </View>
            <View style={styles.engagementItem}>
              <Ionicons name="chatbubble" size={24} color="#6366F1" />
              <Text style={styles.engagementValue}>{engagement.commentsReceived}</Text>
              <Text style={styles.engagementLabel}>Comments</Text>
            </View>
          </View>
          <View style={styles.engagementRow}>
            <View style={styles.engagementItem}>
              <Ionicons name="trophy" size={24} color="#6366F1" />
              <Text style={styles.engagementValue}>{engagement.challengesWon}</Text>
              <Text style={styles.engagementLabel}>Challenges Won</Text>
            </View>
            <View style={styles.engagementItem}>
              <Ionicons name="trending-up" size={24} color="#6366F1" />
              <Text style={styles.engagementValue}>{(engagement.consistency * 100).toFixed(0)}%</Text>
              <Text style={styles.engagementLabel}>Consistency</Text>
            </View>
            <View style={styles.engagementItem}>
              <Ionicons name="star" size={24} color="#6366F1" />
              <Text style={styles.engagementValue}>{engagement.influenceScore}</Text>
              <Text style={styles.engagementLabel}>Influence</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6366F1', '#4F46E5']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{groupName} Analytics</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {renderAnalyticsCard()}
          {renderTrendsChart()}
          {renderEngagementCard()}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statItem: {
    width: '48%',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  muscleGroupsContainer: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  muscleGroupBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  muscleGroupName: {
    width: 80,
    fontSize: 14,
    color: '#4B5563',
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 4,
  },
  muscleGroupCount: {
    width: 30,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  periodButtonActive: {
    backgroundColor: '#6366F1',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  engagementStats: {
    gap: 24,
  },
  engagementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  engagementItem: {
    alignItems: 'center',
    gap: 4,
  },
  engagementValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  engagementLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default GroupAnalyticsScreen;
