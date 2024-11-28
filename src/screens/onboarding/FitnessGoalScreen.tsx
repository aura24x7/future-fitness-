import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding } from '../../context/OnboardingContext';
import EvaPlaceholder from '../../components/EvaPlaceholder';

type FitnessGoal = 'LOSE_WEIGHT' | 'BUILD_MUSCLE' | 'IMPROVE_FITNESS' | 'MAINTAIN_HEALTH';

const goals: { id: FitnessGoal; title: string; emoji: string; description: string }[] = [
  {
    id: 'LOSE_WEIGHT',
    title: 'Lose Weight',
    emoji: '⚖️',
    description: 'Burn fat and achieve a healthy weight',
  },
  {
    id: 'BUILD_MUSCLE',
    title: 'Build Muscle',
    emoji: '💪',
    description: 'Gain strength and muscle mass',
  },
  {
    id: 'IMPROVE_FITNESS',
    title: 'Improve Fitness',
    emoji: '🏃',
    description: 'Enhance endurance and overall fitness',
  },
  {
    id: 'MAINTAIN_HEALTH',
    title: 'Maintain Health',
    emoji: '❤️',
    description: 'Stay active and maintain current fitness',
  },
];

const FitnessGoalScreen = ({ navigation }) => {
  const [selectedGoal, setSelectedGoal] = useState<FitnessGoal | null>(null);
  const { updateOnboardingData } = useOnboarding();

  const handleContinue = () => {
    if (selectedGoal) {
      updateOnboardingData({ fitnessGoal: selectedGoal });
      navigation.navigate('ActivityLevel');
    }
  };

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <EvaPlaceholder size={120} />
          <Text style={styles.title}>What's your main fitness goal?</Text>
          <Text style={styles.subtitle}>
            I'll customize your plan based on your goal
          </Text>
        </View>

        <ScrollView 
          style={styles.goalsContainer}
          showsVerticalScrollIndicator={false}
        >
          {goals.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalCard,
                selectedGoal === goal.id && styles.selectedGoal,
              ]}
              onPress={() => setSelectedGoal(goal.id)}
            >
              <Text style={styles.goalEmoji}>{goal.emoji}</Text>
              <View style={styles.goalTextContainer}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={styles.goalDescription}>{goal.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, !selectedGoal && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={!selectedGoal}
          >
            <Text style={[styles.buttonText, !selectedGoal && styles.buttonTextDisabled]}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: '60%' }]} />
        </View>
      </View>
    </LinearGradient>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    marginTop: 10,
    textAlign: 'center',
  },
  goalsContainer: {
    marginTop: 30,
  },
  goalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedGoal: {
    backgroundColor: '#e6eeff',
    borderWidth: 2,
    borderColor: '#4c669f',
  },
  goalEmoji: {
    fontSize: 30,
    marginRight: 15,
  },
  goalTextContainer: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4c669f',
    marginBottom: 5,
  },
  goalDescription: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: width * 0.8,
    alignSelf: 'center',
  },
  buttonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  buttonText: {
    color: '#4c669f',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonTextDisabled: {
    color: '#999',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    marginTop: 20,
  },
  progress: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 3,
  },
});

export default FitnessGoalScreen;
