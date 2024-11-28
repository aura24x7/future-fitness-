import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding } from '../../context/OnboardingContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const FinalSetupScreen = ({ navigation, route }) => {
  const { onboardingData } = useOnboarding();
  const { name } = route.params || {};
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      // First fade in the main content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      // Then start the progress animation
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();

    // Continuous rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Navigate to dashboard after delay
    const timer = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }, 3000);

    return () => clearTimeout(timer);
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
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#ffffff', '#f3f3f3']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Content */}
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ]
            }
          ]}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <Animated.View 
              style={[
                styles.achievementBadge,
                { transform: [{ rotate }] }
              ]}
            >
              <LinearGradient
                colors={['#B794F6', '#9F7AEA']}
                style={styles.badgeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons name="trophy-award" size={44} color="#ffffff" />
              </LinearGradient>
            </Animated.View>

            <Text style={styles.welcomeText}>Welcome to AI Fitness</Text>
            <Text style={styles.title}>{name}</Text>
            <Text style={styles.subtitle}>Your journey to a healthier lifestyle begins now</Text>
          </View>

          {/* Cards Section */}
          <View style={styles.cardsContainer}>
            {/* Fitness Goal Card */}
            <BlurView intensity={70} tint="light" style={styles.card}>
              <View style={styles.cardIcon}>
                <MaterialCommunityIcons name="target" size={24} color="#9F7AEA" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>FITNESS GOAL</Text>
                <Text style={styles.cardValue}>
                  {onboardingData.fitnessGoal?.replace(/_/g, ' ').toLowerCase()}
                </Text>
              </View>
            </BlurView>

            {/* Activity Level Card */}
            <BlurView intensity={70} tint="light" style={styles.card}>
              <View style={styles.cardIcon}>
                <MaterialCommunityIcons name="lightning-bolt" size={24} color="#9F7AEA" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>ACTIVITY LEVEL</Text>
                <Text style={styles.cardValue}>
                  {onboardingData.activityLevel?.toLowerCase()}
                </Text>
              </View>
            </BlurView>

            {/* Diet Preference Card */}
            <BlurView intensity={70} tint="light" style={styles.card}>
              <View style={styles.cardIcon}>
                <MaterialCommunityIcons name="food-apple" size={24} color="#9F7AEA" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>DIET PREFERENCE</Text>
                <Text style={styles.cardValue}>
                  {onboardingData.dietaryPreference?.toLowerCase() || 'No restrictions'}
                </Text>
              </View>
            </BlurView>

            {/* Workout Location Card */}
            <BlurView intensity={70} tint="light" style={styles.card}>
              <View style={styles.cardIcon}>
                <MaterialCommunityIcons name="dumbbell" size={24} color="#9F7AEA" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>WORKOUT LOCATION</Text>
                <Text style={styles.cardValue}>
                  {onboardingData.workoutPreference?.toLowerCase() || 'Flexible'}
                </Text>
              </View>
            </BlurView>
          </View>

          {/* Loading Section */}
          <View style={styles.loadingSection}>
            <BlurView intensity={70} tint="light" style={styles.loadingContainer}>
              <Animated.View style={[styles.loadingProgress, { width: progressWidth }]} />
              <View style={styles.loadingContent}>
                <Animated.View style={[styles.loadingIcon, { transform: [{ rotate }] }]}>
                  <MaterialCommunityIcons name="cog" size={24} color="#9F7AEA" />
                </Animated.View>
                <Text style={styles.loadingText}>Preparing your personalized plan...</Text>
              </View>
            </BlurView>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  achievementBadge: {
    width: width * 0.22,
    height: width * 0.22,
    marginBottom: 20,
    borderRadius: width * 0.11,
    backgroundColor: '#ffffff',
    ...Platform.select({
      ios: {
        shadowColor: '#9F7AEA',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  badgeGradient: {
    width: '100%',
    height: '100%',
    borderRadius: width * 0.11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 15,
    color: '#9F7AEA',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    maxWidth: '85%',
    lineHeight: 22,
  },
  cardsContainer: {
    marginTop: 24,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(159, 122, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    marginLeft: 12,
    flex: 1,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9F7AEA',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    textTransform: 'capitalize',
  },
  loadingSection: {
    marginTop: 24,
    marginBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  loadingContainer: {
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  loadingProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: 'rgba(159, 122, 234, 0.1)',
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  loadingIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
});

export default FinalSetupScreen;
