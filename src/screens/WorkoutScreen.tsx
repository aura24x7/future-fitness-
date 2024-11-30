import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { AIWorkoutPlanComponent } from '../components/AIWorkoutPlanComponent';
import { GeminiService } from '../services/ai/core/gemini.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutPlanLoadingScreen } from '../components/WorkoutPlanLoadingScreen';
import { AIWorkoutPlan, Exercise } from '../types/workout';
import { TestDataButton } from '../components/TestDataButton';
import { ShareWorkoutModal } from '../components/ShareWorkoutModal';

type Props = NativeStackScreenProps<RootStackParamList, 'Workout'>;

const STORAGE_KEY = '@workout_plans';
const DEFAULT_WORKOUT_DAYS = 7;

const WorkoutScreen: React.FC<Props> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [aiWorkoutPlan, setAiWorkoutPlan] = useState<AIWorkoutPlan[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const loadWorkoutPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedPlans = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedPlans) {
        setAiWorkoutPlan(JSON.parse(storedPlans));
      } else {
        // Generate initial workout plan if none exists
        await generateWorkoutPlan();
      }
    } catch (error) {
      console.error('Error loading workout plans:', error);
      setError('Failed to load workout plans');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkoutPlans();
  }, [loadWorkoutPlans]);

  const saveWorkoutPlans = async (plans: AIWorkoutPlan[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
    } catch (error) {
      console.error('Error saving workout plans:', error);
      Alert.alert('Error', 'Failed to save workout plans');
    }
  };

  const generateWorkoutPlan = useCallback(async () => {
    try {
      setIsGeneratingPlan(true);
      setError(null);
      
      const focusAreas = [
        'Chest and Triceps',
        'Back and Biceps',
        'Legs',
        'Shoulders and Abs',
        'Full Body HIIT',
        'Cardio',
        'Recovery and Mobility'
      ];

      const newWorkoutPlan: AIWorkoutPlan[] = [];
      
      for (let i = 0; i < DEFAULT_WORKOUT_DAYS; i++) {
        try {
          const plan = await GeminiService.generateWorkoutPlan({
            fitnessLevel: 'intermediate',
            duration: 45,
            equipment: ['dumbbells', 'bodyweight'],
            focusAreas: [focusAreas[i]],
            goals: ['strength', 'endurance']
          });

          // Set the day index
          plan.day = i;
          plan.date = new Date().toISOString().split('T')[0];
          newWorkoutPlan.push(plan);

        } catch (error) {
          console.error(`Failed to generate workout for day ${i}:`, error);
          throw new Error(`Failed to generate workout for ${focusAreas[i]}`);
        }
      }

      if (newWorkoutPlan.length !== DEFAULT_WORKOUT_DAYS) {
        throw new Error('Failed to generate complete workout plan');
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newWorkoutPlan));
      setAiWorkoutPlan(newWorkoutPlan);
    } catch (error) {
      console.error('Error generating workout plan:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate workout plan');
      Alert.alert('Error', 'Failed to generate workout plan. Please try again.');
    } finally {
      setIsGeneratingPlan(false);
    }
  }, []);

  const handleGenerationSuccess = async () => {
    setIsGeneratingPlan(false);
    Alert.alert('Success', 'New workout plan generated!');
  };

  const handleExerciseComplete = async (exerciseId: string) => {
    try {
      const updatedPlans = [...aiWorkoutPlan];
      const currentDate = selectedDate.toISOString().split('T')[0];
      
      // Find the workout for the selected date
      const workoutIndex = updatedPlans.findIndex(plan => 
        plan.date.split('T')[0] === currentDate
      );
      
      if (workoutIndex === -1) {
        throw new Error('No workout found for selected date');
      }

      const workout = updatedPlans[workoutIndex];
      const exerciseIndex = workout.exercises.findIndex(ex => ex.id === exerciseId);
      
      if (exerciseIndex === -1) {
        throw new Error('Exercise not found');
      }

      // Toggle exercise completion
      const exercise = workout.exercises[exerciseIndex];
      exercise.completed = !exercise.completed;

      // Update workout stats
      if (exercise.completed) {
        workout.completedExercises = (workout.completedExercises || 0) + 1;
        workout.completedDuration = (workout.completedDuration || 0) + (exercise.duration || 0);
        workout.completedCalories = (workout.completedCalories || 0) + (exercise.caloriesPerRep || 0);
      } else {
        workout.completedExercises = (workout.completedExercises || 0) - 1;
        workout.completedDuration = (workout.completedDuration || 0) - (exercise.duration || 0);
        workout.completedCalories = (workout.completedCalories || 0) - (exercise.caloriesPerRep || 0);
      }

      setAiWorkoutPlan(updatedPlans);
      await saveWorkoutPlans(updatedPlans);
    } catch (error) {
      console.error('Error updating exercise:', error);
      Alert.alert('Error', 'Failed to update exercise status');
    }
  };

  const handleAddCustomExercise = async () => {
    try {
      // Navigate to custom exercise form
      navigation.navigate('AddExercise', {
        onSave: async (exercise: Exercise) => {
          const updatedPlans = [...aiWorkoutPlan];
          const currentDate = selectedDate.toISOString().split('T')[0];
          
          // Find the workout for the selected date
          const workoutIndex = updatedPlans.findIndex(plan => 
            plan.date.split('T')[0] === currentDate
          );
          
          if (workoutIndex === -1) {
            throw new Error('No workout found for selected date');
          }

          const workout = updatedPlans[workoutIndex];
          const newExercise = {
            ...exercise,
            id: `custom-${Date.now()}`,
            completed: false,
            duration: exercise.duration || 0,
            caloriesPerRep: exercise.caloriesPerRep || 0,
          };

          workout.exercises.push(newExercise);
          
          setAiWorkoutPlan(updatedPlans);
          await saveWorkoutPlans(updatedPlans);
          Alert.alert('Success', 'Custom exercise added to your workout!');
        },
      });
    } catch (error) {
      console.error('Error adding custom exercise:', error);
      Alert.alert('Error', 'Failed to add custom exercise');
    }
  };

  const handleShareWorkout = () => {
    setShowShareModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Workout Plan</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleShareWorkout}
            disabled={!aiWorkoutPlan || aiWorkoutPlan.length === 0}
          >
            <Text style={[styles.shareButtonText, (!aiWorkoutPlan || aiWorkoutPlan.length === 0) && styles.disabledText]}>Share</Text>
          </TouchableOpacity>
          <TestDataButton />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading your workout plan...</Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {aiWorkoutPlan && aiWorkoutPlan.length > 0 ? (
            <AIWorkoutPlanComponent
              workoutPlan={aiWorkoutPlan}
              isLoading={isGeneratingPlan}
              onGenerateNew={generateWorkoutPlan}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onAddCustomExercise={handleAddCustomExercise}
              onExerciseComplete={handleExerciseComplete}
            />
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>No workout plan available</Text>
              <TouchableOpacity 
                style={styles.generateButton}
                onPress={generateWorkoutPlan}
                disabled={isGeneratingPlan}
              >
                {isGeneratingPlan ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.generateButtonText}>Generate Plan</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <ShareWorkoutModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        workoutPlan={aiWorkoutPlan && aiWorkoutPlan.length > 0 ? aiWorkoutPlan[0] : null}
        currentUserId="user123"
        currentUserName="Test User"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  disabledText: {
    opacity: 0.5,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  generateButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WorkoutScreen;
