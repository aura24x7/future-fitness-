import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeProvider';
import { colors } from '../../theme/colors';
import { ManualSetupIcon, VoiceAssistantIcon } from '../../assets/icons/icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { ONBOARDING_COMPLETE_KEY } from '../../constants/storage';
import { unlockNavigation, NAV_REGISTRATION_KEY } from '../../utils/navigationUtils';

type OnboardingChoiceScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const OnboardingChoiceScreen: React.FC<OnboardingChoiceScreenProps> = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const auth = useAuth();
  const { isOnboardingComplete } = useOnboarding();

  // Similar logic as WelcomeScreen to handle any pending registration
  useEffect(() => {
    console.log('[OnboardingChoiceScreen] Screen mounted, unlocking registration navigation');
    const clearRegistrationFlags = async () => {
      try {
        // Clear both the navigation lock and direct registration flag
        await unlockNavigation(NAV_REGISTRATION_KEY);
        await AsyncStorage.removeItem('REGISTRATION_IN_PROGRESS');
        console.log('[OnboardingChoiceScreen] Registration flags cleared successfully');
        
        // Check if onboarding is already complete and user is authenticated
        const storedOnboardingComplete = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
        if (storedOnboardingComplete === 'true' && auth?.isAuthenticated) {
          console.log('[OnboardingChoiceScreen] Onboarding already complete, redirecting to Main');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        }
      } catch (error) {
        console.error('[OnboardingChoiceScreen] Error clearing registration flags:', error);
      }
    };
    
    clearRegistrationFlags();
  }, [auth?.isAuthenticated, navigation]);

  const handleManualOnboarding = () => {
    console.log('[OnboardingChoiceScreen] Navigating to manual onboarding flow');
    navigation.navigate('NameInput');
  };

  const handleVoiceOnboarding = () => {
    console.log('[OnboardingChoiceScreen] Navigating to voice onboarding flow');
    navigation.navigate('VoiceOnboarding');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <LinearGradient
        colors={isDarkMode ? ['#1A1A1A', '#2D2D2D'] : ['#f9f9f9', '#ffffff']}
        style={styles.gradientContainer}
      >
        <View style={styles.header}>
          <Text style={[
            styles.title, 
            { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
          ]}>
            Welcome to Future Fitness
          </Text>
          <Text style={[
            styles.subtitle, 
            { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }
          ]}>
            Choose how you'd like to set up your account
          </Text>
        </View>
        
        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={[
              styles.optionCard, 
              { 
                backgroundColor: isDarkMode ? colors.background.card.dark : colors.background.card.light,
                borderColor: isDarkMode ? colors.border.dark : colors.border.light
              }
            ]}
            onPress={handleManualOnboarding}
          >
            <ManualSetupIcon 
              size={60} 
              color={isDarkMode ? colors.primaryLight : colors.primary} 
            />
            <Text style={[
              styles.optionTitle,
              { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
            ]}>
              Manual Setup
            </Text>
            <Text style={[
              styles.optionDescription,
              { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }
            ]}>
              Step through screens to set up your fitness profile at your own pace
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.optionCard, 
              { 
                backgroundColor: isDarkMode ? colors.background.card.dark : colors.background.card.light,
                borderColor: isDarkMode ? colors.border.dark : colors.border.light
              }
            ]}
            onPress={handleVoiceOnboarding}
          >
            <VoiceAssistantIcon 
              size={60} 
              color={isDarkMode ? colors.primaryLight : colors.primary} 
            />
            <Text style={[
              styles.optionTitle,
              { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
            ]}>
              AI Voice Assistant
            </Text>
            <Text style={[
              styles.optionDescription,
              { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }
            ]}>
              Talk to our AI assistant for a guided fitness setup experience
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={[
            styles.footerText,
            { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }
          ]}>
            You can change your onboarding method at any time
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  optionCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  optionDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
});

export default OnboardingChoiceScreen; 