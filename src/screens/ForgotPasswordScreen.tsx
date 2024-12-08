import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { AppError, ErrorCodes, validateEmail } from '../utils/errorHandling';
import { useAuth } from '../context/AuthContext';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const { resetPassword } = useAuth();

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (text.trim() && !validateEmail(text)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      
      // Input validation
      if (!email.trim()) {
        throw new AppError(
          'Email is required',
          ErrorCodes.REQUIRED_FIELD_MISSING,
          'ForgotPasswordScreen',
          'handleResetPassword'
        );
      }

      if (!validateEmail(email)) {
        throw new AppError(
          'Please enter a valid email address',
          ErrorCodes.INVALID_EMAIL,
          'ForgotPasswordScreen',
          'handleResetPassword'
        );
      }

      await resetPassword(email);
      Alert.alert(
        'Success',
        'Password reset instructions have been sent to your email.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to reset password');
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

        <Button
          title="Reset Password"
          onPress={handleResetPassword}
          loading={loading}
          style={styles.button}
        />

        <Button
          title="Back to Login"
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
    width: '100%',
  },
  button: {
    marginTop: 20,
  },
  linkButton: {
    marginTop: 10,
  },
});

export default ForgotPasswordScreen;
