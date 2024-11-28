import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutPlan } from '../services/geminiService';
import { format, addDays, subDays, isToday } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  workoutPlan: WorkoutPlan[];
  isLoading: boolean;
  onGenerateNew: () => void;
  onAddCustomExercise: () => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onExerciseComplete: (dayIndex: number, exerciseIndex: number, completed: boolean) => void;
}

const AIWorkoutPlan: React.FC<Props> = ({
  workoutPlan,
  isLoading,
  onGenerateNew,
  onAddCustomExercise,
  selectedDate,
  onDateChange,
  onExerciseComplete,
}) => {
  const handlePrevDay = () => {
    onDateChange(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };

  const getCurrentDayWorkout = () => {
    const dayIndex = selectedDate.getDay();
    return workoutPlan[dayIndex];
  };

  const workout = getCurrentDayWorkout();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Crafting your perfect workout...</Text>
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No workout plan available</Text>
        <TouchableOpacity style={styles.generateButton} onPress={onGenerateNew}>
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
          <Text style={styles.generateButtonText}>Generate New Plan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handlePrevDay} style={styles.navButton}>
            <Ionicons name="chevron-back" size={24} color="#6366F1" />
          </TouchableOpacity>
          
          <View style={styles.dateContainer}>
            <Text style={styles.dayText}>{format(selectedDate, 'EEEE')}</Text>
            <Text style={[styles.dateText, isToday(selectedDate) && styles.todayText]}>
              {format(selectedDate, 'MMM d')}
            </Text>
          </View>

          <TouchableOpacity onPress={handleNextDay} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={24} color="#6366F1" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.aiGenerateButton} 
          onPress={onGenerateNew}
          disabled={isLoading}
        >
          <LinearGradient
            colors={['#8B5CF6', '#6366F1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            <Text style={styles.aiGenerateText}>AI Plan</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={20} color="#6366F1" />
          <View style={styles.statValues}>
            <Text style={styles.statValue}>{workout.completedDuration}/{workout.totalDuration} min</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="flame-outline" size={20} color="#6366F1" />
          <View style={styles.statValues}>
            <Text style={styles.statValue}>{workout.completedCalories}/{workout.totalCalories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Text style={styles.focusArea}>{workout.focusArea}</Text>
          <TouchableOpacity 
            style={styles.addCustomButton}
            onPress={onAddCustomExercise}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="add" size={24} color="#6366F1" />
            <Text style={styles.addCustomButtonText}>Add Workout</Text>
          </TouchableOpacity>
        </View>
        
        {workout.exercises.map((exercise, index) => (
          <TouchableOpacity 
            key={index} 
            style={[
              styles.exerciseCard,
              exercise.completed && styles.exerciseCardCompleted
            ]}
            onPress={() => onExerciseComplete(selectedDate.getDay(), index, !exercise.completed)}
          >
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseNameContainer}>
                <Ionicons 
                  name={exercise.completed ? "checkmark-circle" : "ellipse-outline"} 
                  size={24} 
                  color={exercise.completed ? "#10B981" : "#6B7280"} 
                  style={styles.checkIcon}
                />
                <Text style={[
                  styles.exerciseName,
                  exercise.completed && styles.exerciseNameCompleted
                ]}>{exercise.name}</Text>
              </View>
              <View style={styles.exerciseStats}>
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text style={styles.exerciseStatText}>{exercise.duration}m</Text>
                <Ionicons name="flame-outline" size={16} color="#6B7280" style={styles.statIcon} />
                <Text style={styles.exerciseStatText}>{exercise.calories}</Text>
              </View>
            </View>
            
            <View style={styles.exerciseDetails}>
              <Text style={styles.setsReps}>
                {exercise.sets} sets × {exercise.reps}
              </Text>
              {exercise.notes && (
                <Text style={styles.exerciseNotes}>{exercise.notes}</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateContainer: {
    alignItems: 'center',
  },
  dayText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 2,
  },
  todayText: {
    color: '#6366F1',
    fontWeight: '600',
  },
  navButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    marginHorizontal: 16,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  statValues: {
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  focusArea: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  exerciseNameCompleted: {
    color: '#10B981',
  },
  checkIcon: {
    marginRight: 8,
  },
  exerciseStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseStatText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
    marginRight: 8,
  },
  statIcon: {
    marginLeft: 8,
  },
  exerciseDetails: {
    marginTop: 4,
  },
  setsReps: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 4,
  },
  exerciseNotes: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  exerciseCardCompleted: {
    backgroundColor: '#F9FAF9',
    borderColor: '#10B981',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingRight: 8,
  },
  addCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  addCustomButtonText: {
    color: '#6366F1',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 4,
  },
  aiGenerateButton: {
    width: '100%',
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  gradientButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  aiGenerateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AIWorkoutPlan;
