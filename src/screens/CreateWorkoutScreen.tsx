import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const CreateWorkoutScreen = ({ navigation, route }) => {
  const { type } = route.params;
  const { addWorkout } = useApp();
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState([
    {
      name: '',
      sets: '',
      reps: '',
      weight: '',
      duration: '',
      distance: '',
      type: type,
      completed: false,
    },
  ]);

  const handleAddExercise = () => {
    setExercises([
      ...exercises,
      {
        name: '',
        sets: '',
        reps: '',
        weight: '',
        duration: '',
        distance: '',
        type: type,
        completed: false,
      },
    ]);
  };

  const updateExercise = (index, field, value) => {
    const updatedExercises = [...exercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value,
    };
    setExercises(updatedExercises);
  };

  const removeExercise = (index) => {
    if (exercises.length === 1) {
      Alert.alert('Cannot Remove', 'Workout must have at least one exercise');
      return;
    }
    const updatedExercises = exercises.filter((_, i) => i !== index);
    setExercises(updatedExercises);
  };

  const handleSave = () => {
    if (!workoutName.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }

    if (exercises.some(e => !e.name.trim())) {
      Alert.alert('Error', 'Please enter names for all exercises');
      return;
    }

    const newWorkout = {
      id: Date.now().toString(),
      name: workoutName,
      type: type,
      exercises: exercises.map(e => ({
        ...e,
        sets: parseInt(e.sets) || 0,
        reps: parseInt(e.reps) || 0,
        weight: parseFloat(e.weight) || 0,
        duration: parseInt(e.duration) || 0,
        distance: parseFloat(e.distance) || 0,
      })),
      date: new Date().toISOString(),
      duration: exercises.reduce((total, e) => total + (parseInt(e.duration) || 0), 0),
      caloriesBurned: Math.floor(Math.random() * 300) + 100, // Mock calorie calculation
    };

    addWorkout(newWorkout);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Workout Name</Text>
          <TextInput
            style={styles.input}
            value={workoutName}
            onChangeText={setWorkoutName}
            placeholder="Enter workout name"
            placeholderTextColor="#999"
          />
        </View>

        <Text style={styles.sectionTitle}>Exercises</Text>

        {exercises.map((exercise, index) => (
          <View key={index} style={styles.exerciseContainer}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseTitle}>Exercise {index + 1}</Text>
              <TouchableOpacity
                onPress={() => removeExercise(index)}
                style={styles.removeButton}
              >
                <Ionicons name="trash-outline" size={20} color="#ff4444" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              value={exercise.name}
              onChangeText={(value) => updateExercise(index, 'name', value)}
              placeholder="Exercise name"
              placeholderTextColor="#999"
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Sets</Text>
                <TextInput
                  style={styles.input}
                  value={exercise.sets}
                  onChangeText={(value) => updateExercise(index, 'sets', value)}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Reps</Text>
                <TextInput
                  style={styles.input}
                  value={exercise.reps}
                  onChangeText={(value) => updateExercise(index, 'reps', value)}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {type === 'strength' && (
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Weight (kg)</Text>
                  <TextInput
                    style={styles.input}
                    value={exercise.weight}
                    onChangeText={(value) => updateExercise(index, 'weight', value)}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
            )}

            {type === 'cardio' && (
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Duration (s)</Text>
                  <TextInput
                    style={styles.input}
                    value={exercise.duration}
                    onChangeText={(value) => updateExercise(index, 'duration', value)}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Distance (m)</Text>
                  <TextInput
                    style={styles.input}
                    value={exercise.distance}
                    onChangeText={(value) => updateExercise(index, 'distance', value)}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddExercise}
        >
          <Ionicons name="add-circle-outline" size={20} color="#4c669f" />
          <Text style={styles.addButtonText}>Add Exercise</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save Workout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  exerciseContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  removeButton: {
    padding: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  halfInput: {
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4c669f',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#4c669f',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#4c669f',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateWorkoutScreen;
