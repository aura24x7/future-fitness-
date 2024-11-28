import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutLog } from '../types/workout';
import { mockWorkoutService } from '../services/mockData';

interface WorkoutDetailsProps {
  route: {
    params: {
      workout: WorkoutLog;
    };
  };
  navigation: any;
}

const WorkoutDetails: React.FC<WorkoutDetailsProps> = ({ route, navigation }) => {
  const { workout } = route.params;

  const handleExerciseToggle = async (exerciseId: string, completed: boolean) => {
    try {
      await mockWorkoutService.updateWorkoutExercise(workout.id, exerciseId, completed);
      // You might want to refresh the workout list screen when navigating back
    } catch (error) {
      console.error('Error updating exercise:', error);
      Alert.alert('Error', 'Failed to update exercise completion status');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>{workout.name}</Text>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{workout.duration}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{workout.calories}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
          </View>
        </View>

        <View style={styles.exerciseList}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          {workout.exercises.map((exercise) => (
            <View key={exercise.id} style={styles.exerciseItem}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => handleExerciseToggle(exercise.id, !exercise.completed)}
              >
                <Ionicons
                  name={exercise.completed ? 'checkbox' : 'square-outline'}
                  size={24}
                  color="#4c669f"
                />
              </TouchableOpacity>
              <View style={styles.exerciseDetails}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseStats}>
                  {exercise.sets} sets × {exercise.reps} reps
                  {exercise.weight ? ` @ ${exercise.weight}lbs` : ''}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4c669f',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  exerciseList: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  checkbox: {
    marginRight: 12,
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  exerciseStats: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default WorkoutDetails;
