import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useTheme } from '../../theme/ThemeProvider';
import { colors } from '../../theme/colors';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';

type GenderScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Gender'>;

interface GenderScreenProps {
  navigation: GenderScreenNavigationProp;
}

type Gender = 'MALE' | 'FEMALE' | 'OTHER';

const genderOptions: { id: Gender; title: string; emoji: string }[] = [
  {
    id: 'MALE',
    title: 'Male',
    emoji: '👨',
  },
  {
    id: 'FEMALE',
    title: 'Female',
    emoji: '👩',
  },
  {
    id: 'OTHER',
    title: 'Other',
    emoji: '🫂',
  },
];

const GenderScreen: React.FC<GenderScreenProps> = ({ navigation }) => {
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const { updateOnboardingData } = useOnboarding();
  const { isDarkMode } = useTheme();

  const handleContinue = () => {
    if (selectedGender) {
      updateOnboardingData({ gender: selectedGender });
      navigation.navigate('HeightWeight');
    }
  };

  return (
    <SafeAreaView style={[
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
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[
            styles.title,
            { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
          ]}>What's your gender?</Text>
          <Text style={[
            styles.subtitle,
            { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }
          ]}>
            This helps me provide more personalized recommendations
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {genderOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                {
                  backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                  borderColor: selectedGender === option.id ? 
                    (isDarkMode ? colors.primaryLight : colors.primary) : 
                    (isDarkMode ? '#2A2A2A' : '#F2F2F2'),
                },
                selectedGender === option.id && styles.selectedOption,
              ]}
              onPress={() => setSelectedGender(option.id)}
            >
              <Text style={[
                styles.optionEmoji,
                selectedGender === option.id && styles.selectedOptionEmoji,
              ]}>
                {option.emoji}
              </Text>
              <Text style={[
                styles.optionTitle,
                { color: isDarkMode ? colors.text.secondary.dark : '#666666' },
                selectedGender === option.id && {
                  color: isDarkMode ? colors.primaryLight : colors.primary,
                  fontWeight: '600',
                },
              ]}>
                {option.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.button,
              { opacity: !selectedGender ? 0.5 : 1 }
            ]}
            onPress={handleContinue}
            disabled={!selectedGender}
          >
            <LinearGradient
              colors={isDarkMode ? 
                [colors.primaryLight, colors.primary] :
                [colors.primaryLight, colors.primary]
              }
              style={[
                styles.gradientButton,
                !selectedGender && styles.gradientButtonDisabled,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[
                styles.buttonText,
                !selectedGender && styles.buttonTextDisabled
              ]}>
                Continue
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={[
          styles.progressBar,
          { backgroundColor: isDarkMode ? '#1A1A1A' : '#F2F2F2' }
        ]}>
          <View style={[
            styles.progress,
            { 
              width: '50%',
              backgroundColor: isDarkMode ? colors.primaryLight : colors.primary 
            }
          ]} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 24,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsContainer: {
    marginTop: 40,
    paddingHorizontal: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
  },
  selectedOption: {
    borderWidth: 2,
    transform: [{ scale: 1.02 }],
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: 16,
    opacity: 0.8,
  },
  selectedOptionEmoji: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '500',
  },
  footer: {
    marginBottom: 40,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  gradientButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientButtonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTextDisabled: {
    opacity: 0.7,
  },
  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    marginTop: 20,
  },
  progress: {
    height: '100%',
    borderRadius: 2,
  },
});

export default GenderScreen;
