import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding } from '../../context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { colors } from '../../theme/colors';
import { StatusBar } from 'expo-status-bar';

type Lifestyle = 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'SUPER_ACTIVE';

const lifestyleOptions: {
  id: Lifestyle;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  examples: string;
}[] = [
  {
    id: 'SEDENTARY',
    title: 'Mostly Sedentary',
    description: 'Desk job, little to no exercise',
    icon: 'laptop-outline',
    examples: 'Office work, driving, watching TV',
  },
  {
    id: 'LIGHTLY_ACTIVE',
    title: 'Lightly Active',
    description: 'Light exercise 1-3 days/week',
    icon: 'walk-outline',
    examples: 'Walking, light housework, casual cycling',
  },
  {
    id: 'MODERATELY_ACTIVE',
    title: 'Moderately Active',
    description: 'Moderate exercise 3-5 days/week',
    icon: 'bicycle-outline',
    examples: 'Jogging, swimming, dancing, tennis',
  },
  {
    id: 'VERY_ACTIVE',
    title: 'Very Active',
    description: 'Hard exercise 6-7 days/week',
    icon: 'fitness-outline',
    examples: 'Running, HIIT, team sports, gym training',
  },
  {
    id: 'SUPER_ACTIVE',
    title: 'Super Active',
    description: 'Very hard exercise & physical job',
    icon: 'barbell-outline',
    examples: 'Athletic training, physical labor, multiple workouts/day',
  },
];

const LifestyleScreen = ({ navigation }) => {
  const [selectedLifestyle, setSelectedLifestyle] = useState<Lifestyle | null>(null);
  const { updateOnboardingData } = useOnboarding();
  const insets = useSafeAreaInsets();
  const [scaleAnim] = useState(() => new Animated.Value(1));
  const { isDarkMode } = useTheme();

  const handleOptionPress = (lifestyle: Lifestyle) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    setSelectedLifestyle(lifestyle);
  };

  const handleContinue = async () => {
    if (selectedLifestyle) {
      await updateOnboardingData({ lifestyle: selectedLifestyle });
      navigation.navigate('FinalSetup');
    }
  };

  return (
    <View style={[
      styles.container,
      { 
        paddingTop: insets.top,
        backgroundColor: isDarkMode ? colors.background.dark : colors.background.light 
      }
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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 }
        ]}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[
              styles.title,
              { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
            ]}>What's your lifestyle like?</Text>
            <Text style={[
              styles.subtitle,
              { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }
            ]}>
              This helps me calculate your daily energy needs accurately
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            {lifestyleOptions.map((option) => (
              <Animated.View
                key={option.id}
                style={[
                  { transform: [{ scale: selectedLifestyle === option.id ? scaleAnim : 1 }] }
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                      borderColor: selectedLifestyle === option.id ? 
                        (isDarkMode ? colors.primaryLight : colors.primary) : 
                        'transparent',
                    },
                    selectedLifestyle === option.id && styles.selectedOption,
                  ]}
                  onPress={() => handleOptionPress(option.id)}
                  activeOpacity={0.9}
                >
                  <View style={styles.optionHeader}>
                    <View style={[
                      styles.iconContainer,
                      {
                        backgroundColor: isDarkMode ? '#2A2A2A' : '#F3F4F6',
                      },
                      selectedLifestyle === option.id && {
                        backgroundColor: isDarkMode ? colors.primaryLight : colors.primary,
                      }
                    ]}>
                      <Ionicons
                        name={option.icon}
                        size={24}
                        color={selectedLifestyle === option.id ? '#FFFFFF' : 
                          (isDarkMode ? colors.text.primary.dark : '#6B7280')}
                      />
                    </View>
                    <Text style={[
                      styles.optionTitle,
                      { color: isDarkMode ? colors.text.primary.dark : '#1F2937' },
                      selectedLifestyle === option.id && {
                        color: isDarkMode ? colors.primaryLight : colors.primary,
                      }
                    ]}>
                      {option.title}
                    </Text>
                  </View>
                  <Text style={[
                    styles.optionDescription,
                    { color: isDarkMode ? colors.text.secondary.dark : '#4B5563' },
                    selectedLifestyle === option.id && {
                      color: isDarkMode ? colors.text.primary.dark : '#6D28D9',
                    }
                  ]}>
                    {option.description}
                  </Text>
                  <Text style={[
                    styles.optionExamples,
                    { color: isDarkMode ? colors.text.secondary.dark : '#6B7280' },
                    selectedLifestyle === option.id && {
                      color: isDarkMode ? colors.text.secondary.dark : '#8B5CF6',
                    }
                  ]}>
                    {option.examples}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[
        styles.footer,
        { 
          paddingBottom: insets.bottom + 16,
          backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        }
      ]}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedLifestyle ? styles.continueButtonActive : styles.continueButtonInactive,
            {
              backgroundColor: selectedLifestyle ? 
                (isDarkMode ? colors.primaryLight : colors.primary) : 
                (isDarkMode ? '#2A2A2A' : '#F3F4F6'),
            }
          ]}
          onPress={handleContinue}
          disabled={!selectedLifestyle}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.continueButtonText,
            selectedLifestyle ? styles.continueButtonTextActive : styles.continueButtonTextInactive,
            {
              color: selectedLifestyle ? 
                '#FFFFFF' : 
                (isDarkMode ? colors.text.secondary.dark : '#9CA3AF'),
            }
          ]}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
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
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.37,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.41,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  selectedOption: {
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.38,
  },
  optionDescription: {
    fontSize: 17,
    marginBottom: 8,
    letterSpacing: -0.41,
    lineHeight: 22,
  },
  optionExamples: {
    fontSize: 15,
    fontStyle: 'italic',
    letterSpacing: -0.24,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    backdropFilter: 'blur(20px)',
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  continueButtonActive: {},
  continueButtonInactive: {},
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.41,
  },
  continueButtonTextActive: {},
  continueButtonTextInactive: {},
});

export default LifestyleScreen;
