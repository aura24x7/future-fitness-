import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding } from '../../context/OnboardingContext';
import { useTheme } from '../../theme/ThemeProvider';
import { colors } from '../../theme/colors';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Welcome: undefined;
  NameInput: undefined;
  Birthday: undefined;
  Gender: undefined;
  HeightWeight: undefined;
  DietaryPreference: undefined;
  WeightGoal: undefined;
  Location: undefined;
  FinalSetup: undefined;
};

type DietaryPreferenceScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DietaryPreference'>;
};

type DietaryPreference = 'NONE' | 'VEGETARIAN' | 'VEGAN' | 'KETO' | 'PALEO';

const dietaryOptions: { id: DietaryPreference; title: string; emoji: string; description: string }[] = [
  {
    id: 'NONE',
    title: 'No Preference',
    emoji: '🍽️',
    description: 'I eat everything',
  },
  {
    id: 'VEGETARIAN',
    title: 'Vegetarian',
    emoji: '🥗',
    description: 'No meat, but yes to dairy and eggs',
  },
  {
    id: 'VEGAN',
    title: 'Vegan',
    emoji: '🌱',
    description: 'Plant-based foods only',
  },
  {
    id: 'KETO',
    title: 'Keto',
    emoji: '🥑',
    description: 'High-fat, low-carb diet',
  },
  {
    id: 'PALEO',
    title: 'Paleo',
    emoji: '🍖',
    description: 'Based on whole, unprocessed foods',
  },
];

const DietaryPreferenceScreen: React.FC<DietaryPreferenceScreenProps> = ({ navigation }) => {
  const [selectedPreference, setSelectedPreference] = useState<DietaryPreference | null>(null);
  const { updateOnboardingData } = useOnboarding();
  const { isDarkMode } = useTheme();

  const handleContinue = async () => {
    if (!selectedPreference) {
      return;
    }

    try {
      await updateOnboardingData({ dietaryPreference: selectedPreference });
      navigation.navigate('WeightGoal');
    } catch (error) {
      console.error('Error updating dietary preference:', error);
      Alert.alert(
        'Error',
        'Failed to save your dietary preference. Please try again.'
      );
    }
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDarkMode ? colors.background.dark : colors.background.light }
    ]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <LinearGradient
        colors={isDarkMode ? 
          [colors.background.dark, colors.background.dark] : 
          [colors.background.light, '#F5F3FF']
        }
        style={StyleSheet.absoluteFill}
      />
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
            ]}>Any dietary preferences?</Text>
            <Text style={[
              styles.subtitle,
              { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }
            ]}>
              I'll customize your meal plans accordingly
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            {dietaryOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: isDarkMode ? '#1A1A1A' : '#f5f5f5',
                    borderColor: selectedPreference === option.id ? 
                      (isDarkMode ? colors.primaryLight : colors.primary) : 
                      (isDarkMode ? '#2A2A2A' : 'transparent'),
                    borderWidth: 1,
                  },
                  selectedPreference === option.id && styles.selectedOption,
                ]}
                onPress={() => setSelectedPreference(option.id)}
              >
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                <View style={styles.optionTextContainer}>
                  <Text style={[
                    styles.optionTitle,
                    { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light },
                    selectedPreference === option.id && {
                      color: isDarkMode ? colors.primaryLight : colors.primary,
                      fontWeight: '700',
                    },
                  ]}>
                    {option.title}
                  </Text>
                  <Text style={[
                    styles.optionDescription,
                    { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light },
                    selectedPreference === option.id && {
                      color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light,
                    },
                  ]}>
                    {option.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.button,
                !selectedPreference && styles.buttonDisabled
              ]}
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
              { backgroundColor: isDarkMode ? colors.primaryLight : '#9F7AEA' }
            ]} />
          </View>
        </View>
      </ScrollView>
    </View>
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
    width: '80%',
    height: '100%',
    borderRadius: 3,
  },
});

export default DietaryPreferenceScreen;
