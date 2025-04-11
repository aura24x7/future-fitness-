import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  LiveKitRoom, 
  AudioSession, 
  useParticipant, 
  useRoom 
} from '@livekit/react-native';
import { Audio } from 'expo-av';
import { useTheme } from '../../theme/ThemeProvider';
import { colors } from '../../theme/colors';
import { VoiceAssistantIcon } from '../../assets/icons/icons';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ONBOARDING_COMPLETE_KEY } from '../../constants/storage';
import { userProfileService } from '../../services/userProfileService';
import livekitTokenService from '../../firebase/livekitTokenService';
import { useLiveKit } from '../../contexts/LiveKitContext';
import { 
  VoiceOnboardingData,
  mapVoiceDataToOnboardingData,
  validateVoiceData
} from '../../utils/voiceOnboardingAdapter';
import voiceConfig from '../../config/voiceConfig';

// Replace the hardcoded LiveKit URL with the config value
// const LIVEKIT_URL = 'wss://future-fitness-livekit.livekit.cloud';
const LIVEKIT_URL = voiceConfig.livekit.url;

// Component to manage the voice interaction
const VoiceInteraction = ({ onUserDataComplete }: { onUserDataComplete: (data: VoiceOnboardingData) => void }) => {
  const room = useRoom() || {};
  const { localParticipant } = room as any;
  const [agentState, setAgentState] = useState<'connecting' | 'listening' | 'thinking' | 'speaking' | 'onboardingComplete'>('connecting');
  const [transcript, setTranscript] = useState('');
  const [userOnboardingData, setUserOnboardingData] = useState<VoiceOnboardingData>({});
  const navigation = useNavigation();
  
  // Monitor agent participant and its state
  useEffect(() => {
    const handleAgentMessages = (message: any) => {
      if (message && message.data) {
        try {
          const data = JSON.parse(message.data);
          
          // Update agent state
          if (data.state) {
            setAgentState(data.state);
          }
          
          // Update transcript
          if (data.text) {
            setTranscript(data.text);
          }
          
          // Extract onboarding data
          if (data.metadata && data.metadata.onboardingData) {
            setUserOnboardingData(prev => ({
              ...prev,
              ...data.metadata.onboardingData,
              isComplete: data.metadata.onboardingComplete || false
            }));
          }
          
          // Check for completion
          if (data.state === 'onboardingComplete' || (data.metadata && data.metadata.onboardingComplete)) {
            onUserDataComplete(userOnboardingData);
          }
        } catch (error) {
          console.error('[VoiceInteraction] Error processing agent message:', error);
        }
      }
    };
    
    // Subscribe to data messages from other participants
    if (room && (room as any).on) {
      (room as any).on('dataReceived', handleAgentMessages);
      
      return () => {
        (room as any).off('dataReceived', handleAgentMessages);
      };
    }
  }, [room, userOnboardingData, onUserDataComplete]);
  
  // Request microphone permission and create audio track
  useEffect(() => {
    const setupAudio = async () => {
      try {
        const permission = await Audio.requestPermissionsAsync();
        if (permission.status !== 'granted') {
          Alert.alert(
            'Microphone Permission Required',
            'Please allow microphone access to use the voice assistant',
            [
              {
                text: 'Switch to Manual',
                onPress: () => navigation.navigate('NameInput')
              },
              { 
                text: 'Try Again',
                onPress: setupAudio 
              }
            ]
          );
          return;
        }
        
        // Create and publish local audio track
        if (localParticipant) {
          await localParticipant.enableAudio();
        }
      } catch (error) {
        console.error('[VoiceInteraction] Error setting up audio:', error);
        Alert.alert(
          'Audio Setup Error',
          'Failed to set up microphone. Please try again or use manual onboarding.',
          [
            {
              text: 'Switch to Manual',
              onPress: () => navigation.navigate('NameInput')
            }
          ]
        );
      }
    };
    
    setupAudio();
    
    return () => {
      // Cleanup audio when component unmounts
      if (localParticipant) {
        localParticipant.disableAudio();
      }
    };
  }, [localParticipant, navigation]);
  
  return (
    <View style={styles.interactionContainer}>
      {agentState === 'connecting' && (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.stateText}>Connecting to AI Assistant...</Text>
        </View>
      )}
      
      {agentState === 'listening' && (
        <View style={styles.stateContainer}>
          <View style={[styles.listeningIndicator, { backgroundColor: colors.progress.success.light }]} />
          <Text style={styles.stateText}>Listening...</Text>
        </View>
      )}
      
      {agentState === 'thinking' && (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.stateText}>Processing...</Text>
        </View>
      )}
      
      {agentState === 'speaking' && (
        <View style={styles.stateContainer}>
          <View style={[styles.speakingIndicator, { backgroundColor: colors.primary }]} />
          <Text style={styles.stateText}>AI Assistant is speaking</Text>
        </View>
      )}
      
      <View style={styles.transcriptContainer}>
        <Text style={styles.transcriptText}>{transcript}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.switchButton}
        onPress={() => {
          if (room && (room as any).disconnect) {
            (room as any).disconnect();
          }
          navigation.navigate('NameInput');
        }}
      >
        <Text style={[styles.switchButtonText, { color: colors.primary }]}>
          Switch to Manual Onboarding
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Main Voice Onboarding Screen
const VoiceOnboardingScreen = () => {
  const { isDarkMode } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [token, setToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLiveKitAvailable, isExpoGo } = useLiveKit();
  
  // Check if LiveKit is available
  useEffect(() => {
    if (!isLiveKitAvailable) {
      console.log('[VoiceOnboardingScreen] LiveKit is not available');
      if (isExpoGo) {
        setError('Voice onboarding is not available in Expo Go. Please use the development build or production app.');
      } else {
        setError('Voice onboarding is not available on this device. Please use manual onboarding.');
      }
      setIsConnecting(false);
    }
  }, [isLiveKitAvailable, isExpoGo]);

  // Get LiveKit token from Firebase function if LiveKit is available
  useEffect(() => {
    const getToken = async () => {
      if (!isLiveKitAvailable) {
        return;
      }
      
      try {
        setIsConnecting(true);
        const auth = getAuth();
        const userId = auth.currentUser?.uid;
        
        if (!userId) {
          throw new Error('User not authenticated');
        }
        
        // Use the livekitTokenService to get a token
        const token = await livekitTokenService.generateToken(userId);
        setToken(token);
        setIsConnecting(false);
        
      } catch (err) {
        console.error('[VoiceOnboardingScreen] Error getting token:', err);
        setError('Failed to connect to voice assistant. Please try again or use manual onboarding.');
        setIsConnecting(false);
      }
    };
    
    if (isLiveKitAvailable) {
      getToken();
    }
  }, [isLiveKitAvailable]);
  
  // Handle successful completion of onboarding
  const handleOnboardingComplete = async (userData: VoiceOnboardingData) => {
    try {
      console.log('[VoiceOnboardingScreen] Onboarding complete with data:', userData);
      
      // Validate the data
      const missingFields = validateVoiceData(userData);
      if (missingFields.length > 0) {
        throw new Error(`Incomplete user data received. Missing: ${missingFields.join(', ')}`);
      }
      
      // Convert voice data to onboarding data format
      const onboardingData = mapVoiceDataToOnboardingData(userData);
      
      // Save to user profile in Firebase
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Sync with user profile
      await userProfileService.syncProfileWithOnboarding(onboardingData);
      
      // Mark onboarding as complete in AsyncStorage
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      
      // Navigate to dashboard
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      console.error('[VoiceOnboardingScreen] Error saving onboarding data:', error);
      Alert.alert(
        'Error Saving Profile',
        error instanceof Error ? error.message : 'We had trouble saving your information. Would you like to try manual setup instead?',
        [
          {
            text: 'Yes, Switch to Manual',
            onPress: () => navigation.navigate('NameInput')
          },
          {
            text: 'Try Again',
            onPress: () => setToken(null)
          }
        ]
      );
    }
  };
  
  if (isConnecting) {
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[
            styles.loadingText,
            { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
          ]}>Preparing voice assistant...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (error) {
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
        <View style={styles.errorContainer}>
          <Text style={[
            styles.errorText,
            { color: colors.progress.error.light }
          ]}>{error}</Text>
          <TouchableOpacity 
            style={[
              styles.errorButton,
              { backgroundColor: colors.primary }
            ]}
            onPress={() => navigation.navigate('OnboardingChoice')}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
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
      <View style={styles.header}>
        <Text style={[
          styles.title,
          { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
        ]}>AI Voice Onboarding</Text>
        <View style={styles.iconContainer}>
          <VoiceAssistantIcon 
            size={40} 
            color={isDarkMode ? colors.primaryLight : colors.primary} 
          />
        </View>
        <Text style={[
          styles.subtitle,
          { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }
        ]}>
          Talk to our AI assistant to set up your fitness profile
        </Text>
      </View>
      
      {/* token will be null during development since we're not connected to LiveKit yet */}
      {token ? (
        <LiveKitRoom
          url={LIVEKIT_URL}
          token={token}
          audio={true}
          video={false}
          onError={(error) => {
            console.error('[VoiceOnboardingScreen] LiveKit error:', error);
            setError('Connection error. Please try again or use manual onboarding.');
          }}
        >
          <AudioSession mode="voice" />
          <VoiceInteraction onUserDataComplete={handleOnboardingComplete} />
        </LiveKitRoom>
      ) : (
        <View style={styles.placeholderContainer}>
          <Text style={[
            styles.placeholderText,
            { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }
          ]}>
            LiveKit integration is in progress. This component will connect to a voice agent in production.
          </Text>
          <TouchableOpacity 
            style={[
              styles.placeholderButton,
              { backgroundColor: colors.primary }
            ]}
            onPress={() => navigation.navigate('NameInput')}
          >
            <Text style={styles.placeholderButtonText}>Continue with Manual Onboarding</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={[
          styles.backButtonText,
          { color: isDarkMode ? colors.primaryLight : colors.primary }
        ]}>← Back to Selection</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  errorButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  iconContainer: {
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  interactionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  stateContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  stateText: {
    marginTop: 10,
    fontSize: 18,
  },
  listeningIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
  },
  speakingIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2196F3',
  },
  transcriptContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    minHeight: 200,
    marginVertical: 20,
  },
  transcriptText: {
    fontSize: 16,
    lineHeight: 24,
  },
  switchButton: {
    marginTop: 20,
    padding: 12,
  },
  switchButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  backButton: {
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 16,
    lineHeight: 24,
  },
  placeholderButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  placeholderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default VoiceOnboardingScreen; 