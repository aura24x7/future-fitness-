import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AIWorkoutPlan } from '../types/workout';

const STORAGE_KEY = '@workout_plans';

interface Props {
  onDataLoaded?: () => void;
}

export const TestDataButton: React.FC<Props> = ({ onDataLoaded }) => {
  const loadTestData = async () => {
    try {
      const testWorkoutPlan: AIWorkoutPlan[] = [
        {
          id: '1',
          name: 'Full Body Workout',
          description: 'A complete full body workout routine',
          difficulty: 'Intermediate',
          exercises: [
            {
              id: 'ex1',
              name: 'Push-ups',
              description: 'Standard push-ups',
              sets: 3,
              reps: 12,
              completed: false,
            },
            {
              id: 'ex2',
              name: 'Squats',
              description: 'Bodyweight squats',
              sets: 4,
              reps: 15,
              completed: false,
            },
          ],
          date: new Date().toISOString(),
        },
      ];

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(testWorkoutPlan));
      onDataLoaded?.();
    } catch (error) {
      console.error('Error loading test data:', error);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={loadTestData}>
      <Text style={styles.buttonText}>Load Test Data</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
