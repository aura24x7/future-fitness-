import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Text, YStack } from 'tamagui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WorkoutPlanLoadingScreen from '../components/WorkoutPlanLoadingScreen';
import { workoutService, WorkoutPreferences, WeeklyWorkoutPlan, Exercise, DailyWorkout } from '../services/ai/workout.service';
import { manualWorkoutService } from '../services/manualWorkoutService';
import { LinearGradient } from 'expo-linear-gradient';
import { format, isToday } from 'date-fns';
import DateSelector from '../components/DateSelector';
import { WorkoutStats } from '../components/WorkoutStats';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ManualWorkoutModal } from '../components/ManualWorkoutModal';

type Props = NativeStackScreenProps<RootStackParamList, 'Workout'>;

const STORAGE_KEY = '@workout_plans';
const STATS_STORAGE_KEY = '@workout_stats';

interface WorkoutStats {
  caloriesBurned: number;
  timeSpentMinutes: number;
}

interface ManualWorkout {
  id: string;
  name: string;
  exercises: Exercise[];
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
  const [isManualWorkoutModalVisible, setIsManualWorkoutModalVisible] = useState(false);
  const [manualWorkouts, setManualWorkouts] = useState<ManualWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load manual workouts
  const loadManualWorkouts = useCallback(async () => {
    try {
      setIsLoading(true);
      const workouts = await manualWorkoutService.getManualWorkouts();
      setManualWorkouts(workouts || []);
    } catch (error) {
      console.error('Error loading manual workouts:', error);
      Alert.alert('Error', 'Failed to load workouts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load manual workouts on mount
  useEffect(() => {
    loadManualWorkouts();
  }, [loadManualWorkouts]);

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={['#F0F9FF', '#E0F2FE']}
            style={styles.headerGradient}
          >
            <DateSelector
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
            
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#F0FDF4', '#DCFCE7']}
                  style={styles.statGradient}
                >
                  <Text style={styles.statLabel}>Calories Burned</Text>
                  <Text style={styles.statValue}>{stats.caloriesBurned}</Text>
                </LinearGradient>
              </View>
              
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#EFF6FF', '#DBEAFE']}
                  style={styles.statGradient}
                >
                  <Text style={styles.statLabel}>Minutes Active</Text>
                  <Text style={styles.statValue}>{stats.timeSpentMinutes}</Text>
                </LinearGradient>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.manualButton]}
                onPress={() => setIsManualWorkoutModalVisible(true)}
              >
                <LinearGradient
                  colors={['#3B82F6', '#2563EB']}
                  style={styles.actionButtonGradient}
                >
                  <View style={styles.actionButtonContent}>
                    <Ionicons name="add-circle" size={20} color="white" style={styles.actionIcon} />
                    <Text style={styles.actionButtonText}>Add Manual Workout</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, { opacity: 0.8 }]}
                onPress={() => Alert.alert(
                  'Coming Soon!',
                  'AI-powered workout plan generation will be available in the next update. Stay tuned!',
                  [{ text: 'OK', style: 'default' }]
                )}
              >
                <LinearGradient
                  colors={['#6B7280', '#4B5563']}
                  style={styles.actionButtonGradient}
                >
                  <View style={styles.actionButtonContent}>
                    <Ionicons name="lock-closed" size={20} color="white" style={styles.actionIcon} />
                    <Text style={styles.actionButtonText}>Generate AI Workout</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.mainContent}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Loading workouts...</Text>
            </View>
          ) : manualWorkouts.length > 0 ? (
            <View style={styles.workoutList}>
              {manualWorkouts.map((workout) => (
                <View key={workout.id} style={styles.workoutCard}>
                  <View style={styles.workoutHeader}>
                    <Text style={styles.workoutTitle}>{workout.name}</Text>
                    <View style={styles.workoutActions}>
                      <TouchableOpacity 
                        style={styles.shareButton}
                        onPress={() => {
                          navigation.navigate('Groups', { 
                            screen: 'ShareWorkout',
                            params: { workoutId: workout.id }
                          });
                        }}
                      >
                        <Ionicons name="share-outline" size={20} color="#3B82F6" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.exerciseList}>
                    {workout.exercises?.map((exercise, index) => (
                      <TouchableOpacity
                        key={`${workout.id}-${exercise.id || index}`}
                        style={[
                          styles.exerciseItem,
                          exercise.completed && styles.completedExercise
                        ]}
                        onPress={() => {
                          manualWorkoutService.markExerciseComplete(
                            workout.id,
                            exercise.id,
                            !exercise.completed
                          ).then(loadManualWorkouts);
                        }}
                      >
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        <Text style={styles.exerciseDetails}>
                          {exercise.sets} sets × {exercise.reps} reps
                        </Text>
                        <Ionicons
                          name={exercise.completed ? "checkmark-circle" : "ellipse-outline"}
                          size={24}
                          color={exercise.completed ? "#10B981" : "#94A3B8"}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="fitness-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyStateText}>
                No workouts planned for this day
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Add a manual workout or wait for AI-generated workouts!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <ManualWorkoutModal
        visible={isManualWorkoutModalVisible}
        onClose={() => setIsManualWorkoutModalVisible(false)}
        onSave={() => {
          loadManualWorkouts();
          setIsManualWorkoutModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748B',
  },
  headerContainer: {
    marginBottom: 16,
  },
  headerGradient: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    marginHorizontal: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 16,
    overflow: 'hidden',
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
  statGradient: {
    padding: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  mainContent: {
    paddingHorizontal: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 4,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    padding: 12,
    alignItems: 'center',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  workoutList: {
    paddingTop: 8,
  },
  workoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
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
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  workoutActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareButton: {
    padding: 8,
  },
  exerciseList: {
    marginTop: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  completedExercise: {
    opacity: 0.7,
  },
  exerciseName: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  exerciseDetails: {
    marginRight: 12,
    fontSize: 14,
    color: '#64748B',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default WorkoutScreen;
