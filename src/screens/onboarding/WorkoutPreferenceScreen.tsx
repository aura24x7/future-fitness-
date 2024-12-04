import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding } from '../../context/OnboardingContext';

type WorkoutPreference = 'HOME' | 'GYM' | 'OUTDOOR' | 'HYBRID';

const workoutOptions: { id: WorkoutPreference; title: string; emoji: string; description: string }[] = [
  {
    id: 'HOME',
    title: 'Home Workouts',
    emoji: '🏠',
    description: 'Exercise with minimal equipment at home',
  },
  {
    id: 'GYM',
    title: 'Gym Training',
    emoji: '💪',
    description: 'Access to full gym equipment',
  },
  {
    id: 'OUTDOOR',
    title: 'Outdoor Activities',
    emoji: '🏃',
    description: 'Running, cycling, and outdoor exercises',
  },
  {
    id: 'HYBRID',
    title: 'Mix & Match',
    emoji: '🔄',
    description: 'Combination of different workout styles',
  },
];

const WorkoutPreferenceScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selectedPreference, setSelectedPreference] = useState<WorkoutPreference | null>(null);
  const { updateOnboardingData } = useOnboarding();

  const handleContinue = async () => {
    if (selectedPreference) {
      await updateOnboardingData({
        workoutPreference: selectedPreference,
      });
      navigation.navigate('ActivityLevel');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Where do you prefer to workout?</Text>
            <Text style={styles.subtitle}>
              I'll tailor your workout plan to your preferred environment
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            {workoutOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  selectedPreference === option.id && styles.selectedOption,
                ]}
                onPress={() => setSelectedPreference(option.id)}
              >
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                <View style={styles.optionTextContainer}>
                  <Text style={[
                    styles.optionTitle,
                    selectedPreference === option.id && styles.selectedOptionTitle,
                  ]}>
                    {option.title}
                  </Text>
                  <Text style={[
                    styles.optionDescription,
                    selectedPreference === option.id && styles.selectedOptionDescription,
                  ]}>
                    {option.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, !selectedPreference && styles.buttonDisabled]}
              onPress={handleContinue}
              disabled={!selectedPreference}
            >
              <LinearGradient
                colors={['#B794F6', '#9F7AEA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[StyleSheet.absoluteFill, styles.buttonGradient]}
              />
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progress]} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    color: '#1a1a1a',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 10,
    textAlign: 'center',
  },
  optionsContainer: {
    marginTop: 40,
    paddingHorizontal: 10,
  },
  optionCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  selectedOption: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#9F7AEA',
  },
  optionEmoji: {
    fontSize: 32,
    marginRight: 15,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedOptionTitle: {
    color: '#9F7AEA',
    fontWeight: '700',
  },
  optionDescription: {
    color: '#666666',
    fontSize: 14,
  },
  selectedOptionDescription: {
    color: '#666666',
  },
  footer: {
    marginTop: 40,
    marginBottom: 40,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonGradient: {
    borderRadius: 28,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(159, 122, 234, 0.2)',
    borderRadius: 3,
    marginTop: 20,
  },
  progress: {
    width: '90%',
    height: '100%',
    backgroundColor: '#9F7AEA',
    borderRadius: 3,
  },
});

export default WorkoutPreferenceScreen;
