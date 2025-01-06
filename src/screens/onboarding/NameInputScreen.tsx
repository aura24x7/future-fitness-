import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding } from '../../context/OnboardingContext';
import { useTheme } from '../../theme/ThemeProvider';
import { StatusBar } from 'expo-status-bar';
import { Text } from '../../components/themed/Text';

const NameInputScreen: React.FC = () => {
  const [name, setName] = useState('');
  const { updateOnboardingData } = useOnboarding();
  const { colors, isDarkMode } = useTheme();

  const handleContinue = () => {
    if (name.trim()) {
      updateOnboardingData({ name: name.trim() });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <LinearGradient
        colors={isDarkMode ? ['#1a1b1e', '#2d2f34'] : ['#ffffff', '#f8f9fa']}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text variant="heading1" style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }}>
              What's your name?
            </Text>
            <Text variant="subtitle1" style={{ color: isDarkMode ? '#94A3B8' : '#6B7280' }}>
              We'll use this to personalize your experience
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={isDarkMode ? '#94A3B8' : '#6B7280'}
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#ffffff',
                  color: isDarkMode ? '#FFFFFF' : '#000000',
                }
              ]}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.button,
                !name.trim() && styles.buttonDisabled,
              ]}
              onPress={handleContinue}
              disabled={!name.trim()}
            >
              <LinearGradient
                colors={['#6366F1', '#4338CA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.button, !name.trim() && styles.buttonDisabled]}
              >
                <Text
                  variant="subtitle1"
                  style={[
                    styles.buttonText,
                    !name.trim() && styles.buttonTextDisabled
                  ]}
                >
                  Continue
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.progressBar}>
              <LinearGradient
                colors={['#6366F1', '#4338CA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.progress}
              />
            </View>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
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
    marginTop: 60,
  },
  inputContainer: {
    marginTop: 32,
  },
  input: {
    borderRadius: 16,
    padding: 16,
    fontSize: 17,
    width: '100%',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: width - 48,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#9F7AEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  buttonTextDisabled: {
    opacity: 0.7,
  },
  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    marginTop: 48,
  },
  progress: {
    height: '100%',
    width: '20%',
    borderRadius: 2,
  },
});

export default NameInputScreen;
