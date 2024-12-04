import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Exercise } from '../types/workout';
import { Workout } from '../types/workout';
import Checkbox from './Checkbox';
import { DirectShareButton } from './sharing/DirectShareButton';

interface WorkoutCardProps {
  workout: Workout;
  onPress: () => void;
  onEdit: () => void;
  onExerciseToggle?: (exerciseId: string, completed: boolean) => void;
  showCheckboxes?: boolean;
  currentUserId: string;
  currentUserName: string;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ 
  workout, 
  onPress,
  onEdit, 
  onExerciseToggle,
  showCheckboxes = false,
  currentUserId,
  currentUserName
}) => {
  const completedExercises = workout.exercises.filter(e => e.completed).length;
  const totalExercises = workout.exercises.length;
  const progress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons 
            name={workout.type === 'strength' ? 'barbell-outline' : 'fitness-outline'} 
            size={24} 
            color="#4c669f" 
          />
          <Text style={styles.title}>{workout.name}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={onEdit} style={styles.editButton}>
            <Ionicons name="pencil" size={20} color="#4c669f" />
          </TouchableOpacity>
          <Text style={styles.duration}>{workout.duration} min</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {totalExercises}
          </Text>
          <Text style={styles.statLabel}>Exercises</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {workout.caloriesBurned}
          </Text>
          <Text style={styles.statLabel}>Calories</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {`${Math.round(progress)}%`}
          </Text>
          <Text style={styles.statLabel}>Complete</Text>
        </View>
      </View>

      {showCheckboxes && (
        <View style={styles.exerciseList}>
          {workout.exercises.map((exercise, index) => (
            <View key={exercise.id || index} style={styles.exerciseItem}>
              <Checkbox
                checked={exercise.completed || false}
                onToggle={(checked) => onExerciseToggle?.(exercise.id, checked)}
              />
              <Text style={styles.exerciseName}>
                {exercise.name} - {exercise.sets}×{exercise.reps}
                {exercise.weight ? ` @ ${exercise.weight}lbs` : ''}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.date}>
          {new Date(workout.date).toLocaleDateString()}
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>

      <View style={styles.actionButtons}>
        <DirectShareButton
          workout={workout}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          style={styles.actionButton}
        />
      </View>

      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${progress}%` }
          ]} 
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  duration: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editButton: {
    padding: 5,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
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
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  exerciseList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  exerciseName: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  actionButton: {
    padding: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4c669f',
    borderRadius: 2,
  },
});

export default WorkoutCard;
