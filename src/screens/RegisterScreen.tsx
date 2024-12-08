import React, { useState, useEffect } from 'react';
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
  const { register, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('Dashboard');
    }
  }, [isAuthenticated]);

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
      setLoading(true);
      
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

      await register(name.trim(), email.trim(), password);
      // Navigation is handled by the useEffect hook watching isAuthenticated
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to register');
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
          value={name}
          onChangeText={handleNameChange}
          error={nameError}
          placeholder="Enter your name"
          autoCapitalize="words"
        />

        <Input
          label="Email"
          value={email}
          onChangeText={handleEmailChange}
          error={emailError}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Password"
          value={password}
          onChangeText={handlePasswordChange}
          error={passwordError}
          placeholder="Enter your password"
          secureTextEntry
        />

        <Button
          title="Create Account"
          onPress={handleRegister}
          loading={loading}
          style={styles.button}
        />

        <Button
          title="Already have an account? Login"
          onPress={() => navigation.navigate('Login')}
          variant="text"
          style={styles.linkButton}
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
  button: {
    marginTop: 12,
  },
  linkButton: {
    marginTop: 12,
  },
});

export default RegisterScreen;