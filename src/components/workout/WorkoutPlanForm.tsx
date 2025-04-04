import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, YStack, XStack } from 'tamagui';
import { WorkoutPlan, DayPlan, Exercise } from '../../types/workout';
import { ExerciseForm } from './ExerciseForm';
import { SafeWorkoutInput } from './SafeWorkoutInput';
import { SafeWorkoutButton } from './SafeWorkoutButton';
import { useTheme } from '../../theme/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export interface WorkoutPlanFormProps {
  onSubmit: (plan: Omit<WorkoutPlan, 'id' | 'ownerId' | 'createdAt'>) => void;
  initialPlan?: WorkoutPlan | null;
  isSubmitting?: boolean;
}

export const WorkoutPlanForm: React.FC<WorkoutPlanFormProps> = ({
  onSubmit,
  initialPlan,
  isSubmitting = false,
}) => {
  const { colors, isDarkMode } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [days, setDays] = useState<DayPlan[]>(
    DAYS_OF_WEEK.map((dayName) => ({
      dayName,
      isRestDay: false,
      exercises: [],
      notes: '',
    }))
  );
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [showExerciseForm, setShowExerciseForm] = useState(false);

  useEffect(() => {
    if (initialPlan) {
      setName(initialPlan.name || '');
      setDescription(initialPlan.description || '');
      setDays(initialPlan.days);
    }
  }, [initialPlan]);

  const handleSubmit = () => {
    const workoutPlan: Omit<WorkoutPlan, 'id' | 'ownerId' | 'createdAt'> = {
      name,
      description,
      days,
      isShared: false,
      sharedWith: [],
    };
    onSubmit(workoutPlan);
  };

  const toggleRestDay = (index: number) => {
    const newDays = [...days];
    newDays[index].isRestDay = !newDays[index].isRestDay;
    if (newDays[index].isRestDay) {
      newDays[index].exercises = [];
    }
    setDays(newDays);
  };

  const updateNotes = (index: number, notes: string) => {
    const newDays = [...days];
    newDays[index].notes = notes;
    setDays(newDays);
  };

  const handleAddExercise = (dayIndex: number) => {
    setSelectedDayIndex(dayIndex);
    setShowExerciseForm(true);
  };

  const handleSaveExercise = (exercise: Exercise) => {
    if (selectedDayIndex !== null) {
      const newDays = [...days];
      newDays[selectedDayIndex].exercises.push(exercise);
      setDays(newDays);
      setShowExerciseForm(false);
      setSelectedDayIndex(null);
    }
  };

  const handleDeleteExercise = (dayIndex: number, exerciseIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].exercises.splice(exerciseIndex, 1);
    setDays(newDays);
  };

  // Helper function to generate gradient colors for rest day button
  const getRestDayButtonColors = (isRestDay: boolean): readonly [string, string] => {
    if (isDarkMode) {
      return isRestDay 
        ? ['#383838', '#292929'] as const // Subtle gradient for outline/rest day in dark mode
        : ['#9575CD', '#7C4DFF'] as const; // Purple gradient for primary/workout day in dark mode
    } else {
      return isRestDay
        ? ['#FFFFFF', '#F5F5F5'] as const // Subtle gradient for outline/rest day in light mode
        : ['#8B5CF6', '#7C3AED'] as const; // Purple gradient for primary/workout day in light mode
    }
  };

  return (
    <YStack space="$4" style={{ flex: 1, backgroundColor: isDarkMode ? '#121212' : 'transparent' }}>
      {showExerciseForm ? (
        <ExerciseForm
          onSave={handleSaveExercise}
          onCancel={() => {
            setShowExerciseForm(false);
            setSelectedDayIndex(null);
          }}
        />
      ) : (
        <ScrollView style={[styles.scrollContainer, { backgroundColor: isDarkMode ? '#121212' : 'transparent' }]} showsVerticalScrollIndicator={false}>
          <View style={[styles.formContainer, { backgroundColor: isDarkMode ? '#121212' : 'transparent' }]}>
            <SafeWorkoutInput
              placeholder="Plan Name"
              value={name}
              onChangeText={setName}
              style={[
                styles.nameInput,
                {
                  backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.8)' : '#FFFFFF',
                  borderColor: isDarkMode ? 'rgba(80, 80, 80, 0.5)' : '#E5E7EB',
                  color: isDarkMode ? '#FFFFFF' : '#111827',
                }
              ]}
            />

            <SafeWorkoutInput
              placeholder="Description (optional)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={[
                styles.textArea,
                {
                  backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.8)' : '#FFFFFF',
                  borderColor: isDarkMode ? 'rgba(80, 80, 80, 0.5)' : '#E5E7EB',
                  color: isDarkMode ? '#FFFFFF' : '#111827',
                }
              ]}
            />

            <Text 
              style={[
                styles.sectionTitle, 
                { 
                  color: isDarkMode ? '#A78BFA' : '#8B5CF6',
                  marginTop: 16,
                  marginBottom: 8
                }
              ]}
            >
              Schedule
            </Text>

            {days.map((day, index) => (
              <View 
                key={day.dayName} 
                style={[
                  styles.dayContainer, 
                  { 
                    backgroundColor: isDarkMode ? 'rgba(20, 20, 20, 0.9)' : '#f9f9f9',
                    borderColor: isDarkMode ? 'rgba(70, 70, 70, 0.5)' : '#eaeaea',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDarkMode ? 0.3 : 0.1,
                    shadowRadius: 4,
                    elevation: 4,
                    marginBottom: 16,
                  }
                ]}
              >
                <XStack justifyContent="space-between" alignItems="center" style={styles.dayHeader}>
                  <Text 
                    fontSize={16} 
                    fontWeight="600" 
                    style={{ 
                      color: isDarkMode ? '#FFFFFF' : '#333',
                      letterSpacing: 0.3,
                    }}
                  >
                    {day.dayName}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.restDayButton,
                      {
                        backgroundColor: 'transparent',
                        borderColor: isDarkMode 
                          ? day.isRestDay ? '#A78BFA' : 'transparent' 
                          : day.isRestDay ? '#8B5CF6' : 'transparent',
                        borderWidth: day.isRestDay ? 1 : 0,
                        overflow: 'hidden',
                      }
                    ]}
                    onPress={() => toggleRestDay(index)}
                  >
                    <LinearGradient
                      colors={getRestDayButtonColors(day.isRestDay)}
                      style={styles.restDayButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text 
                        style={[
                          styles.restDayButtonText,
                          { 
                            color: day.isRestDay 
                              ? (isDarkMode ? '#A78BFA' : '#8B5CF6') 
                              : '#FFFFFF' 
                          }
                        ]}
                      >
                        {day.isRestDay ? 'Set as Workout Day' : 'Set as Rest Day'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </XStack>

                <SafeWorkoutInput
                  style={[
                    styles.notesInput,
                    {
                      backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.6)' : '#FFFFFF',
                      borderColor: isDarkMode ? 'rgba(60, 60, 60, 0.5)' : '#E5E7EB',
                      color: isDarkMode ? '#FFFFFF' : '#111827',
                      marginTop: 12,
                    }
                  ]}
                  placeholder="Add notes for this day"
                  value={day.notes}
                  onChangeText={(text) => updateNotes(index, text)}
                />

                {!day.isRestDay && (
                  <YStack space="$2" marginTop="$4">
                    {day.exercises.length > 0 && (
                      <Text 
                        style={[
                          styles.exercisesLabel, 
                          { 
                            color: isDarkMode ? '#BDB2FF' : '#7C3AED',
                            fontWeight: '600',
                            fontSize: 15,
                            marginBottom: 8,
                            letterSpacing: 0.5,
                          }
                        ]}
                      >
                        Exercises
                      </Text>
                    )}
                    
                    {day.exercises.map((exercise: Exercise, exerciseIndex: number) => (
                      <View 
                        key={exerciseIndex} 
                        style={[
                          styles.exerciseContainer,
                          { 
                            backgroundColor: isDarkMode ? 'rgba(40, 40, 40, 0.7)' : '#fff',
                            borderColor: isDarkMode ? 'rgba(70, 70, 70, 0.5)' : '#eaeaea',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: isDarkMode ? 0.2 : 0.1,
                            shadowRadius: 2,
                            elevation: 2,
                            marginBottom: 8,
                          }
                        ]}
                      >
                        <XStack justifyContent="space-between" alignItems="center">
                          <YStack>
                            <Text 
                              fontWeight="600" 
                              style={{ 
                                color: isDarkMode ? '#FFFFFF' : '#333',
                                fontSize: 15,
                              }}
                            >
                              {exercise.exerciseName}
                            </Text>
                            <Text 
                              fontSize={12} 
                              style={{ 
                                color: isDarkMode ? '#BDB2FF' : '#8B5CF6',
                                marginTop: 4,
                              }}
                            >
                              {exercise.sets} sets × {exercise.reps} reps
                            </Text>
                          </YStack>
                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteExercise(index, exerciseIndex)}
                          >
                            <LinearGradient
                              colors={isDarkMode ? ['#F87171', '#EF4444'] : ['#F87171', '#DC2626']}
                              style={styles.deleteButtonGradient}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                            >
                              <Text style={styles.deleteButtonText}>Delete</Text>
                            </LinearGradient>
                          </TouchableOpacity>
                        </XStack>
                      </View>
                    ))}
                    <TouchableOpacity
                      style={[
                        styles.addExerciseButton,
                        {
                          borderColor: isDarkMode ? '#A78BFA' : '#8B5CF6',
                          borderWidth: 1,
                          borderStyle: 'dashed',
                          backgroundColor: isDarkMode ? 'rgba(40, 40, 40, 0.4)' : 'rgba(139, 92, 246, 0.05)',
                        }
                      ]}
                      onPress={() => handleAddExercise(index)}
                    >
                      <Text 
                        style={[
                          styles.addExerciseButtonText,
                          { color: isDarkMode ? '#A78BFA' : '#8B5CF6' }
                        ]}
                      >
                        Add Exercise
                      </Text>
                    </TouchableOpacity>
                  </YStack>
                )}
              </View>
            ))}
            <View style={styles.submitButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  {
                    opacity: isSubmitting ? 0.7 : 1,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: isDarkMode ? 3 : 2 },
                    shadowOpacity: isDarkMode ? 0.4 : 0.15,
                    shadowRadius: isDarkMode ? 5 : 3,
                    elevation: isDarkMode ? 6 : 4,
                  }
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <LinearGradient
                  colors={isDarkMode ? ['#9575CD', '#7C4DFF'] as const : ['#8B5CF6', '#7C3AED'] as const}
                  style={styles.saveButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Workout Plan</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </YStack>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  nameInput: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  textArea: {
    height: 100,
    fontSize: 16,
    borderRadius: 12,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  dayContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  dayHeader: {
    marginBottom: 8,
  },
  restDayButton: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 36,
    minWidth: 150,
  },
  restDayButtonGradient: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restDayButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  notesInput: {
    borderRadius: 10,
    height: 48,
    fontSize: 14,
    paddingHorizontal: 12,
  },
  exercisesLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  exerciseContainer: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  deleteButton: {
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  deleteButtonGradient: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  addExerciseButton: {
    borderRadius: 12,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  addExerciseButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitButtonContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
  saveButton: {
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
}); 