import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SharedWorkoutCard } from '../components/SharedWorkoutCard';
import { ShareWorkoutModal } from '../components/ShareWorkoutModal';
import { workoutSharingService } from '../services/workoutSharingService';
import { SharedWorkout } from '../types/group';
import { AIWorkoutPlan } from '../types/workout';

interface ShareWorkoutScreenProps {
  route: {
    params: {
      workoutPlan: AIWorkoutPlan;
      currentUserId: string;
      currentUserName: string;
    };
  };
}

const ShareWorkoutScreen: React.FC<ShareWorkoutScreenProps> = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { workoutPlan, currentUserId, currentUserName } = route.params as ShareWorkoutScreenProps['route']['params'];

  const [loading, setLoading] = useState(false);
  const [sharedWorkouts, setSharedWorkouts] = useState<SharedWorkout[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    loadSharedWorkouts();
  }, []);

  const loadSharedWorkouts = async () => {
    try {
      setLoading(true);
      const workouts = await workoutSharingService.getSharedWorkouts();
      setSharedWorkouts(workouts);
    } catch (error) {
      console.error('Error loading shared workouts:', error);
      Alert.alert('Error', 'Failed to load shared workouts');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (workoutId: string) => {
    // TODO: Implement like functionality
    Alert.alert('Coming Soon', 'Workout like feature will be available soon!');
  };

  const handleComment = async (workoutId: string, content: string) => {
    // TODO: Implement comment functionality
    Alert.alert('Coming Soon', 'Workout comment feature will be available soon!');
  };

  const handleViewDetails = (workout: SharedWorkout) => {
    // TODO: Navigate to workout details screen
    Alert.alert('Coming Soon', 'Workout details view will be available soon!');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Share Workout</Text>
        <TouchableOpacity onPress={() => setShowShareModal(true)} style={styles.shareButton}>
          <Ionicons name="share-social" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#4CAF50" />
      ) : (
        <ScrollView style={styles.content}>
          {sharedWorkouts.map((workout) => (
            <SharedWorkoutCard
              key={workout.id}
              workout={workout}
              currentUserId={currentUserId}
              onLike={handleLike}
              onComment={handleComment}
              onViewDetails={handleViewDetails}
            />
          ))}
          {sharedWorkouts.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="fitness-outline" size={48} color="#666" />
              <Text style={styles.emptyStateText}>No shared workouts yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Share your workout plan with friends and see their shared workouts here!
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      <ShareWorkoutModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        workoutPlan={workoutPlan}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  shareButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
});

export default ShareWorkoutScreen;
