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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#EDE9FE', '#DDD6FE']}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>What's your lifestyle like?</Text>
            <Text style={styles.subtitle}>
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
                    selectedLifestyle === option.id && styles.selectedOption,
                  ]}
                  onPress={() => handleOptionPress(option.id)}
                  activeOpacity={0.9}
                >
                  <View style={styles.optionHeader}>
                    <View style={[
                      styles.iconContainer,
                      selectedLifestyle === option.id && styles.selectedIconContainer
                    ]}>
                      <Ionicons
                        name={option.icon}
                        size={24}
                        color={selectedLifestyle === option.id ? '#FFFFFF' : '#6B7280'}
                      />
                    </View>
                    <Text style={[
                      styles.optionTitle,
                      selectedLifestyle === option.id && styles.selectedOptionTitle
                    ]}>
                      {option.title}
                    </Text>
                  </View>
                  <Text style={[
                    styles.optionDescription,
                    selectedLifestyle === option.id && styles.selectedOptionDescription
                  ]}>
                    {option.description}
                  </Text>
                  <Text style={[
                    styles.optionExamples,
                    selectedLifestyle === option.id && styles.selectedOptionExamples
                  ]}>
                    {option.examples}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedLifestyle ? styles.continueButtonActive : styles.continueButtonInactive,
          ]}
          onPress={handleContinue}
          disabled={!selectedLifestyle}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.continueButtonText,
            selectedLifestyle ? styles.continueButtonTextActive : styles.continueButtonTextInactive,
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
    backgroundColor: '#FFFFFF',
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
    color: '#1F2937',
    marginBottom: 12,
    letterSpacing: 0.37,
  },
  subtitle: {
    fontSize: 17,
    color: '#6B7280',
    lineHeight: 22,
    letterSpacing: -0.41,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
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
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#8B5CF6',
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
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIconContainer: {
    backgroundColor: '#8B5CF6',
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    letterSpacing: 0.38,
  },
  selectedOptionTitle: {
    color: '#8B5CF6',
  },
  optionDescription: {
    fontSize: 17,
    color: '#4B5563',
    marginBottom: 8,
    letterSpacing: -0.41,
    lineHeight: 22,
  },
  selectedOptionDescription: {
    color: '#6D28D9',
  },
  optionExamples: {
    fontSize: 15,
    color: '#6B7280',
    fontStyle: 'italic',
    letterSpacing: -0.24,
    lineHeight: 20,
  },
  selectedOptionExamples: {
    color: '#8B5CF6',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 24,
    paddingTop: 16,
    backdropFilter: 'blur(20px)',
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  continueButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  continueButtonInactive: {
    backgroundColor: '#F3F4F6',
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.41,
  },
  continueButtonTextActive: {
    color: '#FFFFFF',
  },
  continueButtonTextInactive: {
    color: '#9CA3AF',
  },
});

export default LifestyleScreen;
