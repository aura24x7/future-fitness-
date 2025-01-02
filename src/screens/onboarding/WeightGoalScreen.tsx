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
import { useTheme } from '../../theme/ThemeProvider';
import { colors } from '../../theme/colors';
import { StatusBar } from 'expo-status-bar';

type WeightGoalScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WeightGoal'>;

type WeightGoal = 'LOSE_WEIGHT' | 'MAINTAIN_WEIGHT' | 'GAIN_WEIGHT';

interface GoalOption {
  id: WeightGoal;
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
  const [selectedGoal, setSelectedGoal] = useState<WeightGoal | undefined>(
    onboardingData.weightGoal as WeightGoal | undefined
  );
  const [targetWeight, setTargetWeight] = useState<string>(
    onboardingData.targetWeight?.value?.toString() || ''
  );
  const [error, setError] = useState<string>('');
  const { isDarkMode } = useTheme();

  const handleContinue = async () => {
    if (!selectedGoal) {
      setError('Please select your weight goal');
      return;
    }

    if (!targetWeight || isNaN(Number(targetWeight))) {
      setError('Please enter a valid target weight');
      return;
    }

    try {
      await updateOnboardingData({
        weightGoal: selectedGoal,
        targetWeight: {
          value: Number(targetWeight),
          unit: onboardingData.weight?.unit || 'kg',
        },
      });

      navigation.navigate('Location');
    } catch (error) {
      console.error('Error updating weight goal:', error);
      setError('Failed to save your weight goal. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? colors.background.dark : colors.background.light }
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <LinearGradient
        colors={isDarkMode ? 
          [colors.background.dark, colors.background.dark] : 
          ['#EDE9FE', '#DDD6FE']
        }
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
          <Text style={[
            styles.title,
            { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
          ]}>What's your weight goal?</Text>
          <Text style={[
            styles.subtitle,
            { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }
          ]}>
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
                  colors={isDarkMode ?
                    [selectedGoal === goal.id ? '#2A2A2A' : '#1A1A1A', selectedGoal === goal.id ? '#2A2A2A' : '#1A1A1A'] :
                    [selectedGoal === goal.id ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)', selectedGoal === goal.id ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.6)']
                  }
                  style={[
                    styles.goalCardGradient,
                    {
                      borderColor: selectedGoal === goal.id ? 
                        (isDarkMode ? colors.primaryLight : colors.primary) : 
                        (isDarkMode ? '#2A2A2A' : 'rgba(255,255,255,0.4)'),
                    },
                  ]}
                >
                  <View style={[styles.iconContainer, { backgroundColor: goal.color }]}>
                    <Ionicons name={goal.icon} size={24} color="white" />
                  </View>
                  <View style={styles.goalInfo}>
                    <Text style={[
                      styles.goalTitle,
                      { 
                        color: isDarkMode ? 
                          (selectedGoal === goal.id ? colors.primaryLight : colors.text.primary.dark) : 
                          (selectedGoal === goal.id ? colors.primary : colors.text.primary.light)
                      }
                    ]}>{goal.title}</Text>
                    <Text style={[
                      styles.goalDescription,
                      { 
                        color: isDarkMode ? 
                          (selectedGoal === goal.id ? colors.text.primary.dark : colors.text.secondary.dark) : 
                          (selectedGoal === goal.id ? colors.text.primary.light : colors.text.secondary.light)
                      }
                    ]}>{goal.description}</Text>
                  </View>
                  {selectedGoal === goal.id && (
                    <View style={styles.checkmark}>
                      <Ionicons 
                        name="checkmark-circle" 
                        size={24} 
                        color={isDarkMode ? colors.primaryLight : colors.primary} 
                      />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.targetWeightContainer}>
            <Text style={[
              styles.targetWeightLabel,
              { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
            ]}>
              What's your target weight?
            </Text>
            <View style={[
              styles.inputContainer,
              { 
                backgroundColor: isDarkMode ? '#1A1A1A' : 'rgba(255, 255, 255, 0.7)',
                borderColor: isDarkMode ? '#2A2A2A' : 'rgba(139, 92, 246, 0.2)'
              }
            ]}>
              <TextInput
                style={[
                  styles.input,
                  { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
                ]}
                value={targetWeight}
                onChangeText={(text) => {
                  setTargetWeight(text);
                  setError('');
                }}
                placeholder="Enter target weight"
                keyboardType="numeric"
                placeholderTextColor={isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(107, 114, 128, 0.7)'}
              />
              <Text style={[
                styles.unit,
                { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }
              ]}>{onboardingData.weight?.unit || 'kg'}</Text>
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
              colors={isDarkMode ? 
                [colors.primaryLight, colors.primary] :
                ['rgba(139, 92, 246, 0.9)', 'rgba(139, 92, 246, 0.8)']
              }
              style={styles.continueButtonGradient}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={[
            styles.progressBar,
            { backgroundColor: isDarkMode ? '#1A1A1A' : 'rgba(139, 92, 246, 0.2)' }
          ]}>
            <View style={[
              styles.progress,
              { backgroundColor: isDarkMode ? colors.primaryLight : colors.primary }
            ]} />
          </View>
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
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
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
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
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
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  unit: {
    fontSize: 16,
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
  progressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    marginTop: 20,
  },
  progress: {
    width: '85%',
    height: '100%',
    borderRadius: 3,
  },
});

export default WeightGoalScreen;
