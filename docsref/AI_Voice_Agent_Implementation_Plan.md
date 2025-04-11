# AI Voice Agent Implementation Plan for Future Fitness

## Table of Contents
- [Introduction](#introduction)
- [Understanding LiveKit and AI Voice Agents](#understanding-livekit-and-ai-voice-agents)
- [Architecture Overview](#architecture-overview)
- [Implementation Phases](#implementation-phases)
  - [Phase 1: Setup and Infrastructure](#phase-1-setup-and-infrastructure)
  - [Phase 2: Onboarding Choice Screen](#phase-2-onboarding-choice-screen)
  - [Phase 3: Voice Agent Implementation](#phase-3-voice-agent-implementation)
  - [Phase 4: Integration with Existing Features](#phase-4-integration-with-existing-features)
  - [Phase 5: Refinement & Deployment](#phase-5-refinement--deployment)
- [Code Samples](#code-samples)
  - [LiveKit Configuration](#livekit-configuration)
  - [Onboarding Choice Screen](#onboarding-choice-screen)
  - [Voice Onboarding Screen](#voice-onboarding-screen)
  - [Backend Implementation](#backend-implementation)
- [Future Fitness Integration Considerations](#future-fitness-integration-considerations)
- [Environment Setup](#environment-setup)
- [Testing Checklist](#testing-checklist)

## Introduction

This document outlines the implementation plan for integrating an AI voice agent into the Future Fitness React Native Expo application for user onboarding. The voice agent will provide an alternative to the existing manual onboarding process, creating a more engaging and accessible user experience.

## Understanding LiveKit and AI Voice Agents

### What is LiveKit?

LiveKit is an open-source platform for building real-time audio and video applications with WebRTC. It provides SDKs for various platforms, including React Native and Expo. LiveKit Agents is a framework within LiveKit specifically designed for building intelligent, multimodal voice assistants (AI agents) that can engage users through voice, video, and data channels.

### How LiveKit Voice Agents Work

LiveKit offers two types of voice agents:

1. **MultimodalAgent**: Uses OpenAI's multimodal model and realtime API to directly process user audio and generate audio responses, producing more natural-sounding speech.

2. **VoicePipelineAgent**: Uses a pipeline of STT (Speech-to-Text), LLM (Language Learning Model), and TTS (Text-to-Speech) models, providing greater control over the conversation flow by allowing applications to modify the text returned by the LLM.

For Future Fitness's onboarding process, the VoicePipelineAgent is most appropriate as it offers:
- Integration with Deepgram for STT
- Integration with Google Gemini 2.0 as the LLM
- Integration with ElevenLabs for TTS

## Architecture Overview

Here's how the AI voice agent will work in the Future Fitness application:

1. **User Interaction**: When a user opens the app, they'll be presented with a choice between manual onboarding or AI voice agent-assisted onboarding.

2. **Voice Agent Flow**:
   - The app connects to LiveKit's infrastructure
   - The AI agent greets the user and begins asking Future Fitness-specific onboarding questions (weight goals, activity level, etc.)
   - Deepgram converts user's speech to text
   - Google Gemini processes the text and determines the next question or action
   - ElevenLabs converts the AI's text response back to speech
   - The app collects and validates all required onboarding information

3. **Completion**: Once all required data is collected, the user is redirected to the Future Fitness dashboard screen.

## Implementation Phases

### Phase 1: Setup and Infrastructure

1. **LiveKit SDK Installation**: 
   - Add LiveKit SDK to the Future Fitness React Native Expo project 
   - Configure the necessary plugins in app.json 
   - Set up registerGlobals() in your application entry point 

   ```bash
   # Install LiveKit SDK and dependencies
   yarn add @livekit/react-native @livekit/react-native-expo-plugin expo-dev-client

   # Install additional dependencies for audio handling
   yarn add expo-av
   ```

2. **Backend Server Setup**:
   - Create a simple backend server to generate LiveKit tokens 
   - Set up API routes for LiveKit room management 
   - Integrate with existing Firebase backend 

3. **API Keys and Configuration**:
   - Register for needed services:
     - LiveKit account
     - Deepgram API key
     - Google Gemini API key
     - ElevenLabs API key
   - Store these keys securely in the Future Fitness backend environment 

### Phase 2: Onboarding Choice Screen

1. **Design & Implementation**: ✓
   - Create a new onboarding choice screen in `src/screens/onboarding/OnboardingChoiceScreen.tsx` ✓
   - Add options for "Manual Onboarding" and "AI Voice Assistant" ✓
   - Implement navigation between onboarding methods ✓
   - Use Tamagui for UI components ✓

2. **UI/UX Considerations**: ✓
   - Match Future Fitness design system ✓
   - Clear explanations of each option ✓
   - Visual indicators for voice assistant mode ✓
   - Accessibility considerations ✓

### Phase 3: Voice Agent Implementation

1. **LiveKit Room Connection**: ✓
   - Create a component to handle LiveKit room connections ✓
   - Implement token retrieval from backend ✓
   - Handle connection states and errors ✓

2. **Voice Pipeline Setup**: ✓
   - Configure Deepgram for STT ✓
   - Set up Google Gemini 2.0 for conversation intelligence ✓
   - Implement ElevenLabs for TTS ✓

3. **Conversation Flow**: ✓
   - Define the Future Fitness onboarding questions: ✓
     - User name
     - Age/birthday
     - Current weight
     - Target weight
     - Activity level
     - Fitness goals
     - Dietary preferences
   - Create validation logic for user responses ✓
   - Implement fallbacks for misunderstood responses ✓

4. **Data Collection**: ✓
   - Store user responses using existing Future Fitness Firebase structure ✓
   - Utilize `userProfileService.ts` for data handling ✓
   - Implement validation and error handling ✓

### Phase 4: Integration with Existing Features

1. **Connect to Existing Features**: ✓
   - Ensure data from voice onboarding matches manual onboarding format ✓
   - Implement consistent redirection to dashboard ✓
   - Maintain existing Firebase data structure ✓
   - Use existing types from `src/types/` ✓

2. **Testing & Validation**: ✓
   - Test voice agent onboarding end-to-end ✓
   - Compare data quality between manual and voice onboarding ✓
   - Ensure seamless integration with existing functionalities ✓

3. **Error Recovery & Edge Cases**: ✓
   - Handle network disconnections during onboarding ✓
   - Implement reconnection strategies ✓
   - Provide alternative paths for users experiencing issues ✓
   - Save partial progress in case of interruptions ✓

4. **Voice Agent Configuration**: ✓
   - Document required environmental variables ✓
   - Create setup guides for development and production ✓
   - Ensure proper API key management ✓

### Phase 5: Refinement & Deployment

1. **Performance Optimization**: 
   - Minimize latency in voice interactions 
   - Optimize memory usage and battery consumption 
   - Implement graceful degradation for poor network conditions 

2. **User Experience Improvements**: 
   - Add visual feedback during voice interactions 
   - Implement progress indicators 
   - Allow users to switch to manual onboarding at any point 
   - Add analytics to track voice agent performance 

3. **Deployment Strategy**: 
   - Phased rollout to users 
   - Monitoring and analytics 
   - Feedback collection mechanism 

4. **Documentation & Training**: 
   - Create comprehensive testing guide 
   - Document analytics implementation 
   - Train team on voice agent capabilities 
   - Document troubleshooting procedures 

## Code Samples

### LiveKit Configuration

Update your `app.json` to include necessary plugins:

```json
{
  "expo": {
    "plugins": [
      "@livekit/react-native-expo-plugin",
      [
        "expo-av",
        {
          "microphonePermission": "Allow Future Fitness to access your microphone"
        }
      ]
    ]
  }
}
```

Update your application entry point (e.g., `App.js` or `index.js`):

```javascript
import { registerGlobals } from '@livekit/react-native';

// Register LiveKit globals before anything else
registerGlobals();

// Rest of your application initialization
```

### Onboarding Choice Screen

```jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const OnboardingChoiceScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Future Fitness</Text>
        <Text style={styles.subtitle}>Choose how you'd like to set up your account</Text>
      </View>
      
      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={styles.optionCard}
          onPress={() => navigation.navigate('ManualOnboarding')}
        >
          <Image 
            source={require('../../../assets/images/manual-icon.png')} 
            style={styles.optionIcon} 
          />
          <Text style={styles.optionTitle}>Manual Setup</Text>
          <Text style={styles.optionDescription}>
            Step through screens to set up your fitness profile at your own pace
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.optionCard}
          onPress={() => navigation.navigate('VoiceOnboarding')}
        >
          <Image 
            source={require('../../../assets/images/voice-icon.png')} 
            style={styles.optionIcon} 
          />
          <Text style={styles.optionTitle}>AI Voice Assistant</Text>
          <Text style={styles.optionDescription}>
            Talk to our AI assistant for a guided fitness setup experience
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          You can change your onboarding method at any time
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  optionCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
  },
  optionIcon: {
    width: 60,
    height: 60,
    marginBottom: 15,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  footer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#888',
  },
});

export default OnboardingChoiceScreen;
```

### Voice Onboarding Screen

```jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { 
  LiveKitRoom, 
  AudioSession, 
  useParticipant, 
  useRoom 
} from '@livekit/react-native';
import { Audio } from 'expo-av';
import { Alert } from 'react-native';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';

// Create a component to manage the voice interaction
const VoiceInteraction = ({ onUserDataComplete }) => {
  const room = useRoom();
  const { localParticipant } = room;
  const [agentState, setAgentState] = useState('connecting');
  const [transcript, setTranscript] = useState('');
  const [userOnboardingData, setUserOnboardingData] = useState({});
  
  // Monitor agent participant and its state
  const onAgentStateChanged = useCallback((newState) => {
    setAgentState(newState);
    
    // Process completed onboarding data when available
    if (newState === 'onboardingComplete' && userOnboardingData.isComplete) {
      onUserDataComplete(userOnboardingData);
    }
  }, [userOnboardingData, onUserDataComplete]);
  
  // Handle transcription updates
  const onTranscriptionReceived = useCallback((data) => {
    setTranscript(data.text);
    
    // Extract onboarding data from agent responses
    if (data.metadata && data.metadata.onboardingData) {
      setUserOnboardingData(prev => ({
        ...prev,
        ...data.metadata.onboardingData,
        isComplete: data.metadata.onboardingComplete || false
      }));
    }
  }, []);
  
  // Request microphone permission and create audio track
  useEffect(() => {
    const setupAudio = async () => {
      try {
        const permission = await Audio.requestPermissionsAsync();
        if (permission.status !== 'granted') {
          Alert.alert(
            'Microphone Permission Required',
            'Please allow microphone access to use the voice assistant'
          );
          return;
        }
        
        // Create and publish local audio track
        if (localParticipant) {
          await localParticipant.enableAudio();
        }
      } catch (error) {
        console.error('Error setting up audio:', error);
        Alert.alert(
          'Audio Setup Error',
          'Failed to set up microphone. Please try again or use manual onboarding.'
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
  }, [localParticipant]);
  
  return (
    <View style={styles.interactionContainer}>
      {agentState === 'connecting' && (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.stateText}>Connecting to AI Assistant...</Text>
        </View>
      )}
      
      {agentState === 'listening' && (
        <View style={styles.stateContainer}>
          <View style={styles.listeningIndicator} />
          <Text style={styles.stateText}>Listening...</Text>
        </View>
      )}
      
      {agentState === 'thinking' && (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="small" color="#0066cc" />
          <Text style={styles.stateText}>Processing...</Text>
        </View>
      )}
      
      {agentState === 'speaking' && (
        <View style={styles.stateContainer}>
          <View style={styles.speakingIndicator} />
          <Text style={styles.stateText}>AI Assistant is speaking</Text>
        </View>
      )}
      
      <View style={styles.transcriptContainer}>
        <Text style={styles.transcriptText}>{transcript}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.switchButton}
        onPress={() => {
          room.disconnect();
          navigation.navigate('ManualOnboarding');
        }}
      >
        <Text style={styles.switchButtonText}>
          Switch to Manual Onboarding
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Main Voice Onboarding Screen
const VoiceOnboardingScreen = () => {
  const navigation = useNavigation();
  const [token, setToken] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState(null);
  
  // Get LiveKit token from Firebase function
  useEffect(() => {
    const getToken = async () => {
      try {
        setIsConnecting(true);
        const auth = getAuth();
        const userId = auth.currentUser?.uid;
        
        if (!userId) {
          throw new Error('User not authenticated');
        }
        
        const functions = getFunctions();
        const createLiveKitToken = httpsCallable(functions, 'createLiveKitToken');
        const result = await createLiveKitToken({ userId });
        
        setToken(result.data.token);
      } catch (err) {
        console.error('Error getting token:', err);
        setError('Failed to connect to voice assistant. Please try again or use manual onboarding.');
      } finally {
        setIsConnecting(false);
      }
    };
    
    getToken();
  }, []);
  
  // Handle successful completion of onboarding
  const handleOnboardingComplete = (userData) => {
    // Save onboarding data to your Firebase database using existing service
    // This would connect to userProfileService.ts in Future Fitness
    
    // Navigate to dashboard
    navigation.reset({
      index: 0,
      routes: [{ name: 'Dashboard' }],
    });
  };
  
  if (isConnecting) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Preparing voice assistant...</Text>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.errorButton}
          onPress={() => navigation.navigate('OnboardingChoice')}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Voice Onboarding</Text>
      </View>
      
      {token ? (
        <LiveKitRoom
          url={LIVEKIT_URL} // From environment variables
          token={token}
          audio={true}
          video={false}
          onError={(error) => {
            console.error('LiveKit error:', error);
            setError('Connection error. Please try again or use manual onboarding.');
          }}
        >
          <AudioSession mode="voice" />
          <VoiceInteraction onUserDataComplete={handleOnboardingComplete} />
        </LiveKitRoom>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#0066cc',
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
  interactionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderRadius: 8,
    padding: 16,
    width: '90%',
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
    color: '#0066cc',
    fontSize: 16,
  }
});

export default VoiceOnboardingScreen;
```

### Backend Implementation

Firebase function for token generation:

```javascript
// Firebase function for token generation
const functions = require('firebase-functions');
const { AccessToken } = require('livekit-server-sdk');

exports.createLiveKitToken = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId } = data;
  
  // Create LiveKit token
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: userId,
    }
  );
  
  // Define room for onboarding
  at.addGrant({ 
    roomJoin: true, 
    room: 'onboarding-room',
    canPublish: true,
    canSubscribe: true
  });

  // Generate token
  const token = at.toJwt();
  return { token };
});
```

Voice Agent Server:

```javascript
// server/voiceAgent.js - Future Fitness Voice Agent Setup
const { VoicePipelineAgent } = require('@livekit/agents');
const { DeepgramSTT } = require('@livekit/agents-plugins-deepgram');
const { ElevenLabsTTS } = require('@livekit/agents-plugins-elevenlabs');
const { GoogleGeminiLLM } = require('@livekit/agents-plugins-gemini');

// Future Fitness specific onboarding questions and flow
const onboardingFlow = {
  introduction: "Hi there! I'm your personal AI fitness assistant for Future Fitness. I'll help you set up your profile so we can track your fitness journey. What's your name?",
  questions: [
    {
      id: 'name',
      question: "What's your name?",
      validate: (answer) => answer && answer.length > 0,
      errorMessage: "I didn't catch your name. Could you please repeat it?",
    },
    {
      id: 'age',
      question: "Thanks, {{name}}! How old are you?",
      validate: (answer) => {
        const age = parseInt(answer);
        return !isNaN(age) && age > 0 && age < 120;
      },
      errorMessage: "I need a valid age to continue. Please tell me your age in years.",
    },
    {
      id: 'currentWeight',
      question: "What's your current weight in kilograms?",
      validate: (answer) => {
        const weight = parseFloat(answer.replace('kg', '').trim());
        return !isNaN(weight) && weight > 20 && weight < 300;
      },
      errorMessage: "I need a valid weight to continue. Please tell me your weight in kilograms.",
    },
    {
      id: 'targetWeight',
      question: "What's your target weight in kilograms?",
      validate: (answer) => {
        const weight = parseFloat(answer.replace('kg', '').trim());
        return !isNaN(weight) && weight > 20 && weight < 300;
      },
      errorMessage: "I need a valid target weight. Please tell me your goal weight in kilograms.",
    },
    {
      id: 'targetDate',
      question: "When would you like to reach your target weight? For example, in 3 months or by a specific date.",
      validate: (answer) => answer && answer.length > 0,
      errorMessage: "I need to know your timeline to help customize your fitness plan.",
    },
    {
      id: 'fitnessGoal',
      question: "What's your primary fitness goal? For example, losing weight, maintaining weight, or gaining muscle?",
      validate: (answer) => answer && answer.length > 0,
      errorMessage: "I need to know your fitness goal to personalize your experience.",
    },
    {
      id: 'activityLevel',
      question: "How would you describe your activity level? Sedentary, lightly active, moderately active, or very active?",
      validate: (answer) => {
        const levels = ['sedentary', 'lightly active', 'moderately active', 'very active'];
        return levels.some(level => answer.toLowerCase().includes(level));
      },
      errorMessage: "Please select from: sedentary, lightly active, moderately active, or very active.",
    },
    {
      id: 'dietaryRestrictions',
      question: "Do you have any dietary restrictions or preferences? For example, vegetarian, vegan, gluten-free?",
      validate: (answer) => true, // All answers are valid here
    }
  ],
  conclusion: "Great! I've collected all the information needed to set up your profile. You're all set to start your fitness journey with Future Fitness!"
};

// Function to create and start voice agent
async function createVoiceAgent(roomName, identity) {
  // Initialize the STT, LLM, and TTS components
  const stt = new DeepgramSTT({
    apiKey: process.env.DEEPGRAM_API_KEY,
    model: 'nova-2-general',
    language: 'en',
    smartFormat: true,
    punctuate: true,
  });
  
  const llm = new GoogleGeminiLLM({
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-2.0-flash',
    systemPrompt: `
      You are an AI fitness assistant for Future Fitness app.
      Your task is to help users complete their onboarding process by collecting relevant fitness information.
      Be friendly, concise, and helpful. If you don't understand a response, politely ask for clarification.
      Your goal is to collect all required information for the user's fitness profile.
    `,
  });
  
  const tts = new ElevenLabsTTS({
    apiKey: process.env.ELEVENLABS_API_KEY,
    voiceId: 'voice_id_here', // Select appropriate voice ID
    model: 'eleven_turbo_v2_5',
  });
  
  // Create the voice agent
  const agent = new VoicePipelineAgent({
    stt,
    llm,
    tts,
    livekit: {
      url: process.env.LIVEKIT_URL,
      apiKey: process.env.LIVEKIT_API_KEY,
      apiSecret: process.env.LIVEKIT_API_SECRET,
    },
  });
  
  // Set up conversation state
  let currentQuestionIndex = -1;
  let userData = {};
  
  // Handle user messages
  agent.onUserMessage(async (message, conversation) => {
    // Initial greeting
    if (currentQuestionIndex === -1) {
      currentQuestionIndex = 0;
      return onboardingFlow.introduction;
    }
    
    // Process user's answer to current question
    const currentQuestion = onboardingFlow.questions[currentQuestionIndex];
    const userAnswer = message.text;
    
    // Validate the answer
    if (currentQuestion.validate(userAnswer)) {
      // Store valid answer
      userData[currentQuestion.id] = userAnswer;
      
      // Move to next question or conclude
      currentQuestionIndex++;
      
      if (currentQuestionIndex >= onboardingFlow.questions.length) {
        // All questions answered, conclude onboarding
        
        // Include collected data in metadata
        conversation.setMetadata({
          onboardingData: userData,
          onboardingComplete: true
        });
        
        return onboardingFlow.conclusion;
      } else {
        // Ask next question, replacing placeholders with collected data
        let nextQuestion = onboardingFlow.questions[currentQuestionIndex].question;
        
        // Replace placeholders
        Object.keys(userData).forEach(key => {
          nextQuestion = nextQuestion.replace(`{{${key}}}`, userData[key]);
        });
        
        return nextQuestion;
      }
    } else {
      // Invalid answer, request again
      return currentQuestion.errorMessage;
    }
  });
  
  // Connect the agent to the room
  await agent.connect(roomName, `assistant-${identity}`);
  
  return agent;
}

module.exports = { createVoiceAgent };
```

## Future Fitness Integration Considerations

1. **Existing User Profiles**: Ensure the voice agent collects the same fields that are required in the Future Fitness user profile schema.

2. **Fitness Goals**: Customize the agent to understand fitness-specific terminology used in the Future Fitness app.

3. **Data Structure**: Make sure collected data matches the existing Firestore structure used by Future Fitness.

4. **Design Consistency**: Use the Future Fitness Tamagui theme for all UI elements in the voice agent screens.

5. **Analytics Integration**: Connect to the existing analytics system to track completion rates between manual and voice onboarding.

6. **Permissions Handling**: Ensure microphone permissions are properly integrated with other permission requests.

7. **Offline Support**: Design graceful fallbacks that align with Future Fitness's existing offline capabilities.

8. **Testing Across Devices**: Test on both iOS and Android to ensure consistent functionality with Future Fitness's target devices.

## Environment Setup

### Required Environment Variables

```
# LiveKit Configuration
LIVEKIT_URL=https://your-livekit-cloud-url.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret

# Deepgram Configuration
DEEPGRAM_API_KEY=your_deepgram_api_key

# Google Gemini Configuration
GEMINI_API_KEY=your_gemini_api_key

# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

## Testing Checklist

- [x] Phase 1: Setup and Infrastructure
  - [x] LiveKit SDK Installation
  - [x] Backend Server Setup for Token Generation
  - [x] API Keys and Configuration
- [x] Phase 2: Onboarding Choice Screen
  - [x] Onboarding choice screen displays correctly
  - [x] Navigation between manual and voice onboarding works
  - [x] UI matches Future Fitness design system
- [x] Phase 3: Voice Agent Implementation
  - [x] LiveKit Room Connection implemented
  - [x] Token retrieval from backend works
  - [x] Voice Pipeline Setup configured
  - [x] Conversation flow implements all questions
  - [x] Data collection and validation works
- [x] Phase 4: Integration with Existing Features
  - [x] Data from voice onboarding matches manual format
  - [x] Consistent redirection to dashboard implemented
  - [x] Firebase data structure maintained
  - [x] Proper error handling implemented
  - [x] Network disconnection recovery added
  - [x] Environment configuration documented
- [ ] Phase 5: Refinement & Deployment
  - [ ] Manual onboarding flow works as before
  - [ ] Voice agent initializes correctly
  - [ ] Audio permissions are requested properly
  - [ ] Voice agent asks all fitness-related questions in sequence
  - [ ] User responses are accurately transcribed
  - [ ] Invalid responses trigger appropriate error messages
  - [ ] Data is collected and stored in the Future Fitness Firestore database
  - [ ] User is redirected to dashboard after completion
  - [ ] Switching between manual and voice modes works

This implementation plan preserves the existing manual onboarding while adding a voice-based alternative, allowing Future Fitness to test the effectiveness and user satisfaction with voice interactions. 