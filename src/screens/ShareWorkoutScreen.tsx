import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SharedWorkout } from '../types/group';

interface ShareWorkoutScreenProps {
  route: {
    params: {
      groupId: string;
      workout: {
        id: string;
        name: string;
        exercises: {
          name: string;
          sets: number;
          reps: number;
          weight?: number;
        }[];
        duration: number;
        calories: number;
      };
    };
  };
}

const ShareWorkoutScreen: React.FC<ShareWorkoutScreenProps> = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId, workout } = route.params as ShareWorkoutScreenProps['route']['params'];

  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [intensity, setIntensity] = useState(5);
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    try {
      setLoading(true);

      // TODO: Replace with actual API call
      const sharedWorkout: SharedWorkout = {
        id: `shared-${workout.id}`,
        groupId,
        userId: 'current-user-id', // Replace with actual user ID
        userName: 'John Doe', // Replace with actual user name
        workoutId: workout.id,
        workoutName: workout.name,
        description,
        duration: workout.duration,
        calories: workout.calories,
        exercises: workout.exercises,
        likes: [],
        comments: [],
        metrics: {
          difficulty,
          intensity,
          muscleGroups,
        },
        sharedAt: new Date().toISOString(),
      };

      // TODO: Call API to share workout
      console.log('Sharing workout:', sharedWorkout);

      Alert.alert('Success', 'Workout shared successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error sharing workout:', error);
      Alert.alert('Error', 'Failed to share workout');
    } finally {
      setLoading(false);
    }
  };

  const difficultyOptions: Array<'easy' | 'medium' | 'hard'> = [
    'easy',
    'medium',
    'hard',
  ];

  const commonMuscleGroups = [
    'Chest',
    'Back',
    'Legs',
    'Shoulders',
    'Arms',
    'Core',
    'Full Body',
  ];

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
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Share Workout</Text>
          <TouchableOpacity
            style={[styles.shareButton, loading && styles.shareButtonDisabled]}
            onPress={handleShare}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.shareButtonText}>Share</Text>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.workoutInfo}>
          <Text style={styles.workoutName}>{workout.name}</Text>
          <View style={styles.workoutStats}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text style={styles.statText}>{workout.duration} min</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="flame-outline" size={16} color="#6B7280" />
              <Text style={styles.statText}>{workout.calories} cal</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="barbell-outline" size={16} color="#6B7280" />
              <Text style={styles.statText}>
                {workout.exercises.length} exercises
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Add a description..."
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Difficulty</Text>
          <View style={styles.difficultyOptions}>
            {difficultyOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.difficultyButton,
                  difficulty === option && styles.difficultyButtonActive,
                ]}
                onPress={() => setDifficulty(option)}
              >
                <Text
                  style={[
                    styles.difficultyButtonText,
                    difficulty === option && styles.difficultyButtonTextActive,
                  ]}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Intensity (1-10)</Text>
          <View style={styles.intensityContainer}>
            <TouchableOpacity
              style={styles.intensityButton}
              onPress={() => setIntensity(Math.max(1, intensity - 1))}
            >
              <Ionicons name="remove" size={24} color="#6366F1" />
            </TouchableOpacity>
            <Text style={styles.intensityValue}>{intensity}</Text>
            <TouchableOpacity
              style={styles.intensityButton}
              onPress={() => setIntensity(Math.min(10, intensity + 1))}
            >
              <Ionicons name="add" size={24} color="#6366F1" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Muscle Groups</Text>
          <View style={styles.muscleGroupsContainer}>
            {commonMuscleGroups.map((group) => (
              <TouchableOpacity
                key={group}
                style={[
                  styles.muscleGroupButton,
                  muscleGroups.includes(group) && styles.muscleGroupButtonActive,
                ]}
                onPress={() => {
                  if (muscleGroups.includes(group)) {
                    setMuscleGroups(muscleGroups.filter((g) => g !== group));
                  } else {
                    setMuscleGroups([...muscleGroups, group]);
                  }
                }}
              >
                <Text
                  style={[
                    styles.muscleGroupButtonText,
                    muscleGroups.includes(group) &&
                      styles.muscleGroupButtonTextActive,
                  ]}
                >
                  {group}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  shareButtonDisabled: {
    opacity: 0.5,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  workoutInfo: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  workoutName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  descriptionInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    height: 100,
    fontSize: 14,
  },
  difficultyOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  difficultyButtonActive: {
    backgroundColor: '#EEF2FF',
  },
  difficultyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  difficultyButtonTextActive: {
    color: '#6366F1',
  },
  intensityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  intensityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  intensityValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    width: 40,
    textAlign: 'center',
  },
  muscleGroupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleGroupButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  muscleGroupButtonActive: {
    backgroundColor: '#EEF2FF',
  },
  muscleGroupButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  muscleGroupButtonTextActive: {
    color: '#6366F1',
  },
});

export default ShareWorkoutScreen;
