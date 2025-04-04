import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Text, Button, YStack, XStack, Card } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { useTheme } from '../../theme/ThemeProvider';
import { useWorkout } from '../../contexts/WorkoutContext';
import { WorkoutPlan, DayPlan, ExerciseProgress, WorkoutCompletion } from '../../types/workout';
import ExerciseDetail from '../../components/workout/ExerciseDetail';
import ExerciseTracker from '../../components/workout/ExerciseTracker';
import { exerciseProgressService } from '../../services/exerciseProgressService';
import { format } from 'date-fns';

type WorkoutTrackingScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'WorkoutTracking'>;
  route: RouteProp<RootStackParamList, 'WorkoutTracking'>;
};

const WorkoutTrackingScreen: React.FC<WorkoutTrackingScreenProps> = ({
  navigation,
  route,
}) => {
  const { planId, dayIndex } = route.params;
  const { colors } = useTheme();
  const { workoutPlans } = useWorkout();
  
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [dayPlan, setDayPlan] = useState<DayPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackedExercises, setTrackedExercises] = useState<Record<string, ExerciseProgress>>({});
  const [isCompletingWorkout, setIsCompletingWorkout] = useState(false);

  useEffect(() => {
    loadWorkoutPlan();
  }, [planId, dayIndex, workoutPlans]);

  const loadWorkoutPlan = () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const plan = workoutPlans.find(p => p.id === planId);
      if (!plan) {
        setError('Workout plan not found');
        return;
      }
      
      setWorkoutPlan(plan);
      
      if (dayIndex < 0 || dayIndex >= plan.days.length) {
        setError('Invalid day index');
        return;
      }
      
      const day = plan.days[dayIndex];
      if (day.isRestDay) {
        setError('Cannot track a rest day');
        return;
      }
      
      setDayPlan(day);
    } catch (err) {
      console.error('Failed to load workout plan:', err);
      setError('Failed to load workout plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExerciseCompleted = (exerciseId: string, progress: ExerciseProgress) => {
    setTrackedExercises(prev => ({
      ...prev,
      [exerciseId]: progress,
    }));
  };

  const handleCompleteWorkout = async () => {
    if (!workoutPlan || !dayPlan) return;
    
    // Check if all exercises have been tracked
    const exerciseCount = dayPlan.exercises.length;
    const trackedCount = Object.keys(trackedExercises).length;
    
    if (trackedCount < exerciseCount) {
      Alert.alert(
        'Incomplete Workout',
        `You've only tracked ${trackedCount} out of ${exerciseCount} exercises. Do you want to continue?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Complete Anyway',
            onPress: completeWorkout,
          },
        ]
      );
    } else {
      completeWorkout();
    }
  };

  const completeWorkout = async () => {
    try {
      setIsCompletingWorkout(true);
      
      if (!workoutPlan || !dayPlan) {
        throw new Error('Workout plan not found');
      }
      
      // Calculate total calories burned and duration
      let totalCalories = 0;
      let totalDuration = 0;
      
      dayPlan.exercises.forEach(exercise => {
        totalCalories += exercise.caloriesBurned || 0;
        totalDuration += exercise.workoutDuration || 0;
      });
      
      // Create workout completion record
      const completion: Omit<WorkoutCompletion, 'id'> = {
        planId: workoutPlan.id,
        userId: '', // Will be set by the service
        dayIndex,
        completedDate: new Date(),
        totalExercises: dayPlan.exercises.length,
        completedExercises: Object.keys(trackedExercises).length,
        duration: totalDuration,
        caloriesBurned: totalCalories,
        notes: `Completed ${dayPlan.dayName}'s workout from "${workoutPlan.name}"`,
      };
      
      await exerciseProgressService.recordWorkoutCompletion(completion);
      
      // Navigate back to workouts screen
      Alert.alert(
        'Workout Completed!',
        `Great job completing your ${dayPlan.dayName} workout!`,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('Workouts');
            },
          },
        ]
      );
    } catch (err) {
      console.error('Failed to complete workout:', err);
      Alert.alert('Error', 'Failed to record workout completion. Please try again.');
    } finally {
      setIsCompletingWorkout(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 16, color: colors.text }}>
            Loading workout...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !workoutPlan || !dayPlan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={36} color="#EF4444" />
          <Text style={{ marginTop: 16, color: '#EF4444', textAlign: 'center' }}>
            {error || 'Failed to load workout plan'}
          </Text>
          <Button 
            marginTop={20}
            onPress={() => navigation.goBack()}
          >
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const completedExercises = Object.keys(trackedExercises).length;
  const totalExercises = dayPlan.exercises.length;
  const progressPercentage = Math.round((completedExercises / totalExercises) * 100);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <YStack>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {dayPlan.dayName}'s Workout
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {workoutPlan.name}
          </Text>
        </YStack>
        <Text style={{ color: colors.primary, fontSize: 16, fontWeight: 'bold' }}>
          {format(new Date(), 'MMM d, yyyy')}
        </Text>
      </View>

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <XStack justifyContent="space-between" alignItems="center" width="100%">
          <Text style={{ color: colors.text, fontSize: 16 }}>
            Progress: {completedExercises}/{totalExercises} exercises
          </Text>
          <Text style={{ color: colors.text, fontWeight: 'bold' }}>
            {progressPercentage}%
          </Text>
        </XStack>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${progressPercentage}%`,
                backgroundColor: colors.primary,
              }
            ]} 
          />
        </View>
      </View>

      {/* Exercise list and trackers */}
      <ScrollView style={styles.scrollContainer}>
        <YStack space="$6" padding="$4">
          {dayPlan.exercises.map((exercise, index) => {
            const exerciseId = `${planId}-${dayIndex}-${index}`;
            const isTracked = !!trackedExercises[exerciseId];
            
            return (
              <YStack key={index} space="$4">
                <Card bordered style={{ backgroundColor: colors.cardBackground, borderColor: colors.border }}>
                  <Card.Header>
                    <XStack justifyContent="space-between" alignItems="center" width="100%">
                      <Text fontSize={18} fontWeight="bold" color={colors.text}>
                        {index + 1}. {exercise.exerciseName}
                      </Text>
                      {isTracked && (
                        <Ionicons name="checkmark-circle" size={24} color="rgb(34, 197, 94)" />
                      )}
                    </XStack>
                  </Card.Header>
                  <Card.Footer>
                    <ExerciseDetail
                      exercise={exercise}
                      showActions={false}
                    />
                  </Card.Footer>
                </Card>

                <ExerciseTracker
                  planId={planId}
                  dayIndex={dayIndex}
                  exercise={exercise}
                  exerciseId={exerciseId}
                  onComplete={(progress) => handleExerciseCompleted(exerciseId, progress)}
                />
              </YStack>
            );
          })}

          {/* Complete workout button */}
          <Button
            backgroundColor={colors.primary}
            color="white"
            size="$5"
            marginTop="$4"
            marginBottom="$8"
            disabled={isCompletingWorkout || completedExercises === 0}
            onPress={handleCompleteWorkout}
          >
            {isCompletingWorkout ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text fontSize={16} fontWeight="bold" color="white">
                Complete Workout
              </Text>
            )}
          </Button>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  progressBar: {
    height: 8,
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  scrollContainer: {
    flex: 1,
  },
});

export default WorkoutTrackingScreen; 