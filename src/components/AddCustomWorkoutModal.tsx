import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Exercise } from '../services/geminiService';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (exercise: Exercise) => void;
}

const AddCustomWorkoutModal: React.FC<Props> = ({ visible, onClose, onSave }) => {
  const [exercise, setExercise] = useState<Partial<Exercise>>({
    name: '',
    sets: 3,
    reps: '12',
    duration: 5,
    calories: 50,
    notes: '',
    completed: false,
  });

  const handleSave = () => {
    if (!exercise.name) {
      alert('Please enter an exercise name');
      return;
    }
    onSave(exercise as Exercise);
    setExercise({
      name: '',
      sets: 3,
      reps: '12',
      duration: 5,
      calories: 50,
      notes: '',
      completed: false,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Custom Exercise</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Exercise Name*</Text>
              <TextInput
                style={styles.input}
                value={exercise.name}
                onChangeText={(text) => setExercise({ ...exercise, name: text })}
                placeholder="e.g., Push-ups"
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
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Reps</Text>
                <TextInput
                  style={styles.input}
                  value={exercise.reps}
                  onChangeText={(text) => setExercise({ ...exercise, reps: text })}
                  placeholder="12 or 30s"
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
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Add Exercise</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 16,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 8,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: '#6366F1',
  },
  cancelButtonText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddCustomWorkoutModal;
