import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SharedWorkoutCard } from '../components/SharedWorkoutCard';
import { ShareWorkoutModal } from '../components/ShareWorkoutModal';
import { workoutSharingService } from '../services/workoutSharingService';
import { manualWorkoutService } from '../services/manualWorkoutService';
import { SharedWorkout } from '../types/group';
import { ManualWorkout } from '../types/workoutSharing';
import { AIWorkoutPlan } from '../types/workout';

interface ShareWorkoutScreenProps {
  route: {
    params: {
      workoutId?: string;  // For manual workouts
      workoutPlan?: AIWorkoutPlan;  // For AI workouts
      currentUserId: string;
      currentUserName: string;
      receiverId?: string;  // For individual sharing
      receiverName?: string;  // For individual sharing
    };
  };
}

const ShareWorkoutScreen: React.FC<ShareWorkoutScreenProps> = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { 
    workoutId, 
    workoutPlan, 
    currentUserId, 
    currentUserName,
    receiverId,
    receiverName 
  } = route.params as ShareWorkoutScreenProps['route']['params'];

  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState<ManualWorkout | AIWorkoutPlan | null>(null);
  const [sharedWorkouts, setSharedWorkouts] = useState<SharedWorkout[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>(
    receiverId ? [receiverId] : []
  );

  useEffect(() => {
    loadWorkoutData();
    loadSharedWorkouts();
    // If receiverId is provided, open share modal automatically
    if (receiverId && receiverName) {
      setShowShareModal(true);
    }
  }, []);

  const loadWorkoutData = async () => {
    if (workoutId) {
      try {
        const manualWorkout = await manualWorkoutService.getManualWorkoutById(workoutId);
        setWorkout(manualWorkout);
      } catch (error) {
        console.error('Error loading manual workout:', error);
        Alert.alert('Error', 'Failed to load workout details');
      }
    } else if (workoutPlan) {
      setWorkout(workoutPlan);
    }
  };

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

  const handleShare = async () => {
    if (!workout || selectedFriends.length === 0) {
      Alert.alert('Error', 'Please select friends to share with');
      return;
    }

    try {
      setLoading(true);
      const sharePromises = selectedFriends.map(friendId =>
        workoutSharingService.shareWorkout(
          workout,
          friendId,
          currentUserName,
          'Check out this workout!'
        )
      );

      await Promise.all(sharePromises);
      Alert.alert('Success', 'Workout shared successfully!');
      setShowShareModal(false);
      loadSharedWorkouts();
    } catch (error) {
      console.error('Error sharing workout:', error);
      Alert.alert('Error', 'Failed to share workout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F0F9FF', '#E0F2FE']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {receiverName ? `Share with ${receiverName}` : 'Share Workout'}
        </Text>
        <TouchableOpacity onPress={() => setShowShareModal(true)} style={styles.shareButton}>
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            style={styles.shareButtonGradient}
          >
            <Ionicons name="share-social" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#3B82F6" />
      ) : (
        <ScrollView style={styles.content}>
          {workout && (
            <View style={styles.workoutPreview}>
              <Text style={styles.workoutName}>
                {workout.name || 'Workout Plan'}
              </Text>
              <Text style={styles.workoutDetails}>
                {workout.exercises?.length || 0} exercises
              </Text>
            </View>
          )}

          <View style={styles.sharedSection}>
            <Text style={styles.sectionTitle}>Recent Shares</Text>
            {sharedWorkouts.map((sharedWorkout) => (
              <SharedWorkoutCard
                key={sharedWorkout.id}
                workout={sharedWorkout}
                currentUserId={currentUserId}
                onViewDetails={() => {}}
              />
            ))}
            {sharedWorkouts.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="fitness-outline" size={48} color="#94A3B8" />
                <Text style={styles.emptyStateText}>No shared workouts yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Share your workout plan with friends and see their shared workouts here!
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      <ShareWorkoutModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={handleShare}
        selectedFriends={selectedFriends}
        onSelectFriend={(friendId) => {
          setSelectedFriends(prev =>
            prev.includes(friendId)
              ? prev.filter(id => id !== friendId)
              : [...prev, friendId]
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  shareButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  shareButtonGradient: {
    padding: 10,
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
  workoutPreview: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  workoutDetails: {
    fontSize: 14,
    color: '#64748B',
  },
  sharedSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748B',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default ShareWorkoutScreen;
