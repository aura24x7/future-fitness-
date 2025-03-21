import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { AppError, ErrorCodes, validateEmail, validatePassword } from '../utils/errorHandling';
import { useAuth } from '../contexts/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('Main');
    }
  }, [isAuthenticated, navigation]);

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
      setLoading(true);
      
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

      await login(email, password);
      // Navigation is handled by the useEffect hook watching isAuthenticated
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to login');
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
          title="Login"
          onPress={handleLogin}
          loading={loading}
          style={styles.button}
        />

        <Button
          title="Forgot Password?"
          onPress={() => navigation.navigate('ForgotPassword')}
          variant="text"
          style={styles.linkButton}
        />

        <Button
          title="Create Account"
          onPress={() => navigation.navigate('Register')}
          variant="outlined"
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

export default LoginScreen;
