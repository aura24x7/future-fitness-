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
import EvaPlaceholder from '../../components/EvaPlaceholder';

const NameInputScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const { updateOnboardingData } = useOnboarding();

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
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <EvaPlaceholder size={80} />
            <Text style={styles.title}>What's your name?</Text>
            <Text style={styles.subtitle}>Let's personalize your experience</Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#999999"
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
                colors={['#B794F6', '#9F7AEA']}
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

          <View style={styles.progressBar}>
            <View style={[styles.progress, { width: '20%' }]} />
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
    backgroundColor: '#FFFFFF',
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
    color: '#1A1A1A',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#666666',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  inputContainer: {
    marginTop: 32,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    fontSize: 17,
    color: '#1A1A1A',
    width: '100%',
    shadowColor: '#000000',
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
    backgroundColor: '#F2F2F2',
    borderRadius: 2,
    marginTop: 48,
  },
  progress: {
    height: '100%',
    backgroundColor: '#9F7AEA',
    borderRadius: 2,
  },
});

export default NameInputScreen;
