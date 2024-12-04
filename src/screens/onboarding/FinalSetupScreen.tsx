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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding } from '../../context/OnboardingContext';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { TargetIcon, AIIcon, ProgressIcon } from '../../assets/icons/icons';
import { Alert } from 'react-native';
import { userProfileService } from '../../services/userProfileService';

type PreferenceCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string;
  delay: number;
};

const PreferenceCard: React.FC<PreferenceCardProps> = ({ icon, title, value, delay }) => {
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
        },
      ]}
    >
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.preferenceContent}>
        <Text style={styles.preferenceTitle}>{title}</Text>
        <Text style={styles.preferenceValue}>{value}</Text>
      </View>
    </Animated.View>
  );
};

const FinalSetupScreen = ({ navigation, route }) => {
  const { onboardingData } = useOnboarding();
  const { name } = route.params || {};
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const setupProfile = async () => {
      try {
        setIsCreatingProfile(true);
        // Create user profile
        await userProfileService.createUserProfile(onboardingData);
        
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

        // Wait for animations and profile creation
        await new Promise(resolve => setTimeout(resolve, 2500));

        // Navigate to main screen
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } catch (error) {
        console.error('Error setting up profile:', error);
        // Show error message to user
        Alert.alert(
          'Setup Error',
          'There was an error setting up your profile. Please try again.',
          [
            {
              text: 'Retry',
              onPress: setupProfile
            }
          ]
        );
      } finally {
        setIsCreatingProfile(false);
      }
    };

    setupProfile();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#FFFFFF', '#F5F3FF']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello {name},</Text>
          <Text style={styles.title}>Your Profile Summary</Text>
          <Text style={styles.subtitle}>
            We're preparing your personalized fitness journey
          </Text>
        </View>

        <View style={styles.preferencesContainer}>
          <PreferenceCard
            icon={<TargetIcon size={24} />}
            title="Fitness Goal"
            value={onboardingData.fitnessGoal || 'Build Muscle'}
            delay={200}
          />
          <PreferenceCard
            icon={<AIIcon size={24} />}
            title="Activity Level"
            value={onboardingData.activityLevel || 'Intermediate'}
            delay={400}
          />
          <PreferenceCard
            icon={<ProgressIcon size={24} />}
            title="Diet Preference"
            value={onboardingData.dietaryPreference || 'None'}
            delay={600}
          />
        </View>

        <View style={styles.preparingContainer}>
          <BlurView intensity={80} style={styles.preparingCard}>
            <Animated.View
              style={[styles.loadingIcon, { transform: [{ rotate }] }]}
            >
              <AIIcon size={24} color="#8B5CF6" />
            </Animated.View>
            <Text style={styles.preparingText}>
              {isCreatingProfile 
                ? 'Creating your personalized profile...'
                : 'Preparing your fitness journey...'}
            </Text>
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[styles.progressBar, { width: progressWidth }]}
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
    backgroundColor: '#FFFFFF',
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
    color: '#8B5CF6',
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 20,
  },
  preferencesContainer: {
    marginBottom: 32,
  },
  preferenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
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
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  preferenceValue: {
    fontSize: 17,
    color: '#1F2937',
    fontWeight: '600',
  },
  preparingContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 24,
    left: 20,
    right: 20,
  },
  preparingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
    color: '#1F2937',
    fontWeight: '600',
    marginBottom: 16,
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
});

export default FinalSetupScreen;
