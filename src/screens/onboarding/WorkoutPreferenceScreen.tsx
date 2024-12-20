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
import { useTheme } from '../../theme/ThemeProvider';
import { colors } from '../../theme/colors';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

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

type WorkoutPreferenceScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'WorkoutPreference'>;
};

const WorkoutPreferenceScreen: React.FC<WorkoutPreferenceScreenProps> = ({ navigation }) => {
  const [selectedPreference, setSelectedPreference] = useState<WorkoutPreference | null>(null);
  const { updateOnboardingData } = useOnboarding();
  const { isDarkMode } = useTheme();

  const handleContinue = async () => {
    if (selectedPreference) {
      await updateOnboardingData({
        workoutPreference: selectedPreference,
      });
      navigation.navigate('ActivityLevel');
    }
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDarkMode ? colors.background.dark : colors.background.light }
    ]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[
              styles.title,
              { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
            ]}>Where do you prefer to workout?</Text>
            <Text style={[
              styles.subtitle,
              { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }
            ]}>
              I'll tailor your workout plan to your preferred environment
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            {workoutOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  { 
                    backgroundColor: isDarkMode ? 
                      (selectedPreference === option.id ? '#2A2A2A' : '#1A1A1A') : 
                      (selectedPreference === option.id ? '#ffffff' : '#f5f5f5')
                  },
                  selectedPreference === option.id && [
                    styles.selectedOption,
                    { borderColor: isDarkMode ? colors.primaryLight : colors.primary }
                  ],
                ]}
                onPress={() => setSelectedPreference(option.id)}
              >
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                <View style={styles.optionTextContainer}>
                  <Text style={[
                    styles.optionTitle,
                    { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light },
                    selectedPreference === option.id && [
                      styles.selectedOptionTitle,
                      { color: isDarkMode ? colors.primaryLight : colors.primary }
                    ],
                  ]}>
                    {option.title}
                  </Text>
                  <Text style={[
                    styles.optionDescription,
                    { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }
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
                colors={isDarkMode ? 
                  [colors.primaryLight, colors.primary] :
                  ['#B794F6', '#9F7AEA']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[StyleSheet.absoluteFill, styles.buttonGradient]}
              />
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>

          <View style={[
            styles.progressBar,
            { backgroundColor: isDarkMode ? '#1A1A1A' : 'rgba(159, 122, 234, 0.2)' }
          ]}>
            <View style={[
              styles.progress,
              { backgroundColor: isDarkMode ? colors.primaryLight : colors.primary }
            ]} />
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
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  optionsContainer: {
    marginTop: 40,
    paddingHorizontal: 10,
  },
  optionCard: {
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
    borderWidth: 2,
  },
  optionEmoji: {
    fontSize: 32,
    marginRight: 15,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedOptionTitle: {
    fontWeight: '700',
  },
  optionDescription: {
    fontSize: 14,
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
    borderRadius: 3,
    marginTop: 20,
  },
  progress: {
    width: '90%',
    height: '100%',
    borderRadius: 3,
  },
});

export default WorkoutPreferenceScreen;
