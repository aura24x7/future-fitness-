import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding, OnboardingData } from '../../contexts/OnboardingContext';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { TargetIcon, AIIcon, ProgressIcon } from '../../assets/icons/icons';
import { Alert } from 'react-native';
import { userProfileService } from '../../services/userProfileService';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../theme/ThemeProvider';
import { colors } from '../../theme/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { debugFirebase } from '../../utils/firebaseDebugger';
import { 
  firebaseApp, 
  firestore as syncFirestore,
  auth as syncAuth,
  isFirebaseInitialized 
} from '../../firebase/firebaseInit';
import * as FirebaseCompat from '../../utils/firebaseCompatibility';
import { runAllTests } from '../../utils/firebaseInitTest';
import { 
  collection, 
  doc, 
  setDoc, 
  Timestamp 
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ONBOARDING_COMPLETE_KEY } from '../../constants/storage';
import { 
  lockNavigation, 
  unlockNavigation, 
  isNavigationLocked, 
  NAV_ONBOARDING_KEY,
  unlockAllNavigation
} from '../../utils/navigationUtils';

type PreferenceCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string;
  delay: number;
};

const PreferenceCard: React.FC<PreferenceCardProps> = ({ icon, title, value, delay }) => {
  const { isDarkMode } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay]);

  return (
    <Animated.View
      style={[
        styles.preferenceCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
          shadowColor: isDarkMode ? '#000000' : '#8B5CF6',
        },
      ]}
    >
      <View style={[
        styles.iconContainer,
        {
          backgroundColor: isDarkMode ? '#000000' : '#F5F3FF'
        }
      ]}>{icon}</View>
      <View style={styles.preferenceContent}>
        <Text style={[
          styles.preferenceTitle,
          { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }
        ]}>{title}</Text>
        <Text style={[
          styles.preferenceValue,
          { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
        ]}>{value}</Text>
      </View>
    </Animated.View>
  );
};

// Add navigation type
type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  // ... other screens
};
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const FinalSetupScreen = ({ navigation }: { navigation: NavigationProp }) => {
  const { isDarkMode } = useTheme();
  const { onboardingData, completeOnboarding } = useOnboarding();
  const { user } = useAuth();
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handleComplete = async () => {
    try {
      setIsCreatingProfile(true);
      setError(null);
      
      // Ensure all required data is present
      if (!onboardingData.name || !onboardingData.birthday || !onboardingData.gender ||
          !onboardingData.height || !onboardingData.weight || !onboardingData.lifestyle ||
          !onboardingData.workoutPreference || !onboardingData.dietaryPreference) {
        Alert.alert('Missing Information', 'Please complete all onboarding steps before proceeding.');
        return;
      }

      // Lock navigation to prevent competing navigation events
      await lockNavigation(NAV_ONBOARDING_KEY, 'Completing onboarding process');
      console.log('[FinalSetupScreen] Navigation locked during onboarding completion');

      // Start animations
      Animated.parallel([
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start();

      // Debug Firebase before creating profile
      console.log('[FinalSetupScreen] Running Firebase tests before profile creation...');
      await runAllTests();
      
      // Create the profile first
      try {
        // First, verify Firebase is initialized
        console.log('[FinalSetupScreen] Checking Firebase initialization...');
        if (!isFirebaseInitialized()) {
          console.error('[FinalSetupScreen] Firebase not initialized, forcing re-initialization');
          // We'll use the compatibility layer instead since it's more reliable
          throw new Error('Firebase not initialized');
        }
        
        const profile = await userProfileService.createUserProfile({
          ...onboardingData,
          weightGoal: onboardingData.weightGoal || 'MAINTAIN_WEIGHT',
          fitnessGoal: onboardingData.fitnessGoal || 'IMPROVE_FITNESS',
          lifestyle: onboardingData.lifestyle || 'SEDENTARY',
          dietaryPreference: onboardingData.dietaryPreference || 'NONE',
          workoutPreference: onboardingData.workoutPreference || 'HOME',
        });

        if (!profile) {
          throw new Error('Failed to create profile');
        }
        
        console.log('[FinalSetupScreen] Profile created successfully:', profile.id);
      } catch (profileError) {
        console.error('[FinalSetupScreen] Error creating profile:', profileError);
        
        // Direct fallback to Firestore if the profile service fails
        console.log('[FinalSetupScreen] Attempting direct Firestore fallback...');
        
        try {
          // Create a user profile object with the onboarding data
          const currentUser = user;
          if (!currentUser || !currentUser.uid) {
            throw new Error('No authenticated user available');
          }
          
          const timestamp = Timestamp.now();
          const metrics = calculateMetrics(onboardingData);

          const userProfile = {
            uid: currentUser.uid,
            id: currentUser.uid,
            email: currentUser.email || '',
            name: onboardingData.name || '',
            displayName: onboardingData.name || '',
            birthday: onboardingData.birthday || null,
            gender: onboardingData.gender || null,
            height: onboardingData.height || null,
            weight: onboardingData.weight || null,
            targetWeight: onboardingData.targetWeight || null,
            weightTargetDate: onboardingData.weightTargetDate || null,
            fitnessGoal: onboardingData.fitnessGoal || 'IMPROVE_FITNESS',
            activityLevel: onboardingData.lifestyle || 'SEDENTARY',
            dietaryPreference: onboardingData.dietaryPreference || 'NONE',
            workoutPreference: onboardingData.workoutPreference || 'HOME',
            country: onboardingData.country,
            state: onboardingData.state,
            weightGoal: onboardingData.weightGoal || 'MAINTAIN_WEIGHT',
            metrics,
            preferences: {
              notifications: true,
              measurementSystem: 'metric',
              language: 'en'
            },
            onboardingComplete: true,
            createdAt: timestamp,
            updatedAt: timestamp
          };
          
          // Use the Firebase compatibility layer directly as the primary method
          // since it's more stable in this context
          try {
            console.log('[FinalSetupScreen] Using Firebase compatibility layer for profile creation');
            await FirebaseCompat.setDoc('users', currentUser.uid, userProfile);
            console.log('[FinalSetupScreen] Profile created with Firebase compatibility layer');
          } catch (compatError) {
            console.error('[FinalSetupScreen] Compatibility layer write failed:', compatError);
            
            // Fall back to direct Firestore write using Firebase Web SDK
            try {
              console.log('[FinalSetupScreen] Attempting direct Firestore write as fallback');
              if (isFirebaseInitialized()) {
                const userDocRef = doc(syncFirestore, 'users', currentUser.uid);
                await setDoc(userDocRef, userProfile);
                console.log('[FinalSetupScreen] Profile created with synchronized Firebase');
              } else {
                throw new Error('Firebase still not initialized');
              }
            } catch (directWriteError) {
              console.error('[FinalSetupScreen] All Firebase write methods failed:', directWriteError);
              throw directWriteError;
            }
          }
        } catch (fallbackError) {
          console.error('[FinalSetupScreen] Fallback error:', fallbackError);
          throw fallbackError;
        }
      }

      // Mark onboarding as complete manually in AsyncStorage first
      try {
        await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
        console.log('[FinalSetupScreen] Onboarding marked as complete in AsyncStorage');
      } catch (asyncError) {
        console.error('[FinalSetupScreen] Error saving to AsyncStorage:', asyncError);
      }

      // Mark onboarding as complete through the context
      try {
        await completeOnboarding();
        console.log('[FinalSetupScreen] Onboarding marked as complete through context');
      } catch (onboardingError) {
        console.error('[FinalSetupScreen] Error completing onboarding:', onboardingError);
        // Continue even if this fails - we already saved the profile
      }

      // Debug Firebase after creating profile
      console.log('[FinalSetupScreen] Running Firebase debug after profile creation...');
      await debugFirebase();

      // Wait for animations and state updates to complete
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Clear all navigation locks before attempting to navigate
      console.log('[FinalSetupScreen] Clearing all navigation locks before navigation');
      await unlockAllNavigation();

      // Navigate to Main directly with reset
      try {
        console.log('[FinalSetupScreen] Navigating to Main screen...');
        
        // Use reset for a clean navigation stack - this is the most reliable method
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
        
        // Prevent any pending navigation requests by adding a small delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Force AsyncStorage update to ensure future loads go directly to Main
        await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
        
        return; // Exit early to prevent any additional navigation
      } catch (navigationError) {
        console.error('[FinalSetupScreen] Navigation reset error:', navigationError);
        
        // Try replace as fallback
        try {
          navigation.replace('Main');
        } catch (replaceError) {
          console.error('[FinalSetupScreen] Navigation replace error:', replaceError);
          
          // If replace fails, try navigate
          try {
            navigation.navigate('Main');
          } catch (navigateError) {
            console.error('[FinalSetupScreen] Navigation navigate error:', navigateError);
            Alert.alert(
              'Setup Complete',
              'Your profile has been created successfully. Please restart the app to continue.',
              [{ text: 'OK' }]
            );
          }
        }
      }
    } catch (error) {
      console.error('[FinalSetupScreen] Final error in handleComplete:', error);
      setError('An error occurred while creating your profile. Please try again.');
      setIsCreatingProfile(false);
      
      // Make sure to unlock navigation on error
      await unlockAllNavigation();
    }
  };

  // Helper function to calculate metrics
  const calculateMetrics = (data: Partial<OnboardingData>) => {
    const height = data.height?.value || 0;
    const weight = data.weight?.value || 0;
    const age = data.birthday ? Math.floor((new Date().getTime() - new Date(data.birthday).getTime()) / 31557600000) : 0;
    const gender = data.gender || 'OTHER';
    const lifestyle = data.lifestyle || 'SEDENTARY';

    // Calculate BMI
    const heightInMeters = data.height?.unit === 'cm' ? height / 100 : height * 0.3048;
    const weightInKg = data.weight?.unit === 'kg' ? weight : weight * 0.453592;
    const bmi = heightInMeters > 0 ? +(weightInKg / (heightInMeters * heightInMeters)).toFixed(1) : 0;

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr = 0;
    if (gender === 'MALE') {
      bmr = 10 * weightInKg + 6.25 * (height) - 5 * age + 5;
    } else if (gender === 'FEMALE') {
      bmr = 10 * weightInKg + 6.25 * (height) - 5 * age - 161;
    } else {
      bmr = 10 * weightInKg + 6.25 * (height) - 5 * age - 78;
    }

    // Calculate TDEE based on activity level
    const activityMultipliers: Record<string, number> = {
      SEDENTARY: 1.2,
      LIGHTLY_ACTIVE: 1.375,
      MODERATELY_ACTIVE: 1.55,
      VERY_ACTIVE: 1.725,
      SUPER_ACTIVE: 1.9
    };
    const tdee = Math.round(bmr * (activityMultipliers[lifestyle] || 1.2));

    // Calculate recommended calories based on weight goal
    let recommendedCalories = tdee;
    if (data.weightGoal === 'LOSE_WEIGHT') {
      recommendedCalories = Math.max(1200, tdee - 500);
    } else if (data.weightGoal === 'GAIN_WEIGHT') {
      recommendedCalories = tdee + 500;
    }

    return {
      bmi: bmi,
      bmr: Math.round(bmr),
      tdee: tdee,
      recommendedCalories: Math.round(recommendedCalories)
    };
  };

  useEffect(() => {
    const setupProfile = async () => {
      if (!user) {
        setError('No authenticated user found. Please log in again.');
        return;
      }

      try {
        // Start animations
        Animated.parallel([
          Animated.timing(progressAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
          }),
          Animated.loop(
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: 2000,
              easing: Easing.linear,
              useNativeDriver: true,
            })
          ),
        ]).start();

        // Wait for animations
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Complete onboarding and create user profile
        await handleComplete();
      } catch (error) {
        console.error('Error completing onboarding:', error);
        setError(
          'There was an error completing your profile setup. Please try again.'
        );
      }
    };

    setupProfile();
  }, [user]);

  if (error) {
    return (
      <View style={[
        styles.container,
        { backgroundColor: isDarkMode ? colors.background.dark : colors.background.light }
      ]}>
        <Text style={[
          styles.errorText,
          { color: isDarkMode ? colors.primaryLight : colors.primary }
        ]}>{error}</Text>
        <TouchableOpacity
          style={[
            styles.retryButton,
            { backgroundColor: isDarkMode ? colors.primaryLight : colors.primary }
          ]}
          onPress={() => navigation.replace('Login')}
        >
          <Text style={styles.retryButtonText}>Return to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressTransform = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-Dimensions.get('window').width, 0],
  });

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: isDarkMode ? colors.background.dark : colors.background.light }
    ]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <LinearGradient
        colors={isDarkMode ? 
          [colors.background.dark, colors.background.dark] : 
          ['#FFFFFF', '#F5F3FF']
        }
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[
            styles.greeting,
            { color: isDarkMode ? colors.primaryLight : colors.primary }
          ]}>Hello,</Text>
          <Text style={[
            styles.title,
            { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
          ]}>Your Profile Summary</Text>
          <Text style={[
            styles.subtitle,
            { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }
          ]}>
            We're preparing your personalized fitness journey
          </Text>
        </View>

        <View style={styles.preferencesContainer}>
          <PreferenceCard
            icon={<TargetIcon size={24} color={isDarkMode ? colors.primaryLight : colors.primary} />}
            title="Fitness Goal"
            value={onboardingData.fitnessGoal || 'Build Muscle'}
            delay={200}
          />
          <PreferenceCard
            icon={<AIIcon size={24} color={isDarkMode ? colors.primaryLight : colors.primary} />}
            title="Activity Level"
            value={onboardingData.activityLevel || 'Intermediate'}
            delay={400}
          />
          <PreferenceCard
            icon={<ProgressIcon size={24} color={isDarkMode ? colors.primaryLight : colors.primary} />}
            title="Diet Preference"
            value={onboardingData.dietaryPreference || 'None'}
            delay={600}
          />
        </View>

        <View style={styles.preparingContainer}>
          <BlurView 
            intensity={isDarkMode ? 40 : 80}
            tint={isDarkMode ? "dark" : "light"}
            style={[
              styles.preparingCard,
              { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)' }
            ]}
          >
            <Animated.View
              style={[styles.loadingIcon, { transform: [{ rotate }] }]}
            >
              <AIIcon 
                size={24} 
                color={isDarkMode ? colors.primaryLight : colors.primary} 
              />
            </Animated.View>
            <Text style={[
              styles.preparingText,
              { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
            ]}>
              {isCreatingProfile 
                ? 'Creating your personalized profile...'
                : 'Preparing your fitness journey...'}
            </Text>
            <View style={[
              styles.progressBarContainer,
              { backgroundColor: isDarkMode ? '#1A1A1A' : '#F3F4F6' }
            ]}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: isDarkMode ? colors.primaryLight : colors.primary,
                    transform: [{ translateX: progressTransform }],
                  },
                ]}
              />
            </View>
          </BlurView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  header: {
    marginBottom: 32,
  },
  greeting: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  preferencesContainer: {
    marginBottom: 32,
  },
  preferenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 13,
    marginBottom: 4,
  },
  preferenceValue: {
    fontSize: 17,
    fontWeight: '600',
  },
  preparingContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 24,
    left: 20,
    right: 20,
  },
  preparingCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  loadingIcon: {
    marginBottom: 12,
  },
  preparingText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 16,
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '100%',
  },
  errorText: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
  },
  retryButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FinalSetupScreen;
