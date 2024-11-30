import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import SharedWorkoutCard from '../components/SharedWorkoutCard';
import { SharedWorkout } from '../types/group';

interface GroupWorkoutsScreenProps {
  route: {
    params: {
      groupId: string;
      groupName: string;
    };
  };
}

const GroupWorkoutsScreen: React.FC<GroupWorkoutsScreenProps> = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId, groupName } = route.params as GroupWorkoutsScreenProps['route']['params'];

  const [workouts, setWorkouts] = useState<SharedWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWorkouts = async () => {
    try {
      // TODO: Replace with actual API call
      const mockWorkouts: SharedWorkout[] = [
        {
          id: '1',
          groupId,
          userId: 'user1',
          userName: 'John Doe',
          workoutId: 'workout1',
          workoutName: 'Full Body Workout',
          description: 'A comprehensive full body workout routine',
          duration: 45,
          calories: 350,
          exercises: [
            { name: 'Push-ups', sets: 3, reps: 12 },
            { name: 'Squats', sets: 3, reps: 15 },
            { name: 'Pull-ups', sets: 3, reps: 8 },
          ],
          likes: ['user2', 'user3'],
          comments: [
            {
              id: 'comment1',
              userId: 'user2',
              userName: 'Jane Smith',
              content: "Great workout! I'll try this tomorrow.",
              createdAt: new Date().toISOString(),
            },
          ],
          metrics: {
            difficulty: 'medium',
            intensity: 7,
            muscleGroups: ['Chest', 'Legs', 'Back'],
          },
          sharedAt: new Date().toISOString(),
        },
      ];
      setWorkouts(mockWorkouts);
    } catch (error) {
      console.error('Error loading workouts:', error);
      Alert.alert('Error', 'Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWorkouts();
    setRefreshing(false);
  }, []);

  const handleLike = async (workoutId: string) => {
    try {
      // TODO: Replace with actual API call
      const userId = 'current-user-id'; // Replace with actual user ID
      setWorkouts(workouts.map(workout => {
        if (workout.id === workoutId) {
          const likes = workout.likes.includes(userId)
            ? workout.likes.filter(id => id !== userId)
            : [...workout.likes, userId];
          return { ...workout, likes };
        }
        return workout;
      }));
    } catch (error) {
      console.error('Error liking workout:', error);
      Alert.alert('Error', 'Failed to like workout');
    }
  };

  const handleComment = async (workoutId: string, content: string) => {
    try {
      // TODO: Replace with actual API call
      const newComment = {
        id: `comment-${Date.now()}`,
        userId: 'current-user-id', // Replace with actual user ID
        userName: 'Current User', // Replace with actual user name
        content,
        createdAt: new Date().toISOString(),
      };

      setWorkouts(workouts.map(workout => {
        if (workout.id === workoutId) {
          return {
            ...workout,
            comments: [...workout.comments, newComment],
          };
        }
        return workout;
      }));
    } catch (error) {
      console.error('Error posting comment:', error);
      Alert.alert('Error', 'Failed to post comment');
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

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
          <Text style={styles.headerTitle}>{groupName}</Text>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => {
              // TODO: Navigate to workout selection screen
              console.log('Navigate to workout selection');
            }}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SharedWorkoutCard
              workout={item}
              currentUserId="current-user-id" // Replace with actual user ID
              onLike={handleLike}
              onComment={handleComment}
              onViewDetails={(workout) => {
                // TODO: Navigate to workout details screen
                console.log('Navigate to workout details:', workout);
              }}
            />
          )}
          contentContainerStyle={styles.workoutsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No workouts shared yet</Text>
              <TouchableOpacity
                style={styles.shareFirstButton}
                onPress={() => {
                  // TODO: Navigate to workout selection screen
                  console.log('Navigate to workout selection');
                }}
              >
                <Text style={styles.shareFirstButtonText}>Share First Workout</Text>
              </TouchableOpacity>
            </View>
          }
        />
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
  shareButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutsList: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  shareFirstButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  shareFirstButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default GroupWorkoutsScreen;
