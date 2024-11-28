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

type ActivityLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

const activityLevels: {
  id: ActivityLevel;
  title: string;
  emoji: string;
  description: string;
}[] = [
  {
    id: 'BEGINNER',
    title: 'Beginner',
    emoji: '🌱',
    description: 'New to fitness or returning after a long break',
  },
  {
    id: 'INTERMEDIATE',
    title: 'Intermediate',
    emoji: '⭐',
    description: 'Regular exercise 2-3 times per week',
  },
  {
    id: 'ADVANCED',
    title: 'Advanced',
    emoji: '🔥',
    description: 'Consistent training 4-5 times per week',
  },
  {
    id: 'EXPERT',
    title: 'Expert',
    emoji: '💫',
    description: 'Dedicated athlete with years of experience',
  },
];

const ActivityLevelScreen = ({ navigation }) => {
  const [selectedLevel, setSelectedLevel] = useState<ActivityLevel | null>(null);
  const { updateOnboardingData } = useOnboarding();

  const handleContinue = () => {
    if (selectedLevel) {
      updateOnboardingData({ activityLevel: selectedLevel });
      navigation.navigate('DietaryPreference');
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
          <Text style={styles.title}>What's your activity level?</Text>
          <Text style={styles.subtitle}>
            This helps me set the right intensity for your workouts
          </Text>
        </View>

        <ScrollView
          style={styles.levelsContainer}
          showsVerticalScrollIndicator={false}
        >
          {activityLevels.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.levelCard,
                selectedLevel === level.id && styles.selectedLevel,
              ]}
              onPress={() => setSelectedLevel(level.id)}
            >
              <Text style={styles.levelEmoji}>{level.emoji}</Text>
              <View style={styles.levelTextContainer}>
                <Text style={styles.levelTitle}>{level.title}</Text>
                <Text style={styles.levelDescription}>{level.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, !selectedLevel && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={!selectedLevel}
          >
            <Text style={[styles.buttonText, !selectedLevel && styles.buttonTextDisabled]}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: '80%' }]} />
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
  levelsContainer: {
    marginTop: 30,
  },
  levelCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedLevel: {
    backgroundColor: '#e6eeff',
    borderWidth: 2,
    borderColor: '#4c669f',
  },
  levelEmoji: {
    fontSize: 30,
    marginRight: 15,
  },
  levelTextContainer: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4c669f',
    marginBottom: 5,
  },
  levelDescription: {
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

export default ActivityLevelScreen;
