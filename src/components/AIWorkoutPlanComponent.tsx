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
import { useTheme } from 'tamagui';

interface Props {
  workoutPlan: AIWorkoutPlanType | null;
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
  const theme = useTheme();
  const [error, setError] = useState<string | null>(null);

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
      <View style={[styles.errorContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.errorText }]}>
          {error}
        </Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: theme.primary }]}
          onPress={() => setError(null)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!workoutPlan) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.noWorkoutContainer}>
          <Text style={[styles.noWorkoutText, { color: theme.text }]}>
            No workout plan for this day
          </Text>
          <TouchableOpacity
            style={[styles.generateButton, { backgroundColor: theme.primary }]}
            onPress={onGenerateNew}
          >
            <Text style={styles.generateButtonText}>Generate Workout Plan</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.dateSelector, { 
        backgroundColor: theme.headerBackground,
        borderBottomColor: theme.border 
      }]}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => handleDateChange(subDays(selectedDate, 1))}
        >
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        
        <View style={styles.dateInfo}>
          <Text style={[styles.dateText, { color: theme.text }]}>
            {format(selectedDate, 'MMMM d')}
          </Text>
          <Text style={[styles.dayText, { color: theme.textSecondary }]}>
            {format(selectedDate, 'EEEE')}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => handleDateChange(addDays(selectedDate, 1))}
          disabled={isToday(selectedDate)}
        >
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={isToday(selectedDate) ? theme.textDisabled : theme.text} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.workoutHeader}>
          <View>
            <Text style={[styles.workoutName, { color: theme.text }]}>
              {workoutPlan.name}
            </Text>
            {workoutPlan.description && (
              <Text style={[styles.workoutDescription, { color: theme.textSecondary }]}>
                {workoutPlan.description}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={onAddCustomExercise}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Duration</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {workoutPlan.completedDuration} / {workoutPlan.totalDuration} min
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Calories</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {workoutPlan.completedCalories} / {workoutPlan.totalCalories} kcal
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Exercises</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {workoutPlan.completedExercises} / {workoutPlan.exercises.length}
            </Text>
          </View>
        </View>

        <View style={styles.exerciseList}>
          {workoutPlan.exercises.map((exercise, index) => (
            <LinearGradient
              key={exercise.id}
              colors={[
                exercise.completed 
                  ? colors.progress.success.light 
                  : colors.background.card.light,
                exercise.completed 
                  ? colors.progress.success.dark 
                  : colors.background.card.dark
              ]}
              style={[
                styles.exerciseCard,
                index === 0 && styles.firstExerciseCard,
                { 
                  borderColor: isDarkMode ? colors.border.dark : colors.border.light,
                  borderWidth: 1
                }
              ]}
            >
              <TouchableOpacity
                style={styles.exerciseCardContent}
                onPress={() => handleExerciseComplete(exercise.id)}
              >
                <View style={styles.exerciseHeader}>
                  <Text style={[
                    styles.exerciseName,
                    { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
                  ]}>
                    {exercise.name}
                  </Text>
                  {exercise.completed && (
                    <Ionicons 
                      name="checkmark-circle" 
                      size={24} 
                      color={isDarkMode ? colors.progress.success.dark : colors.progress.success.light} 
                    />
                  )}
                </View>
                
                <Text style={[
                  styles.exerciseDescription,
                  { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }
                ]}>
                  {exercise.description}
                </Text>

                <View style={styles.exerciseDetails}>
                  <View style={styles.exerciseDetail}>
                    <Text style={[
                      styles.detailLabel,
                      { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }
                    ]}>
                      Sets
                    </Text>
                    <Text style={[
                      styles.detailValue,
                      { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
                    ]}>
                      {exercise.sets}
                    </Text>
                  </View>
                  <View style={styles.exerciseDetail}>
                    <Text style={[
                      styles.detailLabel,
                      { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }
                    ]}>
                      {exercise.duration ? 'Duration' : 'Reps'}
                    </Text>
                    <Text style={[
                      styles.detailValue,
                      { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
                    ]}>
                      {exercise.duration ? `${exercise.duration}s` : exercise.reps}
                    </Text>
                  </View>
                  <View style={styles.exerciseDetail}>
                    <Text style={[
                      styles.detailLabel,
                      { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }
                    ]}>
                      Rest
                    </Text>
                    <Text style={[
                      styles.detailValue,
                      { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
                    ]}>
                      {exercise.restPeriod}s
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          ))}
        </View>
      </ScrollView>
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
  dateInfo: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
  },
  dayText: {
    fontSize: 14,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  workoutName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  workoutDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseList: {
    padding: 16,
  },
  exerciseCard: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  firstExerciseCard: {
    marginTop: 0,
  },
  exerciseCardContent: {
    padding: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
  },
  exerciseDescription: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 12,
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exerciseDetail: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noWorkoutContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  noWorkoutText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  generateButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AIWorkoutPlanComponent;
