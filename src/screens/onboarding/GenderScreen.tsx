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
import { useOnboarding } from '../../context/OnboardingContext';

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

const GenderScreen = ({ navigation }) => {
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const { updateOnboardingData } = useOnboarding();

  const handleContinue = () => {
    if (selectedGender) {
      updateOnboardingData({ gender: selectedGender });
      navigation.navigate('HeightWeight');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>What's your gender?</Text>
          <Text style={styles.subtitle}>
            This helps me provide more personalized recommendations
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {genderOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
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
                selectedGender === option.id && styles.selectedOptionTitle,
              ]}>
                {option.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, !selectedGender && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={!selectedGender}
          >
            <LinearGradient
              colors={['#B794F6', '#9F7AEA']}
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

        <View style={styles.progressBar}>
          <View style={[styles.progress]} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    color: '#1A1A1A',
    marginTop: 24,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    paddingHorizontal: 12,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: width * 0.27,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F2F2F2',
  },
  selectedOption: {
    borderColor: '#9F7AEA',
    borderWidth: 2,
    transform: [{ scale: 1.02 }],
  },
  optionEmoji: {
    fontSize: 32,
    marginBottom: 12,
    opacity: 0.8,
  },
  selectedOptionEmoji: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  optionTitle: {
    color: '#666666',
    fontSize: 15,
    fontWeight: '500',
  },
  selectedOptionTitle: {
    color: '#9F7AEA',
    fontWeight: '600',
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
  buttonDisabled: {
    opacity: 0.5,
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
    backgroundColor: '#F2F2F2',
    borderRadius: 2,
    marginTop: 20,
  },
  progress: {
    width: '50%',
    height: '100%',
    backgroundColor: '#9F7AEA',
    borderRadius: 2,
  },
});

export default GenderScreen;
