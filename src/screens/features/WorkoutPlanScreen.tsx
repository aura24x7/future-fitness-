import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderSimple } from '../../components/HeaderSimple';
import { WorkoutPlanForm } from '../../components/workout/WorkoutPlanForm';
import { WorkoutPlan, DayPlan } from '../../types/workout';
import { workoutPlanService } from '../../services/workoutPlanService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Text, YStack } from 'tamagui';
import { useTheme } from '../../theme/ThemeProvider';

// Default days of the week array
const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const WorkoutPlanScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingPlan, setExistingPlan] = useState<WorkoutPlan | null>(null);
  const [initialData, setInitialData] = useState<Partial<WorkoutPlan> | null>(null);

  // Get planId and dayName from route params
  const params = route.params as any;
  const planId = params?.planId;
  const dayName = params?.dayName;
  const isNewPlan = planId === 'new';

  // Initialize a default plan template if creating a new plan
  useEffect(() => {
    if (isNewPlan) {
      // Create days array with the specified dayName (if provided) as a workout day
      const days: DayPlan[] = DAYS_OF_WEEK.map((day) => ({
        dayName: day,
        isRestDay: dayName ? day !== dayName : true, // Only the selected day is a workout day
        exercises: [],
        notes: '',
      }));

      setInitialData({
        name: dayName ? `${dayName} Workout` : 'New Workout Plan',
        description: '',
        days,
        isShared: false,
        sharedWith: [],
      });
    }
  }, [isNewPlan, dayName]);

  useEffect(() => {
    const loadPlan = async () => {
      if (isNewPlan) return;

      setLoading(true);
      setError(null);
      try {
        const plan = await workoutPlanService.getWorkoutPlan(planId);
        if (plan) {
          setExistingPlan(plan);
        }
      } catch (err) {
        setError('Failed to load workout plan');
        console.error('Error loading workout plan:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [planId, isNewPlan]);

  const handleSubmit = async (plan: Omit<WorkoutPlan, 'id' | 'ownerId' | 'createdAt'>) => {
    setLoading(true);
    setError(null);

    try {
      if (existingPlan) {
        await workoutPlanService.updateWorkoutPlan(existingPlan.id, plan);
      } else {
        await workoutPlanService.createWorkoutPlan(plan);
      }
      navigation.goBack();
    } catch (err) {
      setError('Failed to save workout plan');
      console.error('Error saving workout plan:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isNewPlan && !existingPlan) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#fff' }]} edges={['top']}>
        <HeaderSimple title="Weekly Workout Plan" showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#fff' }]} edges={['top']}>
        <HeaderSimple title="Weekly Workout Plan" showBackButton />
        <YStack space="$4" padding="$4" alignItems="center">
          <Text color="$red10" textAlign="center">
            {error}
          </Text>
        </YStack>
      </SafeAreaView>
    );
  }

  // Use initialData for new plans, or existingPlan for editing
  const planData = isNewPlan ? initialData : existingPlan;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#fff' }]} edges={['top']}>
      <HeaderSimple title={isNewPlan ? "Create Workout Plan" : "Edit Workout Plan"} showBackButton />
      <ScrollView style={[styles.content, { backgroundColor: isDarkMode ? '#121212' : '#fff' }]}>
        <WorkoutPlanForm 
          onSubmit={handleSubmit}
          initialPlan={planData as WorkoutPlan | null}
          isSubmitting={loading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 