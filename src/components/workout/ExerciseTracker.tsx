import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Exercise, ExerciseProgress } from '../../types/workout';
import { exerciseProgressService } from '../../services/exerciseProgressService';
import { Ionicons } from '@expo/vector-icons';

interface ExerciseTrackerProps {
  planId: string;
  dayIndex: number;
  exercise: Exercise;
  exerciseId: string;
  onComplete?: (progress: ExerciseProgress) => void;
}

interface SetTracking {
  setNumber: number;
  reps: number | string;
  weight: number | string;
  completed: boolean;
}

// Helper function to safely parse numeric values
const safeParseFloat = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Special case for boolean-like string values
    if (value === '$true' || value === 'true') return 0;
    if (value === '$false' || value === 'false') return 0;
    
    // Remove any non-numeric characters except periods and negative signs
    const cleanedValue = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleanedValue);
    return isNaN(parsed) ? 0 : parsed;
  }
  // Handle boolean values directly
  if (typeof value === 'boolean') return value ? 1 : 0;
  return 0;
}

// Helper to safely format value for display in Input
const safeFormatValue = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'string') {
    // Handle special boolean-like values
    if (value === '$true' || value === 'true' || value === '$false' || value === 'false') {
      return '0';
    }
    // Clean the string of non-numeric characters
    return value.replace(/[^\d.-]/g, '');
  }
  // Handle boolean values
  if (typeof value === 'boolean') return value ? '1' : '0';
  return '';
}

const ExerciseTracker: React.FC<ExerciseTrackerProps> = ({
  planId,
  dayIndex,
  exercise,
  exerciseId,
  onComplete,
}) => {
  const { colors } = useTheme();
  const [sets, setSets] = useState<SetTracking[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previousProgress, setPreviousProgress] = useState<ExerciseProgress | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [completedAnimation] = useState(new Animated.Value(0));

  // Determine if we're in dark mode
  const isDarkMode = colors.background !== '#FFFFFF';

  useEffect(() => {
    // Initialize tracking sets based on the exercise
    const exerciseSets = typeof exercise?.sets === 'number' && exercise.sets > 0 ? exercise.sets : 1;
    const exerciseReps = exercise?.reps || 10; // Default to 10 reps if missing
    
    console.log('ExerciseTracker received:', { 
      exerciseId, 
      planId, 
      exercise: { 
        sets: exercise?.sets,
        reps: exercise?.reps,
        exerciseName: exercise?.exerciseName 
      }
    });
    
    const initialSets: SetTracking[] = Array.from({ length: exerciseSets }, (_, i) => ({
      setNumber: i + 1,
      reps: safeParseFloat(exerciseReps),
      weight: 0,
      completed: false,
    }));
    setSets(initialSets);
    
    // Load previous progress if available
    loadExerciseHistory();
  }, [exercise, exerciseId, planId]);

  const loadExerciseHistory = async () => {
    try {
      setIsLoadingHistory(true);
      setError(null);
      
      // Validate inputs
      if (!exerciseId || !planId) {
        console.error('Missing exerciseId or planId', { exerciseId, planId });
        setError("Couldn't load history due to missing data");
        return;
      }
      
      const progressHistory = await exerciseProgressService.getExerciseProgress(
        exerciseId,
        planId
      );
      
      if (!progressHistory || !Array.isArray(progressHistory)) {
        console.warn('Invalid progress history returned', progressHistory);
        return;
      }
      
      if (progressHistory.length > 0) {
        const latestProgress = progressHistory[0];
        
        if (!latestProgress) {
          console.warn('First progress item is null/undefined');
          return;
        }
        
        setPreviousProgress(latestProgress);
        
        // Pre-fill weights from the latest progress if available
        if (latestProgress.actualWeight !== undefined && latestProgress.actualWeight !== null) {
          const weightValue = safeParseFloat(latestProgress.actualWeight);
          
          setSets(prevSets => 
            prevSets.map(set => ({
              ...set,
              weight: weightValue,
            }))
          );
        }
      }
    } catch (err) {
      console.error('Failed to load exercise history:', err);
      setError('Could not load exercise history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const updateSet = (index: number, field: keyof SetTracking, value: any) => {
    const newSets = [...sets];
    newSets[index] = {
      ...newSets[index],
      [field]: value,
    };
    setSets(newSets);
  };

  const toggleSetCompletion = (index: number) => {
    const newValue = !sets[index].completed;
    updateSet(index, 'completed', newValue);
    
    // Animate the completion change
    if (newValue) {
      Animated.spring(completedAnimation, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
      }).start();
    } else {
      Animated.timing(completedAnimation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const completedSets = sets.filter(set => set.completed);
      if (completedSets.length === 0) {
        setError('Please complete at least one set');
        return;
      }
      
      const totalCompletedReps = completedSets.reduce((sum, set) => sum + safeParseFloat(set.reps), 0);
      const avgWeight = completedSets.reduce((sum, set) => sum + safeParseFloat(set.weight), 0) / completedSets.length;
      
      const progress: Omit<ExerciseProgress, 'id'> = {
        exerciseId,
        planId,
        dayIndex,
        date: new Date(),
        completed: completedSets.length === exercise.sets,
        actualSets: completedSets.length,
        actualReps: totalCompletedReps,
        actualWeight: avgWeight,
        notes,
        completedAt: new Date(),
        userId: '', // Will be set by the service
      };
      
      try {
        const progressId = await exerciseProgressService.trackExerciseProgress(progress);
        
        if (onComplete) {
          onComplete({ ...progress, id: progressId });
        }
      } catch (submitError) {
        console.error('Error submitting exercise progress:', submitError);
        setError('Failed to save progress. Please try again.');
      }
    } catch (err) {
      console.error('Failed to submit exercise progress:', err);
      setError('Failed to save progress');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: colors.cardBackground,
        borderColor: colors.border,
        shadowColor: isDarkMode ? 'rgba(0,0,0,0)' : '#000',
      }
    ]}>
      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: colors.cardBackground,
        borderBottomColor: colors.border
      }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {exercise?.exerciseName || 'Track Your Exercise'}
        </Text>
        {previousProgress ? (
          <View style={styles.previousProgressContainer}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} style={styles.historyIcon} />
            <Text style={[styles.previousProgressText, { color: colors.textSecondary }]}>
              Last workout: {safeParseFloat(previousProgress.actualWeight)}lbs • {previousProgress.actualSets} sets • {previousProgress.actualReps} reps
            </Text>
          </View>
        ) : null}
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {isLoadingHistory ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading your previous workout data...
            </Text>
          </View>
        ) : (
          <>
            {sets.length === 0 ? (
              <View style={[styles.emptyStateContainer, {
                backgroundColor: isDarkMode ? colors.cardBackground : '#f9fafb',
              }]}>
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                  No exercise details available. Try refreshing the page.
                </Text>
              </View>
            ) : (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Complete Your Sets
                </Text>
                
                {/* Sets */}
                <View style={styles.setsContainer}>
                  {sets.map((set, index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.setRow,
                        { 
                          backgroundColor: isDarkMode 
                            ? (set.completed ? 'rgba(52, 211, 153, 0.2)' : colors.cardBackground) 
                            : (set.completed ? 'rgba(52, 211, 153, 0.1)' : '#f9fafb')
                        }
                      ]}
                    >
                      <TouchableOpacity 
                        style={styles.checkboxContainer}
                        activeOpacity={0.7}
                        onPress={() => toggleSetCompletion(index)}
                      >
                        <View style={[
                          styles.checkbox,
                          { 
                            borderColor: set.completed ? colors.primary : colors.border,
                            backgroundColor: set.completed ? colors.primary : 'transparent'
                          }
                        ]}>
                          {set.completed && (
                            <Ionicons name="checkmark" size={16} color={isDarkMode ? colors.background : 'white'} />
                          )}
                        </View>
                        <Text style={[styles.setLabel, { color: colors.text }]}>
                          Set {set.setNumber}
                        </Text>
                      </TouchableOpacity>
                      
                      <View style={styles.inputsContainer}>
                        <View style={styles.inputWrapper}>
                          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                            Reps
                          </Text>
                          <TextInput
                            style={[
                              styles.input, 
                              { 
                                color: colors.text, 
                                borderColor: set.completed ? colors.primary : colors.border,
                                backgroundColor: isDarkMode ? colors.cardBackground : 'white',
                              }
                            ]}
                            placeholder="0"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="numeric"
                            value={safeFormatValue(set.reps)}
                            onChangeText={(text) => {
                              const reps = safeParseFloat(text);
                              updateSet(index, 'reps', reps);
                            }}
                          />
                        </View>
                        
                        <View style={styles.inputWrapper}>
                          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                            Weight (lbs)
                          </Text>
                          <TextInput
                            style={[
                              styles.input, 
                              { 
                                color: colors.text, 
                                borderColor: set.completed ? colors.primary : colors.border,
                                backgroundColor: isDarkMode ? colors.cardBackground : 'white',
                              }
                            ]}
                            placeholder="0"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="numeric"
                            value={safeFormatValue(set.weight)}
                            onChangeText={(text) => {
                              const weight = safeParseFloat(text);
                              updateSet(index, 'weight', weight);
                            }}
                          />
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
                
                {/* Notes Section */}
                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>
                  Notes
                </Text>
                <TextInput
                  style={[
                    styles.notesInput, 
                    { 
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor: isDarkMode ? colors.cardBackground : '#f9fafb',
                    }
                  ]}
                  placeholder="Add any notes about this exercise (optional)"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                  value={notes}
                  onChangeText={setNotes}
                />

                {/* Save Button */}
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    { backgroundColor: colors.primary, opacity: isSubmitting ? 0.7 : 1 }
                  ]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={isDarkMode ? colors.background : 'white'} />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={18} color={isDarkMode ? colors.background : 'white'} style={styles.buttonIcon} />
                      <Text style={[styles.saveButtonText, { color: isDarkMode ? colors.background : 'white' }]}>
                        Save Progress
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  previousProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  historyIcon: {
    marginRight: 4,
  },
  previousProgressText: {
    fontSize: 14,
  },
  scrollContainer: {
    maxHeight: 550, // Prevent the component from getting too tall
  },
  scrollContent: {
    padding: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    marginLeft: 8,
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    minHeight: 120,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  emptyStateContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
    borderRadius: 8,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  setsContainer: {
    marginBottom: 16,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  setLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  inputsContainer: {
    flexDirection: 'row',
    width: '60%',
    justifyContent: 'flex-end',
  },
  inputWrapper: {
    marginLeft: 10,
    width: '45%',
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  saveButton: {
    height: 50,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default ExerciseTracker; 