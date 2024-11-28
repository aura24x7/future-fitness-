import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Text,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import AIWorkoutPlan from '../components/AIWorkoutPlan';
import { geminiService, WorkoutPlan, Exercise } from '../services/geminiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WorkoutPlanLoadingScreen from '../components/WorkoutPlanLoadingScreen';
import { workoutTrackingService } from '../services/workoutTrackingService';
import Ionicons from 'react-native-vector-icons/Ionicons';

const STORAGE_KEY = '@workout_plan';

const EMPTY_WORKOUT_PLAN: WorkoutPlan[] = Array(7).fill(null).map((_, index) => ({
  day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][index],
  focusArea: '',
  totalDuration: 0,
  totalCalories: 0,
  completedDuration: 0,
  completedCalories: 0,
  exercises: [],
}));

type Props = NativeStackScreenProps<RootStackParamList, 'Workout'>;

const WorkoutScreen: React.FC<Props> = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [aiWorkoutPlan, setAiWorkoutPlan] = useState<WorkoutPlan[]>(EMPTY_WORKOUT_PLAN);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [customExercise, setCustomExercise] = useState<Exercise | null>(null);

  // Load saved workout plan on initial mount
  useEffect(() => {
    loadSavedWorkoutPlan();
  }, []);

  // Handle new exercise when navigating back
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route.params?.newExercise) {
        handleCustomExerciseSave(route.params.newExercise);
        // Clear the params after handling
        navigation.setParams({ newExercise: undefined });
      }
    });

    return unsubscribe;
  }, [navigation, route.params?.newExercise]);

  useEffect(() => {
    if (customExercise) {
      handleCustomExerciseSave(customExercise);
      setCustomExercise(null);
    }
  }, [customExercise]);

  const loadSavedWorkoutPlan = async () => {
    setIsLoading(true);
    try {
      const savedPlan = await workoutTrackingService.loadWorkoutPlan();
      if (savedPlan && savedPlan.length > 0) {
        setAiWorkoutPlan(savedPlan);
      }
    } catch (error) {
      console.error('Error loading workout plan:', error);
      Alert.alert('Error', 'Failed to load workout plan');
    } finally {
      setIsLoading(false);
    }
  };

  const saveWorkoutPlan = async (plan: WorkoutPlan[]) => {
    try {
      await workoutTrackingService.saveWorkoutPlan(plan);
    } catch (error) {
      console.error('Error saving workout plan:', error);
      Alert.alert('Error', 'Failed to save workout plan');
    }
  };

  const generateWorkoutPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const plan = await geminiService.generateWorkoutPlan();
      if (!plan || !Array.isArray(plan)) {
        throw new Error('Invalid workout plan format');
      }
      setAiWorkoutPlan(plan);
      await saveWorkoutPlan(plan);
      handleGenerationSuccess();
    } catch (error) {
      console.error('Error generating workout plan:', error);
      Alert.alert(
        'Error',
        'Failed to generate workout plan. Please try again later.'
      );
      setIsGeneratingPlan(false);
    }
  };

  const handleGenerationSuccess = () => {
    // Keep the loading screen visible but show success state
    setTimeout(() => {
      setIsGeneratingPlan(false);
    }, 2000); // Give time for success animation
  };

  const handleSaveWorkout = async (workout: WorkoutPlan) => {
    try {
      const updatedPlan = [...aiWorkoutPlan];
      const dayIndex = selectedDate.getDay();
      updatedPlan[dayIndex] = workout;
      
      setAiWorkoutPlan(updatedPlan);
      await saveWorkoutPlan(updatedPlan);
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'Failed to save workout');
    }
  };

  const handleExerciseComplete = async (dayIndex: number, exerciseIndex: number, completed: boolean) => {
    try {
      const updatedPlan = [...aiWorkoutPlan];
      const workout = updatedPlan[dayIndex];
      const exercise = workout.exercises[exerciseIndex];
      
      exercise.completed = completed;
      
      // Update completed stats
      workout.completedDuration = workout.exercises.reduce((total, ex) => 
        total + (ex.completed ? ex.duration : 0), 0
      );
      workout.completedCalories = workout.exercises.reduce((total, ex) => 
        total + (ex.completed ? ex.calories : 0), 0
      );
      
      setAiWorkoutPlan(updatedPlan);
      await workoutTrackingService.saveWorkoutPlan(updatedPlan);
    } catch (error) {
      console.error('Error updating exercise completion:', error);
      Alert.alert('Error', 'Failed to update exercise');
    }
  };

  const handleAddCustomExercise = () => {
    try {
      console.log('Attempting to navigate to AddCustomWorkout screen');
      navigation.navigate('AddCustomWorkout', { setCustomExercise });
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Failed to open add workout screen');
    }
  };

  const handleCustomExerciseSave = (exercise: Exercise) => {
    try {
      console.log('Saving custom exercise:', exercise);
      const updatedPlan = [...aiWorkoutPlan];
      const dayIndex = selectedDate.getDay();
      const workout = updatedPlan[dayIndex];
      
      // Add the new exercise
      workout.exercises.push(exercise);
      
      // Update totals
      workout.totalDuration += exercise.duration;
      workout.totalCalories += exercise.calories;
      
      setAiWorkoutPlan(updatedPlan);
      saveWorkoutPlan(updatedPlan);
      
      Alert.alert('Success', 'Custom exercise added to your workout!');
    } catch (error) {
      console.error('Error saving custom exercise:', error);
      Alert.alert('Error', 'Failed to save custom exercise');
    }
  };

  const handleShareWorkout = async () => {
    try {
      if (!aiWorkoutPlan || aiWorkoutPlan.length === 0) {
        Alert.alert('Error', 'No workout available to share');
        return;
      }

      const workoutToShare = {
        id: aiWorkoutPlan[0].id,
        name: aiWorkoutPlan[0].name,
        exercises: aiWorkoutPlan[0].exercises.map(ex => ({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight
        })),
        duration: aiWorkoutPlan[0].estimatedDuration,
        calories: aiWorkoutPlan[0].estimatedCalories
      };

      // Navigate to Groups screen first to select a group
      navigation.navigate('Groups', {
        onGroupSelect: (groupId: string) => {
          navigation.navigate('ShareWorkout', {
            groupId,
            workout: workoutToShare
          });
        }
      });
    } catch (error) {
      console.error('Error sharing workout:', error);
      Alert.alert('Error', 'Failed to share workout. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout Plan</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShareWorkout}
          >
            <Ionicons name="share-outline" size={24} color="#6366F1" />
          </TouchableOpacity>
        </View>
      </View>
      <WorkoutPlanLoadingScreen
        visible={isGeneratingPlan}
        onGenerationComplete={handleGenerationSuccess}
        onSuccess={() => setIsGeneratingPlan(false)}
      />
      {isLoading ? (
        <ActivityIndicator size="large" color="#6366F1" />
      ) : (
        <AIWorkoutPlan
          workoutPlan={aiWorkoutPlan}
          isLoading={false} 
          onGenerateNew={generateWorkoutPlan}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onAddCustomExercise={handleAddCustomExercise}
          onExerciseComplete={handleExerciseComplete}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  shareButton: {
    padding: 8,
  },
});

export default WorkoutScreen;
