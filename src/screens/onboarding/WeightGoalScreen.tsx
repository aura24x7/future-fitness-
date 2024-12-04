import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOnboarding } from '../../context/OnboardingContext';
import { RootStackParamList } from '../../types/navigation';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

type WeightGoalScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface GoalOption {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const goalOptions: GoalOption[] = [
  {
    id: 'LOSE_WEIGHT',
    title: 'Lose Weight',
    description: 'Reduce body fat and get leaner',
    icon: 'trending-down',
    color: '#3B82F6',
  },
  {
    id: 'MAINTAIN_WEIGHT',
    title: 'Maintain Weight',
    description: 'Stay at your current weight',
    icon: 'heart',
    color: '#8B5CF6',
  },
  {
    id: 'GAIN_WEIGHT',
    title: 'Gain Weight',
    description: 'Build muscle and strength',
    icon: 'trending-up',
    color: '#10B981',
  },
];

const { width } = Dimensions.get('window');

export const WeightGoalScreen = () => {
  const navigation = useNavigation<WeightGoalScreenNavigationProp>();
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [selectedGoal, setSelectedGoal] = useState<string>(onboardingData.weightGoal || '');
  const [targetWeight, setTargetWeight] = useState<string>(
    onboardingData.targetWeight?.value?.toString() || ''
  );
  const [error, setError] = useState<string>('');

  const handleContinue = async () => {
    if (!selectedGoal) {
      setError('Please select your weight goal');
      return;
    }

    if (!targetWeight || isNaN(Number(targetWeight))) {
      setError('Please enter a valid target weight');
      return;
    }

    await updateOnboardingData({
      weightGoal: selectedGoal,
      targetWeight: {
        value: Number(targetWeight),
        unit: onboardingData.weight?.unit || 'kg',
      },
    });

    navigation.navigate('Location');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#EDE9FE', '#DDD6FE']}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View 
          entering={FadeInDown.duration(1000).springify()}
          style={styles.content}
        >
          <Text style={styles.title}>What's your weight goal?</Text>
          <Text style={styles.subtitle}>
            This helps us create a personalized plan for you
          </Text>

          <View style={styles.goalsContainer}>
            {goalOptions.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                onPress={() => {
                  setSelectedGoal(goal.id);
                  setError('');
                }}
                style={styles.goalCard}
              >
                <LinearGradient
                  colors={selectedGoal === goal.id ? 
                    ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.8)'] : 
                    ['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.6)']}
                  style={[
                    styles.goalCardGradient,
                    selectedGoal === goal.id && styles.selectedGoal,
                  ]}
                >
                  <View style={[styles.iconContainer, { backgroundColor: goal.color }]}>
                    <Ionicons name={goal.icon} size={24} color="white" />
                  </View>
                  <View style={styles.goalInfo}>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    <Text style={styles.goalDescription}>{goal.description}</Text>
                  </View>
                  {selectedGoal === goal.id && (
                    <View style={styles.checkmark}>
                      <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.targetWeightContainer}>
            <Text style={styles.targetWeightLabel}>
              What's your target weight?
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={targetWeight}
                onChangeText={(text) => {
                  setTargetWeight(text);
                  setError('');
                }}
                placeholder="Enter target weight"
                keyboardType="numeric"
                placeholderTextColor="rgba(107, 114, 128, 0.7)"
              />
              <Text style={styles.unit}>{onboardingData.weight?.unit || 'kg'}</Text>
            </View>
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.continueButton,
              (!selectedGoal || !targetWeight) && styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={!selectedGoal || !targetWeight}
          >
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.9)', 'rgba(139, 92, 246, 0.8)']}
              style={styles.continueButtonGradient}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  goalsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  goalCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  goalCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  selectedGoal: {
    borderColor: '#8B5CF6',
    borderWidth: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  checkmark: {
    marginLeft: 12,
  },
  targetWeightContainer: {
    marginBottom: 24,
  },
  targetWeightLabel: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  unit: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  continueButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default WeightGoalScreen;
