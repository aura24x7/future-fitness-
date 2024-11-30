import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Exercise, AIWorkoutPlan as AIWorkoutPlanType } from '../types/workout';
import { format, addDays, subDays, isToday } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';

interface Props {
  workoutPlan: AIWorkoutPlanType[];
  isLoading: boolean;
  onGenerateNew: () => void;
  onAddCustomExercise: () => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onExerciseComplete: (exerciseId: string) => void;
}

export const AIWorkoutPlanComponent: React.FC<Props> = ({
  workoutPlan,
  isLoading,
  onGenerateNew,
  onAddCustomExercise,
  selectedDate,
  onDateChange,
  onExerciseComplete,
}) => {
  const { theme } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [currentWorkout, setCurrentWorkout] = useState<AIWorkoutPlanType | null>(null);

  useEffect(() => {
    try {
      const currentDate = selectedDate.toISOString().split('T')[0];
      const workout = workoutPlan.find(plan => plan.date.split('T')[0] === currentDate);
      setCurrentWorkout(workout || null);
      setError(null);
    } catch (error) {
      console.error('Error finding workout for date:', error);
      setError('Failed to load workout for selected date');
    }
  }, [selectedDate, workoutPlan]);

  const handleDateChange = (newDate: Date) => {
    setError(null);
    onDateChange(newDate);
  };

  const handleExerciseComplete = useCallback((exerciseId: string) => {
    try {
      onExerciseComplete(exerciseId);
    } catch (error) {
      console.error('Error completing exercise:', error);
      setError('Failed to update exercise status');
    }
  }, [onExerciseComplete]);

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.errorText }]}>
          {error}
        </Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setError(null)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.dateSelector, { 
        backgroundColor: theme.colors.headerBackground,
        borderBottomColor: theme.colors.border 
      }]}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => handleDateChange(subDays(selectedDate, 1))}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.dateContainer}>
          <Text style={[styles.dateText, { color: theme.colors.text }]}>
            {isToday(selectedDate) ? 'Today' : format(selectedDate, 'MMM d, yyyy')}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => handleDateChange(addDays(selectedDate, 1))}
        >
          <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.secondaryText }]}>
            Loading workout plan...
          </Text>
        </View>
      ) : !currentWorkout ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.secondaryText }]}>
            No workout plan for this date
          </Text>
          <TouchableOpacity 
            style={[styles.generateButton, { backgroundColor: theme.colors.primary }]}
            onPress={onGenerateNew}
          >
            <Text style={styles.generateButtonText}>Generate New Plan</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          <View style={[styles.workoutHeader, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.workoutInfo}>
              <Text style={[styles.workoutName, { color: theme.colors.text }]}>
                {currentWorkout.name}
              </Text>
              <Text style={[styles.workoutDescription, { color: theme.colors.secondaryText }]}>
                {currentWorkout.description}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.addExerciseButton}
              onPress={onAddCustomExercise}
            >
              <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
              <Text style={[styles.addExerciseText, { color: theme.colors.primary }]}>
                Add Exercise
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsContainer}>
            <LinearGradient
              colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
              style={styles.statsCard}
            >
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Completed</Text>
                <Text style={styles.statValue}>
                  {currentWorkout.completedExercises || 0}/{currentWorkout.exercises.length}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Duration</Text>
                <Text style={styles.statValue}>
                  {Math.round(currentWorkout.completedDuration / 60)} min
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Calories</Text>
                <Text style={styles.statValue}>
                  {Math.round(currentWorkout.completedCalories)}
                </Text>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.exercisesContainer}>
            {currentWorkout.exercises.map((exercise, index) => (
              <TouchableOpacity
                key={exercise.id}
                style={[
                  styles.exerciseCard,
                  { backgroundColor: theme.colors.exerciseCard },
                  exercise.completed && {
                    backgroundColor: theme.colors.exerciseCardCompleted,
                    borderColor: theme.colors.exerciseCardBorder,
                  },
                ]}
                onPress={() => handleExerciseComplete(exercise.id)}
              >
                <View style={styles.exerciseContent}>
                  <View style={styles.exerciseHeader}>
                    <Text style={[styles.exerciseName, { color: theme.colors.text }]}>
                      {exercise.name}
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.checkButton,
                        exercise.completed && styles.checkButtonCompleted,
                      ]}
                      onPress={() => handleExerciseComplete(exercise.id)}
                    >
                      <Ionicons
                        name={exercise.completed ? "checkmark-circle" : "checkmark-circle-outline"}
                        size={24}
                        color={exercise.completed ? theme.colors.primary : theme.colors.secondaryText}
                      />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={[styles.exerciseDescription, { color: theme.colors.secondaryText }]}>
                    {exercise.description}
                  </Text>
                  
                  <View style={styles.exerciseDetails}>
                    <Text style={[styles.exerciseDetail, { color: theme.colors.secondaryText }]}>
                      {exercise.sets} sets × {
                        exercise.type === 'repetition' 
                          ? `${exercise.reps} reps`
                          : `${Math.round(exercise.duration / 60)} min`
                      }
                    </Text>
                    {exercise.equipment && exercise.equipment.length > 0 && (
                      <Text style={[styles.exerciseDetail, { color: theme.colors.secondaryText }]}>
                        Equipment: {exercise.equipment.join(', ')}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dateButton: {
    padding: 8,
  },
  dateContainer: {
    flex: 1,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  generateButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  workoutDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  addExerciseText: {
    marginLeft: 4,
    fontWeight: '600',
  },
  statsContainer: {
    padding: 16,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  exercisesContainer: {
    padding: 16,
  },
  exerciseCard: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  exerciseContent: {
    padding: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  checkButton: {
    padding: 4,
  },
  checkButtonCompleted: {
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
  },
  exerciseDescription: {
    fontSize: 14,
    marginTop: 8,
  },
  exerciseDetails: {
    marginTop: 12,
  },
  exerciseDetail: {
    fontSize: 14,
    marginBottom: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AIWorkoutPlanComponent;
