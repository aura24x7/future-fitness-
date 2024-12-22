import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  Animated,
  Easing,
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
  const { isDarkMode } = useTheme();

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  // Initial animation
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleOptionPress = useCallback((lifestyle: Lifestyle) => {
    // Card press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: 100,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedLifestyle(lifestyle);
  }, []);

  const handleContinuePress = useCallback(() => {
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(buttonScaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = useCallback(async () => {
    if (selectedLifestyle) {
      handleContinuePress();
      // Add slight delay for animation
      setTimeout(async () => {
        await updateOnboardingData({ lifestyle: selectedLifestyle });
        navigation.navigate('FinalSetup');
      }, 150);
    }
  }, [selectedLifestyle, navigation, updateOnboardingData]);

  const getOptionAnimationStyle = useCallback((index: number) => {
    return {
      opacity: fadeAnim,
      transform: [
        { translateY: slideAnim },
        { 
          scale: selectedLifestyle ? scaleAnim : 1
        }
      ],
    };
  }, [fadeAnim, slideAnim, scaleAnim, selectedLifestyle]);

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
          ['#FFFFFF', '#F5F3FF']
        }
        style={StyleSheet.absoluteFill}
      />
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 }
        ]}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
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
            {lifestyleOptions.map((option, index) => (
              <Animated.View
                key={option.id}
                style={[getOptionAnimationStyle(index)]}
              >
                <TouchableOpacity
                  onPress={() => handleOptionPress(option.id)}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={isDarkMode ?
                      [selectedLifestyle === option.id ? '#2A2A2A' : '#1A1A1A', 
                       selectedLifestyle === option.id ? '#252525' : '#151515']
                      : 
                      [selectedLifestyle === option.id ? '#FFFFFF' : '#FAFAFA',
                       selectedLifestyle === option.id ? '#F8F8F8' : '#F5F5F5']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0.8 }}
                    style={[
                      styles.optionCard,
                      {
                        borderColor: selectedLifestyle === option.id ? 
                          (isDarkMode ? colors.primaryLight : colors.primary) : 
                          (isDarkMode ? '#2A2A2A' : 'rgba(0,0,0,0.06)'),
                      },
                      selectedLifestyle === option.id && styles.selectedOption,
                    ]}
                  >
                    <View style={styles.optionHeader}>
                      <LinearGradient
                        colors={selectedLifestyle === option.id ?
                          isDarkMode ? 
                            [colors.primaryLight, colors.primary] :
                            [colors.primary, colors.primaryLight]
                          :
                          isDarkMode ?
                            ['#2A2A2A', '#252525'] :
                            ['#F3F4F6', '#E5E7EB']
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.iconContainer}
                      >
                        <Ionicons
                          name={option.icon}
                          size={22}
                          color={selectedLifestyle === option.id ? '#FFFFFF' : 
                            (isDarkMode ? colors.text.primary.dark : '#6B7280')}
                        />
                      </LinearGradient>
                      <Text style={[
                        styles.optionTitle,
                        { 
                          color: isDarkMode ? 
                            (selectedLifestyle === option.id ? colors.primaryLight : colors.text.primary.dark) : 
                            (selectedLifestyle === option.id ? colors.primary : '#1F2937')
                        }
                      ]}>
                        {option.title}
                      </Text>
                    </View>
                    <Text style={[
                      styles.optionDescription,
                      { 
                        color: isDarkMode ? 
                          (selectedLifestyle === option.id ? '#E5E7EB' : colors.text.secondary.dark) : 
                          (selectedLifestyle === option.id ? '#4C1D95' : '#4B5563')
                      }
                    ]}>
                      {option.description}
                    </Text>
                    <Text style={[
                      styles.optionExamples,
                      { 
                        color: isDarkMode ? 
                          (selectedLifestyle === option.id ? '#D1D5DB' : colors.text.secondary.dark) : 
                          (selectedLifestyle === option.id ? '#7C3AED' : '#6B7280')
                      }
                    ]}>
                      {option.examples}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View 
        style={[
          styles.footer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: Animated.multiply(slideAnim, -1) }]
          }
        ]}
      >
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!selectedLifestyle}
        >
          <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
            <LinearGradient
              colors={isDarkMode ? 
                [colors.primaryLight, colors.primary] :
                [colors.primary, colors.primaryLight]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.continueButton,
                !selectedLifestyle && { opacity: 0.5 }
              ]}
            >
              <Text style={[
                styles.continueButtonText,
                { color: '#FFFFFF' }
              ]}>
                Continue
              </Text>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
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
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.5,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
    letterSpacing: -0.2,
    opacity: 0.85,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  selectedOption: {
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
    lineHeight: 24,
  },
  optionDescription: {
    fontSize: 15,
    fontWeight: '400',
    marginBottom: 8,
    letterSpacing: -0.3,
    lineHeight: 20,
  },
  optionExamples: {
    fontSize: 14,
    fontWeight: '400',
    fontStyle: 'italic',
    letterSpacing: -0.2,
    lineHeight: 18,
    opacity: 0.75,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: 'transparent',
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});

export default LifestyleScreen;
