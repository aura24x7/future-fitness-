# Future Fitness Voice Agent Setup Guide

This document provides instructions for setting up and configuring the AI Voice Agent for Future Fitness onboarding.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [API Key Configuration](#api-key-configuration)
- [Development Configuration](#development-configuration)
- [Production Configuration](#production-configuration)
- [Testing the Voice Agent](#testing-the-voice-agent)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before setting up the voice agent, ensure you have:

1. An account with [LiveKit](https://livekit.io/) for real-time audio
2. An API key for [Deepgram](https://www.deepgram.com/) for speech-to-text
3. An API key for [Google Gemini](https://ai.google.dev/) for conversation intelligence
4. An API key for [ElevenLabs](https://elevenlabs.io/) for text-to-speech
5. Node.js and yarn installed on your development machine
6. Firebase project set up and configured for Future Fitness

## Environment Setup

You'll need to set up the following environment variables:

```bash
# LiveKit Configuration
LIVEKIT_URL=https://your-livekit-cloud-url.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_ROOM_NAME=future-fitness-onboarding

# Deepgram Configuration
DEEPGRAM_API_KEY=your_deepgram_api_key

# Google Gemini Configuration
GEMINI_API_KEY=your_gemini_api_key

# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=your_selected_voice_id
```

For local development, you can create a `.env.local` file in the root of the project and add these values.

## API Key Configuration

### LiveKit

1. Sign up for a LiveKit account at [https://livekit.io/](https://livekit.io/)
2. Create a new project
3. Navigate to the project settings to obtain your API key and secret
4. Note your LiveKit URL (it should be in the format `wss://your-project.livekit.cloud`)

### Deepgram

1. Sign up for a Deepgram account at [https://www.deepgram.com/](https://www.deepgram.com/)
2. Create a new API key
3. Make sure to select the plan that supports real-time transcription

### Google Gemini

1. Sign up for Google AI Studio at [https://ai.google.dev/](https://ai.google.dev/)
2. Create a new API key for the Gemini model
3. Take note of usage limits for your account

### ElevenLabs

1. Sign up for ElevenLabs at [https://elevenlabs.io/](https://elevenlabs.io/)
2. Generate an API key
3. Choose or create a voice for your AI assistant and note its voice ID

## Development Configuration

For development, the voice agent is configured to work with mock data. This allows you to test the UI and flow without making actual API calls.

To enable mock mode:

1. The system automatically detects when running in Expo Go and switches to mock mode
2. For development builds, you can explicitly set mock mode in the LiveKit context

## Production Configuration

For production deployment:

1. Set up a Firebase Function to generate LiveKit tokens securely:

```javascript
// Example Firebase function for token generation
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
  
  at.addGrant({ 
    roomJoin: true, 
    room: process.env.LIVEKIT_ROOM_NAME || 'future-fitness-onboarding',
    canPublish: true,
    canSubscribe: true
  });

  return { token: at.toJwt() };
});
```

2. Update the `livekitTokenService.ts` to call this Firebase Function:

```typescript
// In src/firebase/livekitTokenService.ts
generateToken: async (userId: string): Promise<string> => {
  try {
    const functions = getFunctions();
    const createLiveKitToken = httpsCallable(functions, 'createLiveKitToken');
    const result = await createLiveKitToken({ userId });
    return result.data.token;
  } catch (error) {
    console.error('[livekitTokenService] Error generating token:', error);
    throw error;
  }
}
```

3. Ensure all API keys are securely stored in your Firebase environment configuration

## Testing the Voice Agent

To test the voice agent:

1. Start the Future Fitness app with `npx expo start --clear`
2. Navigate to the onboarding flow
3. Select "AI Voice Assistant" on the onboarding choice screen
4. Allow microphone permissions when prompted
5. Speak clearly and follow the assistant's questions
6. Check that your responses are correctly transcribed and processed
7. Verify the data is saved to your Firebase profile after completion

## Troubleshooting

### Common Issues

1. **Microphone permissions denied**
   - Ensure you've granted microphone permissions to the app
   - Check if you need to enable microphone access in your system settings

2. **LiveKit connection failing**
   - Verify your LiveKit API key and secret are correct
   - Check if there are any network restrictions blocking WebRTC traffic

3. **Voice recognition issues**
   - Speak clearly and in a quiet environment
   - Check if the Deepgram API key is valid and properly configured

4. **AI Assistant not responding correctly**
   - Verify your Google Gemini API key is correct
   - Check the system prompt configuration in the voice agent settings

5. **TTS (voice synthesis) problems**
   - Confirm your ElevenLabs API key is valid
   - Verify the voice ID exists in your ElevenLabs account

For any other issues, check the console logs for specific error messages and refer to the respective service documentation. 