import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Keyboard,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Exercise } from '../services/geminiService';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.85;

type Props = NativeStackScreenProps<RootStackParamList, 'AddCustomWorkout'>;

const AddCustomWorkoutScreen: React.FC<Props> = ({ navigation, route }) => {
  const [exercise, setExercise] = useState<Partial<Exercise>>({
    name: '',
    sets: 3,
    reps: '12',
    duration: 5,
    calories: 50,
    notes: '',
    completed: false,
  });

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  React.useEffect(() => {
    const keyboardWillShow = Keyboard.addListener('keyboardWillShow', () => setKeyboardVisible(true));
    const keyboardWillHide = Keyboard.addListener('keyboardWillHide', () => setKeyboardVisible(false));

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const handleSave = () => {
    if (!exercise.name || !exercise.duration || !exercise.calories) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newExercise: Exercise = {
      name: exercise.name,
      duration: parseInt(exercise.duration.toString()),
      calories: parseInt(exercise.calories.toString()),
      completed: false,
      sets: exercise.sets || 3,
      reps: exercise.reps || '12',
      notes: exercise.notes || ''
    };

    // Check if setCustomExercise was passed as a route parameter
    const { setCustomExercise } = route.params || {};
    if (setCustomExercise && typeof setCustomExercise === 'function') {
      setCustomExercise(newExercise);
    }

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Semi-transparent overlay */}
      <TouchableOpacity 
        style={styles.overlay} 
        onPress={() => navigation.goBack()} 
        activeOpacity={1}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[
          styles.modalContainer,
          keyboardVisible && { height: MODAL_HEIGHT * 0.8 }
        ]}
      >
        <View style={styles.modalContent}>
          <View style={styles.pullBar} />
          
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.headerButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Workout</Text>
            <TouchableOpacity 
              onPress={handleSave}
              style={styles.headerButton}
            >
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.form}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Exercise Name</Text>
              <TextInput
                style={styles.input}
                value={exercise.name}
                onChangeText={(text) => setExercise({ ...exercise, name: text })}
                placeholder="e.g., Push-ups"
                placeholderTextColor="#9CA3AF"
                autoFocus
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Sets</Text>
                <TextInput
                  style={styles.input}
                  value={exercise.sets?.toString()}
                  onChangeText={(text) => setExercise({ ...exercise, sets: parseInt(text) || 0 })}
                  keyboardType="numeric"
                  placeholder="3"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Reps</Text>
                <TextInput
                  style={styles.input}
                  value={exercise.reps}
                  onChangeText={(text) => setExercise({ ...exercise, reps: text })}
                  placeholder="12 or 30s"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Duration (min)</Text>
                <TextInput
                  style={styles.input}
                  value={exercise.duration?.toString()}
                  onChangeText={(text) => setExercise({ ...exercise, duration: parseInt(text) || 0 })}
                  keyboardType="numeric"
                  placeholder="5"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Calories</Text>
                <TextInput
                  style={styles.input}
                  value={exercise.calories?.toString()}
                  onChangeText={(text) => setExercise({ ...exercise, calories: parseInt(text) || 0 })}
                  keyboardType="numeric"
                  placeholder="50"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={exercise.notes}
                onChangeText={(text) => setExercise({ ...exercise, notes: text })}
                placeholder="Add form tips or variations"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>
            
            <View style={styles.bottomPadding} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    height: MODAL_HEIGHT,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  pullBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  cancelText: {
    fontSize: 17,
    color: '#6B7280',
  },
  doneText: {
    fontSize: 17,
    color: '#6366F1',
    fontWeight: '600',
  },
  form: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  bottomPadding: {
    height: 40,
  },
});

export default AddCustomWorkoutScreen;
