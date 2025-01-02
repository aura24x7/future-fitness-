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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding } from '../../context/OnboardingContext';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { TargetIcon, AIIcon, ProgressIcon } from '../../assets/icons/icons';
import { Alert } from 'react-native';
import { userProfileService } from '../../services/userProfileService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme/ThemeProvider';
import { colors } from '../../theme/colors';

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

const FinalSetupScreen = ({ navigation }) => {
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

      // Create the profile first
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

      // Mark onboarding as complete only after profile is created
      await completeOnboarding();

      // Wait for animations
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Navigate to main app with a reset to prevent going back
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      console.error('Error completing setup:', error);
      setError(
        'There was a problem completing your setup. Please try again.'
      );
    } finally {
      setIsCreatingProfile(false);
    }
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
