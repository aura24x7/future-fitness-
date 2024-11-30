import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { AppError, ErrorCodes, validateEmail, validatePassword } from '../utils/errorHandling';
import { useAuth } from '../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const { register } = useAuth();

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
    if (text && !validatePassword(text)) {
      setPasswordError(
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
      );
    } else {
      setPasswordError('');
    }
  };

  const handleNameChange = (text: string) => {
    setName(text);
    if (!text.trim()) {
      setNameError('Name is required');
    } else {
      setNameError('');
    }
  };

  const handleRegister = async () => {
    try {
      // Input validation
      if (!name.trim()) {
        throw new AppError(
          'Name is required',
          ErrorCodes.REQUIRED_FIELD_MISSING,
          'RegisterScreen',
          'handleRegister'
        );
      }

      if (!email.trim()) {
        throw new AppError(
          'Email is required',
          ErrorCodes.REQUIRED_FIELD_MISSING,
          'RegisterScreen',
          'handleRegister'
        );
      }

      if (!validateEmail(email)) {
        throw new AppError(
          'Please enter a valid email address',
          ErrorCodes.INVALID_EMAIL,
          'RegisterScreen',
          'handleRegister'
        );
      }

      if (!password) {
        throw new AppError(
          'Password is required',
          ErrorCodes.REQUIRED_FIELD_MISSING,
          'RegisterScreen',
          'handleRegister'
        );
      }

      if (!validatePassword(password)) {
        throw new AppError(
          'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number',
          ErrorCodes.INVALID_PASSWORD,
          'RegisterScreen',
          'handleRegister'
        );
      }

      setLoading(true);
      
      try {
        await register(name.trim(), email.trim(), password);
        navigation.replace('Welcome');  
      } catch (error) {
        // Handle authentication-specific errors
        throw new AppError(
          error.message || 'Failed to create account',
          ErrorCodes.AUTH_FAILED,
          'RegisterScreen',
          'handleRegister',
          error
        );
      }
    } catch (error) {
      if (error instanceof AppError) {
        Alert.alert('Registration Error', error.message, [
          {
            text: 'OK',
            onPress: () => {
              // Additional error handling based on error code
              switch (error.code) {
                case ErrorCodes.INVALID_EMAIL:
                  // Focus email input
                  break;
                case ErrorCodes.INVALID_PASSWORD:
                  // Focus password input
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
          label="Name"
          placeholder="Enter your name"
          value={name}
          onChangeText={handleNameChange}
          error={nameError}
        />
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
          title={loading ? 'Creating Account...' : 'Create Account'}
          onPress={handleRegister}
          disabled={loading}
        />
        <Button
          title="Back to Login"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={styles.loginButton}
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
  loginButton: {
    marginTop: 12,
  },
});

export default RegisterScreen;