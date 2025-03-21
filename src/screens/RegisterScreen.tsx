import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { AppError, ErrorCodes, validateEmail, validatePassword } from '../utils/errorHandling';
import { useAuth } from '../contexts/AuthContext';
import { useOnboarding } from '../contexts/OnboardingContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  lockNavigation, 
  unlockNavigation, 
  isNavigationLocked, 
  NAV_REGISTRATION_KEY 
} from '../utils/navigationUtils';

interface RegisterScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const { register, isAuthenticated, user } = useAuth();
  const { isOnboardingComplete } = useOnboarding();
  
  // Add a reference to track registration state
  const justRegistered = useRef(false);
  const navigationAttempted = useRef(false);

  useEffect(() => {
    // Check for navigation locks before proceeding
    const checkNavigationStatus = async () => {
      try {
        // If we already attempted navigation in this session, don't do it again
        if (navigationAttempted.current) {
          console.log('[RegisterScreen] Navigation already attempted in this session, skipping');
          return;
        }

        const registrationLock = await isNavigationLocked(NAV_REGISTRATION_KEY);
        
        console.log('[RegisterScreen] Auth state changed:', { 
          isAuthenticated, 
          user: user ? 'User exists' : 'No user',
          isOnboardingComplete,
          justRegistered: justRegistered.current,
          registrationLock
        });
        
        if (user) {
          // Only proceed with navigation if we're NOT in the middle of registration
          if (registrationLock) {
            console.log('[RegisterScreen] Registration in progress, skipping automatic navigation');
            return;
          }
          
          // If we just registered, navigate directly to Welcome
          if (justRegistered.current) {
            console.log('[RegisterScreen] Just registered flag is set, navigating to Welcome');
            navigationAttempted.current = true;
            justRegistered.current = false;
            navigateToOnboarding();
            return;
          }
          
          console.log('[RegisterScreen] User is authenticated, checking onboarding status');
          
          if (isAuthenticated && isOnboardingComplete) {
            // User is fully authenticated and has completed onboarding
            console.log('[RegisterScreen] Onboarding is complete, navigating to Main');
            navigationAttempted.current = true;
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main' }],
            });
          } else {
            // Normal flow for existing users who need to complete onboarding
            console.log('[RegisterScreen] Onboarding is not complete, navigating to Welcome');
            navigationAttempted.current = true;
            setTimeout(() => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            }, 300);
          }
        }
      } catch (error) {
        console.error('[RegisterScreen] Error checking navigation status:', error);
      }
    };
    
    checkNavigationStatus();
    
    // Reset navigation attempt flag when component unmounts
    return () => {
      navigationAttempted.current = false;
    };
  }, [isAuthenticated, isOnboardingComplete, user, navigation]);

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
      setGeneralError('');
      
      console.log('[RegisterScreen] Starting registration process');
      
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

      // Lock navigation before registration to prevent competing navigation
      await lockNavigation(NAV_REGISTRATION_KEY, 'User registration in progress');
      
      // Also set a direct flag that AppNavigator can check (for redundancy)
      await AsyncStorage.setItem('REGISTRATION_IN_PROGRESS', 'true');
      
      console.log('[RegisterScreen] Validation passed, calling register function');
      justRegistered.current = true; // Set the flag before registration
      await register(name.trim(), email.trim(), password);
      console.log('[RegisterScreen] Registration successful');
      
      // Force navigation to Welcome screen directly
      navigateToOnboarding();
    } catch (error: any) {
      console.error('[RegisterScreen] Registration error:', error);
      setGeneralError(error.message || 'Failed to register');
      Alert.alert('Registration Error', error.message || 'Failed to register. Please try again.');
      
      // Unlock navigation on error
      await unlockNavigation(NAV_REGISTRATION_KEY);
      await AsyncStorage.removeItem('REGISTRATION_IN_PROGRESS');
    } finally {
      setLoading(false);
    }
  };
  
  // Add a dedicated function to navigate to onboarding
  const navigateToOnboarding = async () => {
    console.log('[RegisterScreen] Forcing navigation to Welcome screen');
    
    try {
      // Ensure we don't get competing navigation
      navigationAttempted.current = true;
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
      
      // Keep navigation locked until onboarding starts
      // It will be unlocked in the Welcome screen
    } catch (navError) {
      console.error('[RegisterScreen] Navigation error:', navError);
      
      // Unlock navigation on error
      await unlockNavigation(NAV_REGISTRATION_KEY);
      await AsyncStorage.removeItem('REGISTRATION_IN_PROGRESS');
    }
  };

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <Card style={styles.card}>
        {generalError ? (
          <Text style={styles.errorText}>{generalError}</Text>
        ) : null}
        
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
          disabled={loading}
          style={styles.button}
        />

        <Button
          title="Already have an account? Login"
          onPress={() => navigation.navigate('Login')}
          variant="outline"
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
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default RegisterScreen;