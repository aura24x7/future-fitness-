import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { mockAuth } from '../services/mockData';
import { AppError, ErrorCodes, validateEmail, validatePassword } from '../utils/errorHandling';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (text.trim() && !validateEmail(text)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordError('');
  };

  const handleLogin = async () => {
    try {
      // Input validation
      if (!email.trim()) {
        throw new AppError(
          'Email is required',
          ErrorCodes.REQUIRED_FIELD_MISSING,
          'LoginScreen',
          'handleLogin'
        );
      }

      if (!validateEmail(email)) {
        throw new AppError(
          'Please enter a valid email address',
          ErrorCodes.INVALID_EMAIL,
          'LoginScreen',
          'handleLogin'
        );
      }

      if (!password) {
        throw new AppError(
          'Password is required',
          ErrorCodes.REQUIRED_FIELD_MISSING,
          'LoginScreen',
          'handleLogin'
        );
      }

      setLoading(true);
      
      try {
        await mockAuth.login(email.trim(), password);
        navigation.replace('Main');
      } catch (error) {
        // Handle authentication-specific errors
        throw new AppError(
          error.message || 'Login failed',
          ErrorCodes.AUTH_FAILED,
          'LoginScreen',
          'handleLogin',
          error
        );
      }
    } catch (error) {
      if (error instanceof AppError) {
        Alert.alert('Login Error', error.message, [
          {
            text: 'OK',
            onPress: () => {
              // Additional error handling based on error code
              switch (error.code) {
                case ErrorCodes.INVALID_EMAIL:
                  // Focus email input
                  break;
                case ErrorCodes.AUTH_FAILED:
                  // Clear password
                  setPassword('');
                  break;
              }
            },
          },
        ]);
      } else {
        Alert.alert(
          'Unexpected Error',
          'An unexpected error occurred. Please try again later.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <Card style={styles.card}>
        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
          error={emailError}
        />
        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={handlePasswordChange}
          secureTextEntry
          error={passwordError}
        />
        <Button
          title={loading ? 'Loading...' : 'Login'}
          onPress={handleLogin}
          disabled={loading}
        />
        <Button
          title="Create Account"
          onPress={() => navigation.navigate('Register')}
          variant="outline"
          style={styles.registerButton}
        />
      </Card>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    padding: 20,
  },
  registerButton: {
    marginTop: 12,
  },
});

export default LoginScreen;
