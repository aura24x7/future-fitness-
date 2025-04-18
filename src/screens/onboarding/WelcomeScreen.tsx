import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { TargetIcon, AIIcon, ProgressIcon } from '../../assets/icons/icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeProvider';
import { colors } from '../../theme/colors';
import { unlockNavigation, NAV_REGISTRATION_KEY } from '../../utils/navigationUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { ONBOARDING_COMPLETE_KEY } from '../../constants/storage';

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const { isAuthenticated } = useAuth();
  const { isOnboardingComplete } = useOnboarding();

  // Unlock any registration navigation locks when Welcome screen mounts
  useEffect(() => {
    console.log('[WelcomeScreen] Screen mounted, unlocking registration navigation');
    const clearRegistrationFlags = async () => {
      try {
        // Clear both the navigation lock and direct registration flag
        await unlockNavigation(NAV_REGISTRATION_KEY);
        await AsyncStorage.removeItem('REGISTRATION_IN_PROGRESS');
        console.log('[WelcomeScreen] Registration flags cleared successfully');
        
        // Check if onboarding is already complete and user is authenticated
        const storedOnboardingComplete = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
        if (storedOnboardingComplete === 'true' && isAuthenticated) {
          console.log('[WelcomeScreen] Onboarding already complete, redirecting to Main');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        }
      } catch (error) {
        console.error('[WelcomeScreen] Error clearing registration flags:', error);
      }
    };
    
    clearRegistrationFlags();
  }, [isAuthenticated, navigation]);

  const handleGetStarted = async () => {
    // Double-check if onboarding is already complete before navigating
    try {
      const storedOnboardingComplete = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      if (storedOnboardingComplete === 'true' && isAuthenticated) {
        console.log('[WelcomeScreen] Onboarding already complete, redirecting to Main');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
        return;
      }
    } catch (error) {
      console.error('[WelcomeScreen] Error checking onboarding status:', error);
    }
    
    console.log('[WelcomeScreen] Navigating to OnboardingChoice');
    navigation.navigate('OnboardingChoice');
  };

  // Add a back button handler to navigate back to OnboardingChoice
  const handleBackToChoice = () => {
    console.log('[WelcomeScreen] Navigating back to OnboardingChoice');
    navigation.navigate('OnboardingChoice');
  };

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: isDarkMode ? colors.background.dark : colors.background.light }
    ]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <LinearGradient
        colors={isDarkMode ? 
          [colors.background.dark, colors.background.dark] : 
          [colors.background.light, '#F5F3FF']
        }
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        {/* Add a back button at the top left */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackToChoice}
        >
          <Text style={[
            styles.backButtonText, 
            { color: isDarkMode ? colors.primaryLight : colors.primary }
          ]}>
            ← Back
          </Text>
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <View style={[
            styles.logoBackground,
            {
              backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F3FF',
              shadowColor: isDarkMode ? '#000000' : '#6D28D9'
            }
          ]}>
            <AIIcon size={48} color={isDarkMode ? colors.text.primary.dark : colors.primary} />
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={[
            styles.welcomeText,
            { color: isDarkMode ? colors.primaryLight : colors.primary }
          ]}>Welcome to</Text>
          <Text style={[
            styles.title,
            { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
          ]}>AI Powered Fitness</Text>
          <Text style={[
            styles.subtitle,
            { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }
          ]}>
            Your journey to a healthier lifestyle begins with personalized, AI-driven guidance
          </Text>
        </View>

        <View style={styles.summaryContainer}>
          {[
            { icon: <TargetIcon size={24} color={isDarkMode ? colors.primaryLight : colors.primary} />, title: 'Set Your Goals', text: 'Personalized fitness targets' },
            { icon: <AIIcon size={24} color={isDarkMode ? colors.primaryLight : colors.primary} />, title: 'AI Guidance', text: 'Smart workout planning' },
            { icon: <ProgressIcon size={24} color={isDarkMode ? colors.primaryLight : colors.primary} />, title: 'Track Progress', text: 'Monitor your journey' }
          ].map((item, index) => (
            <View key={index} style={styles.summaryItem}>
              <View style={[
                styles.iconContainer,
                {
                  backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F3FF',
                  shadowColor: isDarkMode ? '#000000' : '#6D28D9'
                }
              ]}>
                {item.icon}
              </View>
              <Text style={[
                styles.summaryTitle,
                { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
              ]}>{item.title}</Text>
              <Text style={[
                styles.summaryText,
                { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }
              ]}>{item.text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleGetStarted}
          style={styles.buttonContainer}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isDarkMode ? 
              [colors.primaryLight, colors.primary] :
              [colors.primaryLight, colors.primary]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={[
            styles.progressBar,
            { backgroundColor: isDarkMode ? '#1A1A1A' : '#F3F4F6' }
          ]}>
            <View style={[
              styles.progress,
              { backgroundColor: isDarkMode ? colors.primaryLight : colors.primary }
            ]} />
          </View>
          <Text style={[
            styles.progressText,
            { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }
          ]}>Step 1 of 7</Text>
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
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 10,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoContainer: {
    marginTop: 20,
    marginBottom: 32,
    alignItems: 'center',
  },
  logoBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: -0.2,
    paddingHorizontal: 20,
    maxWidth: 320,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 48,
    paddingHorizontal: 8,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 1,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  button: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    width: '14%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default WelcomeScreen;
