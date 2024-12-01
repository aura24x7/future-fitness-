import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Text, YStack } from 'tamagui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WorkoutPlanLoadingScreen from '../components/WorkoutPlanLoadingScreen';
import { workoutService, WorkoutPreferences, WeeklyWorkoutPlan, Exercise, DailyWorkout } from '../services/ai/workout.service';
import { LinearGradient } from 'expo-linear-gradient';
import { format, isToday } from 'date-fns';
import DateSelector from '../components/DateSelector';
import { WorkoutStats } from '../components/WorkoutStats';

type Props = NativeStackScreenProps<RootStackParamList, 'Workout'>;

const STORAGE_KEY = '@workout_plans';
const STATS_STORAGE_KEY = '@workout_stats';

interface WorkoutStats {
  caloriesBurned: number;
  timeSpentMinutes: number;
}

const getDayOfWeek = (date: Date): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

const WorkoutScreen: React.FC<Props> = ({ navigation }) => {
  const [weeklyWorkoutPlan, setWeeklyWorkoutPlan] = useState<WeeklyWorkoutPlan | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(getDayOfWeek(new Date()));
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<WorkoutStats>({
    caloriesBurned: 0,
    timeSpentMinutes: 0
  });

  // Update selected day when date changes
  useEffect(() => {
    const dayOfWeek = getDayOfWeek(selectedDate);
    if (dayOfWeek !== selectedDay) {
      setSelectedDay(dayOfWeek);
    }
  }, [selectedDate]);

  // Load workout plan from storage
  useEffect(() => {
    const loadWorkoutPlan = async () => {
      try {
        const storedPlan = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedPlan) {
          setWeeklyWorkoutPlan(JSON.parse(storedPlan));
        }
      } catch (error) {
        console.error('Error loading workout plan:', error);
        setError('Failed to load workout plan');
      }
    };

    loadWorkoutPlan();
  }, []);

  // Load stats from storage
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const storedStats = await AsyncStorage.getItem(STATS_STORAGE_KEY);
      if (storedStats) {
        setStats(JSON.parse(storedStats));
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const saveStats = async (newStats: WorkoutStats) => {
    try {
      await AsyncStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(newStats));
      setStats(newStats);
    } catch (error) {
      console.error('Error saving stats:', error);
    }
  };

  const handleWorkoutComplete = (workout: Exercise) => {
    // Estimate calories burned (this is a simple calculation, you might want to make it more sophisticated)
    const estimatedCalories = workout.duration * 5; // 5 calories per minute as a simple example
    const newStats = {
      caloriesBurned: stats.caloriesBurned + estimatedCalories,
      timeSpentMinutes: stats.timeSpentMinutes + workout.duration
    };
    saveStats(newStats);
    Alert.alert('Workout Completed', 'Great job! Your stats have been updated.');
  };

  // Generate new workout plan
  const generateWorkoutPlan = useCallback(async () => {
    try {
      setIsGeneratingPlan(true);
      setError(null);

      const preferences: WorkoutPreferences = {
        fitnessLevel: 'intermediate',
        goals: ['strength', 'endurance'],
        equipment: ['bodyweight', 'dumbbells'],
        duration: 45,
        focusAreas: ['full body'],
        limitations: []
      };

      const newPlan = await workoutService.generateWeeklyWorkoutPlan(preferences);
      
      if (!newPlan || !newPlan.weeklyPlan || newPlan.weeklyPlan.length === 0) {
        throw new Error('Failed to generate a valid workout plan');
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPlan));
      setWeeklyWorkoutPlan(newPlan);
    } catch (error) {
      console.error('Error generating workout plan:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate workout plan');
      Alert.alert('Error', 'Failed to generate workout plan. Please try again.');
    } finally {
      setIsGeneratingPlan(false);
    }
  }, []);

  // Get current workout based on selected day
  const getCurrentWorkout = useCallback((): DailyWorkout | null => {
    if (!weeklyWorkoutPlan?.weeklyPlan) return null;
    return weeklyWorkoutPlan.weeklyPlan.find(plan => plan.dayOfWeek === selectedDay) || null;
  }, [weeklyWorkoutPlan, selectedDay]);

  const handleExerciseComplete = async (exerciseName: string) => {
    try {
      if (!weeklyWorkoutPlan) return;

      const updatedPlan = { ...weeklyWorkoutPlan };
      const currentWorkoutIndex = updatedPlan.weeklyPlan.findIndex(plan => plan.dayOfWeek === selectedDay);
      if (currentWorkoutIndex === -1) return;

      const workout = updatedPlan.weeklyPlan[currentWorkoutIndex];
      const exerciseIndex = workout.exercises.findIndex(ex => ex.name === exerciseName);
      if (exerciseIndex === -1) return;

      // Toggle exercise completion
      workout.exercises[exerciseIndex].completed = !workout.exercises[exerciseIndex].completed;

      // Update workout completion status
      workout.completed = workout.exercises.every(ex => ex.completed);

      setWeeklyWorkoutPlan(updatedPlan);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlan));
    } catch (error) {
      console.error('Error updating exercise:', error);
      Alert.alert('Error', 'Failed to update exercise status');
    }
  };

  const renderExercise = (exercise: Exercise, index: number) => (
    <TouchableOpacity
      key={`${exercise.name}-${index}`}
      style={[styles.exerciseCard, exercise.completed && styles.completedExercise]}
      onPress={() => handleExerciseComplete(exercise.name)}
    >
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.exerciseDifficulty}>{exercise.difficulty}</Text>
      </View>
      <Text style={styles.exerciseDetails}>
        {exercise.sets} sets × {typeof exercise.reps === 'number' ? `${exercise.reps} reps` : 'AMRAP'}
      </Text>
      <Text style={styles.exerciseInstructions}>{exercise.instructions}</Text>
      <View style={styles.exerciseFooter}>
        <Text style={styles.exerciseCalories}>{exercise.calories} calories</Text>
        <Text style={styles.exerciseEquipment}>{exercise.equipment.join(', ')}</Text>
      </View>
    </TouchableOpacity>
  );

  const currentWorkout = getCurrentWorkout();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <YStack space="$4" padding="$4">
          <DateSelector
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
          
          <WorkoutStats
            caloriesBurned={stats.caloriesBurned}
            timeSpentMinutes={stats.timeSpentMinutes}
          />

          {isGeneratingPlan ? (
            <WorkoutPlanLoadingScreen 
              visible={isGeneratingPlan}
              onSuccess={() => setIsGeneratingPlan(false)}
            />
          ) : !weeklyWorkoutPlan || !currentWorkout ? (
            <YStack space="$4" style={styles.noWorkoutContainer}>
              <Text style={styles.noWorkoutText} color="$gray11">
                No workout plan available. Generate a personalized weekly workout plan to get started!
              </Text>
              <TouchableOpacity 
                style={styles.generateButton}
                onPress={generateWorkoutPlan}
              >
                <LinearGradient
                  colors={['#4CAF50', '#45a049']}
                  style={styles.generateButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.generateButtonText} color="white">Generate Workout Plan</Text>
                </LinearGradient>
              </TouchableOpacity>
            </YStack>
          ) : (
            <ScrollView style={styles.workoutContainer}>
              <View style={styles.workoutHeader}>
                <Text style={styles.workoutTitle}>{currentWorkout.focusArea} Workout</Text>
                <Text style={styles.workoutStats}>
                  Duration: {currentWorkout.totalDuration}min • {currentWorkout.totalCalories} calories
                </Text>
              </View>
              <View style={styles.exerciseList}>
                {currentWorkout.exercises.map((exercise, index) => renderExercise(exercise, index))}
              </View>
              {currentWorkout.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesTitle}>Notes</Text>
                  <Text style={styles.notesText}>{currentWorkout.notes}</Text>
                </View>
              )}
            </ScrollView>
          )}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dateSelector: {
    marginTop: 8,
    marginBottom: 16,
  },
  noWorkoutContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noWorkoutText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  generateButton: {
    width: '100%',
    maxWidth: 300,
    overflow: 'hidden',
    borderRadius: 8,
  },
  generateButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  workoutContainer: {
    flex: 1,
    padding: 16,
  },
  workoutHeader: {
    marginBottom: 16,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  workoutStats: {
    fontSize: 14,
    color: '#6B7280',
  },
  exerciseList: {
    gap: 12,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  completedExercise: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
    borderWidth: 1,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  exerciseDifficulty: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  exerciseInstructions: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
  },
  exerciseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseCalories: {
    fontSize: 12,
    color: '#059669',
  },
  exerciseEquipment: {
    fontSize: 12,
    color: '#6B7280',
  },
  notesContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#4B5563',
  },
});

export default WorkoutScreen;
