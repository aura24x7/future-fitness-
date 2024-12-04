import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { Text } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Exercise } from '../types/workout';
import { manualWorkoutService } from '../services/manualWorkoutService';
import { generateUUID } from '../utils/uuid';

interface ManualWorkoutFormProps {
  onSave: () => void;
  onCancel: () => void;
}

export const ManualWorkoutForm: React.FC<ManualWorkoutFormProps> = ({
  onSave,
  onCancel,
}) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutName, setWorkoutName] = useState('');
  const [currentExercise, setCurrentExercise] = useState<Partial<Exercise>>({
    name: '',
    sets: 3,
    reps: 10,
    type: 'repetition',
  });

  const addExercise = () => {
    if (!currentExercise.name) {
      Alert.alert('Error', 'Please enter exercise name');
      return;
    }

    const newExercise: Exercise = {
      id: generateUUID(),
      name: currentExercise.name,
      sets: currentExercise.sets || 3,
      reps: currentExercise.reps || 10,
      type: 'repetition',
      completed: false,
    };

    setExercises([...exercises, newExercise]);
    setCurrentExercise({
      name: '',
      sets: 3,
      reps: 10,
      type: 'repetition',
    });
  };

  const handleSave = async () => {
    if (!workoutName) {
      Alert.alert('Error', 'Please enter workout name');
      return;
    }

    if (exercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    try {
      await manualWorkoutService.createManualWorkout({
        name: workoutName,
        exercises,
        type: 'strength',
        timestamp: Date.now(),
        date: new Date().toISOString().split('T')[0],
        duration: 0,
        calories: 0,
        baseCalories: 0,
        completed: false,
        completedExercises: 0,
        totalExercises: exercises.length,
        createdBy: 'current-user', // TODO: Replace with actual user ID
      });

      Alert.alert('Success', 'Workout created successfully');
      onSave();
    } catch (error) {
      Alert.alert('Error', 'Failed to create workout');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Create Manual Workout</Text>
        
        {/* Workout Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Workout Name</Text>
          <TextInput
            style={styles.input}
            value={workoutName}
            onChangeText={setWorkoutName}
            placeholder="Enter workout name"
          />
        </View>

        {/* Exercise List */}
        {exercises.map((exercise, index) => (
          <View key={exercise.id} style={styles.exerciseItem}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.exerciseDetails}>
              {exercise.sets} sets × {exercise.reps} reps
            </Text>
            <TouchableOpacity
              onPress={() => {
                const newExercises = [...exercises];
                newExercises.splice(index, 1);
                setExercises(newExercises);
              }}
              style={styles.removeButton}
            >
              <Ionicons name="close-circle" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Add Exercise Form */}
        <View style={styles.addExerciseForm}>
          <TextInput
            style={styles.input}
            value={currentExercise.name}
            onChangeText={(text) => setCurrentExercise({ ...currentExercise, name: text })}
            placeholder="Exercise name"
          />
          <View style={styles.numberInputsRow}>
            <View style={styles.numberInput}>
              <Text style={styles.label}>Sets</Text>
              <TextInput
                style={styles.smallInput}
                value={String(currentExercise.sets)}
                onChangeText={(text) => 
                  setCurrentExercise({ ...currentExercise, sets: parseInt(text) || 0 })
                }
                keyboardType="numeric"
              />
            </View>
            <View style={styles.numberInput}>
              <Text style={styles.label}>Reps</Text>
              <TextInput
                style={styles.smallInput}
                value={String(currentExercise.reps)}
                onChangeText={(text) =>
                  setCurrentExercise({ ...currentExercise, reps: parseInt(text) || 0 })
                }
                keyboardType="numeric"
              />
            </View>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={addExercise}>
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              style={styles.addButtonGradient}
            >
              <Text style={styles.addButtonText}>Add Exercise</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Save/Cancel Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.saveButtonGradient}
            >
              <Text style={styles.saveButtonText}>Save Workout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  form: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 16,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
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
  exerciseName: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
  },
  addExerciseForm: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
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
  numberInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  numberInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  smallInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 16,
  },
  addButton: {
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  addButtonGradient: {
    padding: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    padding: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
