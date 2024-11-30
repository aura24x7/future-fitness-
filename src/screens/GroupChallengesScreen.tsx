import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { workoutSocialService } from '../services/workoutSocialService';
import { WorkoutChallenge } from '../types/group';

interface GroupChallengesScreenProps {
  route: {
    params: {
      groupId: string;
      groupName: string;
    };
  };
}

const GroupChallengesScreen: React.FC<GroupChallengesScreenProps> = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId, groupName } = route.params as GroupChallengesScreenProps['route']['params'];

  const [challenges, setChallenges] = useState<WorkoutChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'active' | 'completed'>('active');

  const loadChallenges = async () => {
    try {
      // TODO: Replace with actual API call
      const mockChallenges: WorkoutChallenge[] = [
        {
          id: 'challenge1',
          groupId,
          creatorId: 'user1',
          title: '30-Day Consistency Challenge',
          description: 'Complete at least 20 workouts in 30 days',
          type: 'frequency',
          goal: 20,
          startDate: '2024-01-01',
          endDate: '2024-01-30',
          participants: ['user1', 'user2', 'user3'],
          leaderboard: [
            { userId: 'user2', progress: 15, rank: 1 },
            { userId: 'user1', progress: 12, rank: 2 },
            { userId: 'user3', progress: 8, rank: 3 },
          ],
          status: 'active',
          rules: [
            'Minimum 30-minute workouts',
            'Must include at least 3 exercises',
            'Rest days count towards consistency',
          ],
          rewards: ['Special badge', 'Featured on group leaderboard'],
        },
        // Add more mock challenges
      ];
      setChallenges(mockChallenges);
    } catch (error) {
      console.error('Error loading challenges:', error);
      Alert.alert('Error', 'Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      await workoutSocialService.joinChallenge(challengeId, 'current-user-id'); // Replace with actual user ID
      // Refresh challenges
      loadChallenges();
      Alert.alert('Success', 'You have joined the challenge!');
    } catch (error) {
      console.error('Error joining challenge:', error);
      Alert.alert('Error', 'Failed to join challenge');
    }
  };

  const renderChallengeCard = (challenge: WorkoutChallenge) => {
    const isParticipating = challenge.participants.includes('current-user-id'); // Replace with actual user ID
    const userProgress = challenge.leaderboard.find(
      item => item.userId === 'current-user-id'
    )?.progress || 0;
    const progressPercentage = (userProgress / challenge.goal) * 100;

    return (
      <View style={styles.challengeCard}>
        <View style={styles.challengeHeader}>
          <View style={styles.challengeTitle}>
            <Text style={styles.challengeName}>{challenge.title}</Text>
            <View style={styles.challengeType}>
              <Ionicons
                name={
                  challenge.type === 'frequency'
                    ? 'calendar'
                    : challenge.type === 'duration'
                    ? 'time'
                    : challenge.type === 'calories'
                    ? 'flame'
                    : 'trophy'
                }
                size={16}
                color="#6366F1"
              />
              <Text style={styles.challengeTypeText}>
                {challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)}
              </Text>
            </View>
          </View>
          {!isParticipating && (
            <TouchableOpacity
              style={styles.joinButton}
              onPress={() => handleJoinChallenge(challenge.id)}
            >
              <Text style={styles.joinButtonText}>Join</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.challengeDescription}>{challenge.description}</Text>

        {isParticipating && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Your Progress</Text>
              <Text style={styles.progressText}>
                {userProgress} / {challenge.goal}
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${Math.min(progressPercentage, 100)}%` },
                ]}
              />
            </View>
          </View>
        )}

        <View style={styles.challengeDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="people" size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              {challenge.participants.length} participants
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="calendar" size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              {new Date(challenge.endDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => {
            // TODO: Navigate to challenge details screen
            console.log('Navigate to challenge details:', challenge.id);
          }}
        >
          <Text style={styles.viewDetailsText}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color="#6366F1" />
        </TouchableOpacity>
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
          <Text style={styles.headerTitle}>{groupName} Challenges</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => {
              // TODO: Navigate to create challenge screen
              console.log('Navigate to create challenge');
            }}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'active' && styles.tabActive]}
            onPress={() => setSelectedTab('active')}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'active' && styles.tabTextActive,
              ]}
            >
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'completed' && styles.tabActive]}
            onPress={() => setSelectedTab('completed')}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'completed' && styles.tabTextActive,
              ]}
            >
              Completed
            </Text>
          </TouchableOpacity>
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
          {challenges
            .filter(c => 
              selectedTab === 'active'
                ? c.status === 'active'
                : c.status === 'completed'
            )
            .map(challenge => renderChallengeCard(challenge))}
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
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  createButton: {
    padding: 8,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
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
  challengeCard: {
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
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  challengeTitle: {
    flex: 1,
    marginRight: 16,
  },
  challengeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  challengeType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  challengeTypeText: {
    fontSize: 14,
    color: '#6366F1',
  },
  joinButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  progressBarContainer: {
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
  challengeDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6366F1',
  },
});

export default GroupChallengesScreen;
