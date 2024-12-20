import React, { useState } from 'react';
import {
  View,
  Text,
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
import { colors } from '../../theme/colors';
import { StatusBar } from 'expo-status-bar';

const NameInputScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const { updateOnboardingData } = useOnboarding();
  const { isDarkMode } = useTheme();

  const handleContinue = () => {
    if (name.trim()) {
      updateOnboardingData({ name: name.trim() });
      navigation.navigate('Birthday', { name: name.trim() });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
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
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[
              styles.title,
              { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
            ]}>What's your name?</Text>
            <Text style={[
              styles.subtitle,
              { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }
            ]}>Let's personalize your experience</Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F5',
                  color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light,
                  shadowColor: isDarkMode ? '#000000' : '#000000',
                }
              ]}
              placeholder="Enter your name"
              placeholderTextColor={isDarkMode ? '#666666' : '#999999'}
              value={name}
              onChangeText={setName}
              autoFocus
              onSubmitEditing={handleContinue}
            />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleContinue}
              disabled={!name.trim()}
            >
              <LinearGradient
                colors={isDarkMode ? 
                  [colors.primaryLight, colors.primary] :
                  [colors.primaryLight, colors.primary]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.button,
                  !name.trim() && styles.buttonDisabled
                ]}
              >
                <Text style={[
                  styles.buttonText,
                  !name.trim() && styles.buttonTextDisabled
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
              { backgroundColor: isDarkMode ? colors.primaryLight : colors.primary }
            ]} />
          </View>
        </View>
      </View>
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
  title: {
    fontSize: 34,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    letterSpacing: 0.2,
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
    fontSize: 17,
    fontWeight: '600',
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
