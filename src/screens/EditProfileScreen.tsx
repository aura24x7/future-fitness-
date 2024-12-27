import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  KeyboardTypeOptions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useOnboarding } from '../context/OnboardingContext';
import { useProfile } from '../context/ProfileContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { calorieService } from '../services/calorieService';
import type { FormState, HeightUnit, WeightUnit, Gender, Lifestyle, WeightGoal, WorkoutPreference, DietaryPreference } from '../types/forms';
import { UnitConversion } from '../utils/unitConversion';
import { ValidationLimits, ValidationMessages, ValidationErrors, FieldDescriptions } from '../utils/validation';

type EditProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;
type EditProfileScreenRouteProp = RouteProp<RootStackParamList, 'EditProfile'>;

interface Props {
  navigation: EditProfileScreenNavigationProp;
  route: EditProfileScreenRouteProp;
}

interface CalorieMetrics {
  bmr: number;
  tdee: number;
  recommendedCalories: number;
  bmi: number;
  weightToLose?: number;
  weightToGain?: number;
  estimatedWeeks?: number;
  proteinNeeds: {
    min: number;
    max: number;
  };
  waterNeeds: {
    ml: number;
    cups: number;
  };
}

/**
 * Calculate BMI using height and weight
 * @param weight Weight in kg
 * @param height Height in cm
 * @param unit System of measurement ('metric' or 'imperial')
 * @returns BMI value
 */
const calculateBMI = (weight: number, height: number, unit: 'metric' | 'imperial'): number => {
  // Convert height to meters for metric calculation
  const heightInMeters = height / 100;
  return UnitConversion.formatNumber(weight / (heightInMeters * heightInMeters));
};

/**
 * Calculate updated calorie metrics based on form state
 */
const calculateUpdatedCalories = (form: FormState): CalorieMetrics | null => {
  try {
    // Convert values to numbers and handle unit conversions
    const weight = parseFloat(form.weight.value);
    const height = parseFloat(form.height.value);
    const weightInKg = form.weight.unit === 'kg' ? weight : UnitConversion.lbsToKg(weight);
    const heightInCm = form.height.unit === 'cm' ? height : UnitConversion.ftToCm(height);

    if (isNaN(weight) || isNaN(height)) {
      return null;
    }

    // Calculate BMR using the Mifflin-St Jeor Equation
    let bmr = 0;
    const age = form.birthday ? Math.floor((new Date().getTime() - new Date(form.birthday).getTime()) / 31557600000) : 0;
    
    if (form.gender === 'male') {
      bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * age) + 5;
    } else if (form.gender === 'female') {
      bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * age) - 161;
    } else {
      bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * age) - 78;
    }

    // Calculate TDEE based on activity level
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    const tdee = Math.round(bmr * (activityMultipliers[form.lifestyle] || 1.2));

    // Calculate recommended calories based on weight goal
    let recommendedCalories = tdee;
    if (form.weightGoal === 'LOSE_WEIGHT') {
      recommendedCalories = Math.max(1200, tdee - 500);
    } else if (form.weightGoal === 'GAIN_WEIGHT') {
      recommendedCalories = tdee + 500;
    }

    // Calculate protein needs (0.8g - 1.2g per pound of body weight)
    const proteinNeeds = {
      min: Math.round(weightInKg * 1.6), // 0.8g per pound = 1.6g per kg
      max: Math.round(weightInKg * 2.4), // 1.2g per pound = 2.4g per kg
    };

    // Calculate water needs (30ml per kg of body weight)
    const waterInMl = Math.round(weightInKg * 30);
    const waterNeeds = {
      ml: waterInMl,
      cups: Math.round(waterInMl / 240), // 1 cup = 240ml
    };

    // Calculate weight goals
    const targetWeight = parseFloat(form.targetWeight.value);
    const targetWeightInKg = form.targetWeight.unit === 'kg' ? targetWeight : UnitConversion.lbsToKg(targetWeight);
    const weightDiff = Math.abs(targetWeightInKg - weightInKg);
    const estimatedWeeks = Math.ceil((weightDiff * 7700) / (500 * 7)); // 7700 calories = 1kg, 500 cal deficit/surplus per day

    return {
      bmr: Math.round(bmr),
      tdee,
      recommendedCalories: Math.round(recommendedCalories),
      bmi: 0, // This will be calculated separately
      weightToLose: form.weightGoal === 'LOSE_WEIGHT' ? weightDiff : undefined,
      weightToGain: form.weightGoal === 'GAIN_WEIGHT' ? weightDiff : undefined,
      estimatedWeeks: estimatedWeeks || undefined,
      proteinNeeds,
      waterNeeds,
    };
  } catch (error) {
    console.error('Error calculating calories:', error);
    return null;
  }
};

const EditProfileScreen = () => {
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const { profile, updateProfile } = useProfile();
  const { colors, isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [calorieMetrics, setCalorieMetrics] = useState<CalorieMetrics | null>(null);

  // Initialize form state with current values
  const [formState, setFormState] = useState<FormState>({
    name: profile?.name || '',
    height: {
      value: profile?.height?.value?.toString() || '',
      unit: profile?.height?.unit as HeightUnit || 'cm'
    },
    weight: {
      value: profile?.weight?.value?.toString() || '',
      unit: profile?.weight?.unit as WeightUnit || 'kg'
    },
    targetWeight: {
      value: profile?.targetWeight?.value?.toString() || '',
      unit: profile?.targetWeight?.unit as WeightUnit || 'kg'
    },
    gender: profile?.gender || 'male',
    birthday: profile?.birthday ? profile.birthday.toISOString().split('T')[0] : '',
    lifestyle: profile?.activityLevel || 'sedentary',
    workoutPreference: profile?.workoutPreference || 'strength',
    dietaryPreference: profile?.dietaryPreference || 'none',
    weightGoal: profile?.weightGoal || 'MAINTAIN_WEIGHT'
  });

  // Handle form field changes
  const handleChange = (field: keyof FormState, value: any) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
    setValidationErrors(prev => ({
      ...prev,
      [field]: undefined
    }));
  };

  // Handle unit changes
  const handleUnitChange = (field: 'height' | 'weight' | 'targetWeight', unit: HeightUnit | WeightUnit) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        unit
      }
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await updateProfile({
        ...profile,
        name: formState.name,
        gender: formState.gender,
        birthday: formState.birthday ? new Date(formState.birthday) : null,
        height: {
          value: parseFloat(formState.height.value),
          unit: formState.height.unit
        },
        weight: {
          value: parseFloat(formState.weight.value),
          unit: formState.weight.unit
        },
        targetWeight: {
          value: parseFloat(formState.targetWeight.value),
          unit: formState.targetWeight.unit
        },
        activityLevel: formState.lifestyle,
        workoutPreference: formState.workoutPreference,
        dietaryPreference: formState.dietaryPreference,
        weightGoal: formState.weightGoal
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Personal Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            {/* Name Input */}
    <View style={styles.inputContainer}>
              <Text style={styles.label}>Name</Text>
      <TextInput
                style={styles.input}
                value={formState.name}
                onChangeText={(value) => handleChange('name', value)}
                placeholder="Enter your name"
                placeholderTextColor={colors.text + '80'}
              />
              {validationErrors.name && (
                <Text style={styles.errorText}>{validationErrors.name}</Text>
      )}
    </View>

            {/* Birthday Input */}
    <View style={styles.inputContainer}>
              <Text style={styles.label}>Birthday</Text>
        <TextInput
                style={styles.input}
                value={formState.birthday}
                onChangeText={(value) => handleChange('birthday', value)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.text + '80'}
              />
              {validationErrors.birthday && (
                <Text style={styles.errorText}>{validationErrors.birthday}</Text>
              )}
            </View>

            {/* Gender Selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.pickerContainer}>
          <Picker
                  selectedValue={formState.gender}
                  onValueChange={(value) => handleChange('gender', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                  <Picker.Item label="Other" value="other" />
          </Picker>
        </View>
      </View>
    </View>

          {/* Body Measurements Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Body Measurements</Text>
            
            {/* Height Input */}
    <View style={styles.inputContainer}>
              <Text style={styles.label}>Height</Text>
              <View style={styles.measurementContainer}>
                <TextInput
                  style={[styles.input, styles.measurementInput]}
                  value={formState.height.value}
                  onChangeText={(value) => handleChange('height', { ...formState.height, value })}
                  keyboardType="numeric"
                  placeholder="Height"
                  placeholderTextColor={colors.text + '80'}
                />
                <View style={styles.unitPicker}>
        <Picker
                    selectedValue={formState.height.unit}
                    onValueChange={(value) => handleUnitChange('height', value as HeightUnit)}
                    style={styles.picker}
                  >
                    <Picker.Item label="cm" value="cm" />
                    <Picker.Item label="ft" value="ft" />
        </Picker>
      </View>
    </View>
            </View>

            {/* Weight Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Weight</Text>
              <View style={styles.measurementContainer}>
                <TextInput
                  style={[styles.input, styles.measurementInput]}
                  value={formState.weight.value}
                  onChangeText={(value) => handleChange('weight', { ...formState.weight, value })}
                  keyboardType="numeric"
                  placeholder="Weight"
                  placeholderTextColor={colors.text + '80'}
                />
                <View style={styles.unitPicker}>
                  <Picker
                    selectedValue={formState.weight.unit}
                    onValueChange={(value) => handleUnitChange('weight', value as WeightUnit)}
                    style={styles.picker}
                  >
                    <Picker.Item label="kg" value="kg" />
                    <Picker.Item label="lbs" value="lbs" />
                  </Picker>
          </View>
          </View>
        </View>

            {/* Target Weight Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Target Weight</Text>
              <View style={styles.measurementContainer}>
                <TextInput
                  style={[styles.input, styles.measurementInput]}
                  value={formState.targetWeight.value}
                  onChangeText={(value) => handleChange('targetWeight', { ...formState.targetWeight, value })}
                  keyboardType="numeric"
                  placeholder="Target Weight"
                  placeholderTextColor={colors.text + '80'}
                />
                <View style={styles.unitPicker}>
                  <Picker
                    selectedValue={formState.targetWeight.unit}
                    onValueChange={(value) => handleUnitChange('targetWeight', value as WeightUnit)}
                    style={styles.picker}
                  >
                    <Picker.Item label="kg" value="kg" />
                    <Picker.Item label="lbs" value="lbs" />
                  </Picker>
          </View>
            </View>
            </View>
        </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>

            {/* Activity Level */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Activity Level</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formState.lifestyle}
                  onValueChange={(value) => handleChange('lifestyle', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Sedentary" value="sedentary" />
                  <Picker.Item label="Lightly Active" value="light" />
                  <Picker.Item label="Moderately Active" value="moderate" />
                  <Picker.Item label="Very Active" value="active" />
                  <Picker.Item label="Super Active" value="very_active" />
                </Picker>
          </View>
        </View>

            {/* Weight Goal */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Weight Goal</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formState.weightGoal}
                  onValueChange={(value) => handleChange('weightGoal', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Lose Weight" value="LOSE_WEIGHT" />
                  <Picker.Item label="Maintain Weight" value="MAINTAIN_WEIGHT" />
                  <Picker.Item label="Gain Weight" value="GAIN_WEIGHT" />
                </Picker>
      </View>
            </View>

            {/* Workout Preference */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Workout Preference</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formState.workoutPreference}
                  onValueChange={(value) => handleChange('workoutPreference', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Strength Training" value="strength" />
                  <Picker.Item label="Cardio" value="cardio" />
                  <Picker.Item label="Flexibility" value="flexibility" />
                  <Picker.Item label="Balance" value="balance" />
                  <Picker.Item label="Mixed" value="mixed" />
                </Picker>
              </View>
            </View>

            {/* Dietary Preference */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Dietary Preference</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formState.dietaryPreference}
                  onValueChange={(value) => handleChange('dietaryPreference', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="None" value="none" />
                  <Picker.Item label="Vegetarian" value="vegetarian" />
                  <Picker.Item label="Vegan" value="vegan" />
                  <Picker.Item label="Pescatarian" value="pescatarian" />
                  <Picker.Item label="Keto" value="keto" />
                  <Picker.Item label="Paleo" value="paleo" />
                </Picker>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#6366f1',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  measurementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  measurementInput: {
    flex: 2,
  },
  unitPicker: {
    flex: 1,
    marginLeft: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#1F2937',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfileScreen; 