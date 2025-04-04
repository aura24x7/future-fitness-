import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, YStack, XStack } from 'tamagui';
import { Exercise, IntensityLevel } from '../../types/workout';
import { AIWorkoutService } from '../../services/aiWorkoutService';
import { SafeWorkoutInput } from './SafeWorkoutInput';
import { SafeWorkoutButton } from './SafeWorkoutButton';
import { useTheme } from '../../theme/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Get screen dimensions to ensure responsive layout
const { width, height } = Dimensions.get('window');

// Intensity level options with icons and colors
const INTENSITY_OPTIONS = [
  { value: 'low', label: 'Low', icon: 'walk-outline' as any, color: '#4ADE80' },
  { value: 'medium', label: 'Medium', icon: 'bicycle-outline' as any, color: '#FACC15' },
  { value: 'high', label: 'High', icon: 'flame-outline' as any, color: '#F87171' },
];

interface ExerciseFormProps {
  exercise?: Exercise;
  onSave: (exercise: Exercise) => void;
  onCancel: () => void;
}

export const ExerciseForm: React.FC<ExerciseFormProps> = ({
  exercise,
  onSave,
  onCancel,
}) => {
  const { colors, isDarkMode } = useTheme();
  const [formData, setFormData] = useState<Exercise>(
    exercise || {
      exerciseName: '',
      sets: 0,
      reps: 0,
      instructions: '',
      intensityLevel: 'medium',
      workoutDuration: 0,
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEstimatingCalories, setIsEstimatingCalories] = useState(false);
  const [estimationExplanation, setEstimationExplanation] = useState<string>('');

  const validateField = (field: keyof Exercise, value: any): string => {
    switch (field) {
      case 'exerciseName':
        return !value ? 'Exercise name is required' : '';
      case 'sets':
        return value <= 0 ? 'Sets must be a positive number' : '';
      case 'reps':
        return value <= 0 ? 'Reps must be a positive number' : '';
      case 'workoutDuration':
        return value < 0 ? 'Duration must be a non-negative number' : '';
      case 'instructions':
        return !value ? 'Instructions are required' : '';
      case 'caloriesBurned':
        return value < 0 ? 'Calories must be a non-negative number' : '';
      default:
        return '';
    }
  };

  const handleChange = (field: keyof Exercise, value: any) => {
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error,
    }));

    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEstimateCalories = async () => {
    // Validate required fields first
    const requiredFields: (keyof Exercise)[] = ['exerciseName', 'sets', 'reps', 'instructions'];
    const newErrors: Record<string, string> = {};
    
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsEstimatingCalories(true);
    setEstimationExplanation('');

    try {
      const aiService = AIWorkoutService.getInstance();
      const result = await aiService.estimateCalories(formData);
      
      setFormData(prev => ({
        ...prev,
        caloriesBurned: result.calories,
      }));
      setEstimationExplanation(result.explanation);
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        caloriesBurned: (error as Error).message,
      }));
    } finally {
      setIsEstimatingCalories(false);
    }
  };

  const handleSubmit = () => {
    // Validate all fields
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key as keyof Exercise, formData[key as keyof Exercise]);
      if (error) {
        newErrors[key] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
  };

  const bgColor = isDarkMode ? '#121212' : '#FFFFFF';
  const cardBgColor = isDarkMode ? '#1A1A1A' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#111827';
  const primaryColor = colors.primary;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoid}
    >
      <View style={[styles.outerContainer, { backgroundColor: bgColor }]}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.headerContainer}>
            <Text 
              style={[styles.formTitle, { color: primaryColor }]}
            >
              Create Exercise
            </Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onCancel}
            >
              <Ionicons name={"close" as any} size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          <View style={[styles.formCard, { backgroundColor: cardBgColor }]}>
            {/* Exercise Name */}
            <SafeWorkoutInput
              placeholder="Ex: Bench Press, Squats, etc."
              value={formData.exerciseName}
              onChangeText={(text) => handleChange('exerciseName', text)}
              editable={!isEstimatingCalories}
              error={errors.exerciseName}
              label="Exercise Name"
            />

            {/* Sets & Reps */}
            <XStack space="$3" alignItems="center" justifyContent="space-between">
              <View style={styles.halfWidthInput}>
                <SafeWorkoutInput
                  placeholder="Sets"
                  keyboardType="numeric"
                  value={formData.sets.toString()}
                  onChangeText={(text) => handleChange('sets', parseInt(text) || 0)}
                  editable={!isEstimatingCalories}
                  error={errors.sets}
                  label="Sets"
                />
              </View>
              <View style={styles.halfWidthInput}>
                <SafeWorkoutInput
                  placeholder="Reps"
                  keyboardType="numeric"
                  value={formData.reps.toString()}
                  onChangeText={(text) => handleChange('reps', parseInt(text) || 0)}
                  editable={!isEstimatingCalories}
                  error={errors.reps}
                  label="Reps"
                />
              </View>
            </XStack>

            {/* Duration */}
            <SafeWorkoutInput
              placeholder="Duration in minutes"
              keyboardType="numeric"
              value={formData.workoutDuration?.toString() || '0'}
              onChangeText={(text) => handleChange('workoutDuration', parseInt(text) || 0)}
              editable={!isEstimatingCalories}
              error={errors.workoutDuration}
              label="Duration (minutes)"
            />

            {/* Intensity Level */}
            <View style={styles.intensitySection}>
              <Text style={[styles.sectionLabel, { color: textColor }]}>
                Intensity Level
              </Text>
              <View style={styles.intensityOptionsContainer}>
                {INTENSITY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.intensityOption,
                      formData.intensityLevel === option.value && {
                        borderColor: option.color,
                        backgroundColor: isDarkMode 
                          ? `${option.color}22` // 22 is hex for 13% opacity
                          : `${option.color}15` // 15 is hex for 8% opacity
                      }
                    ]}
                    onPress={() => handleChange('intensityLevel', option.value)}
                  >
                    <Ionicons 
                      name={option.icon as any} 
                      size={24} 
                      color={option.color} 
                      style={styles.intensityIcon}
                    />
                    <Text 
                      style={[
                        styles.intensityText, 
                        { color: formData.intensityLevel === option.value ? option.color : textColor }
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Instructions */}
            <SafeWorkoutInput
              placeholder="Detailed steps to perform this exercise"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={formData.instructions}
              onChangeText={(text) => handleChange('instructions', text)}
              editable={!isEstimatingCalories}
              error={errors.instructions}
              style={styles.textArea}
              label="Instructions"
            />

            {/* Calories Burned */}
            <View style={styles.caloriesSection}>
              <Text style={[styles.sectionLabel, { color: textColor }]}>
                Calories Burned
              </Text>
              <XStack space="$3" alignItems="center" style={styles.caloriesRow}>
                <View style={styles.caloriesInputContainer}>
                  <SafeWorkoutInput
                    placeholder="Calories"
                    keyboardType="numeric"
                    value={formData.caloriesBurned?.toString() || ''}
                    onChangeText={(text) => handleChange('caloriesBurned', parseInt(text) || 0)}
                    editable={!isEstimatingCalories}
                    error={errors.caloriesBurned}
                  />
                </View>
                <View style={styles.estimateButtonContainer}>
                  <SafeWorkoutButton
                    title="Estimate"
                    variant="secondary"
                    isLoading={isEstimatingCalories}
                    disabled={isEstimatingCalories}
                    onPress={handleEstimateCalories}
                    style={styles.estimateButton}
                    size="medium"
                    icon={<Ionicons name="calculator-outline" size={18} color="#FFFFFF" />}
                  />
                </View>
              </XStack>
            </View>
            
            {/* Estimation Explanation */}
            {estimationExplanation && (
              <View style={[
                styles.explanationContainer,
                { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }
              ]}>
                <Ionicons 
                  name={"information-circle-outline" as any}
                  size={20} 
                  color={isDarkMode ? '#A78BFA' : '#8B5CF6'} 
                  style={styles.infoIcon}
                />
                <Text style={[styles.explanationText, { color: isDarkMode ? '#CCCCCC' : '#666666' }]}>
                  {estimationExplanation}
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <SafeWorkoutButton
              title="Cancel"
              variant="outline"
              onPress={onCancel}
              style={styles.actionButton}
              size="medium"
              icon={<Ionicons name={"close-outline" as any} size={18} color={isDarkMode ? primaryColor : primaryColor} />}
            />
            <SafeWorkoutButton
              title="Save Exercise"
              variant="primary"
              onPress={handleSubmit}
              style={styles.actionButton}
              size="medium"
              icon={<Ionicons name={"checkmark-outline" as any} size={18} color="#FFFFFF" />}
            />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
    width: '100%',
  },
  outerContainer: {
    flex: 1,
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 12,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  formCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  caloriesSection: {
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  intensitySection: {
    marginVertical: 8,
  },
  intensityOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  intensityOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(150,150,150,0.3)',
  },
  intensityIcon: {
    marginBottom: 6,
  },
  intensityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  caloriesRow: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  caloriesInputContainer: {
    flex: 1,
    marginRight: 12,
  },
  estimateButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  estimateButton: {
    minWidth: 120,
  },
  explanationContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    maxWidth: '48%',
    minWidth: '48%',
  },
  halfWidthInput: {
    width: '48%',
  }
}); 