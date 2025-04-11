/**
 * Voice Agent Configuration
 * 
 * This file contains configuration settings for the voice agent functionality.
 * In a production environment, these values should be loaded from environment variables.
 */

// LiveKit Configuration
export const LIVEKIT_CONFIG = {
  // URL for the LiveKit server
  url: process.env.LIVEKIT_URL || 'wss://future-fitness-livekit.livekit.cloud',
  
  // Room name for voice onboarding sessions
  roomName: process.env.LIVEKIT_ROOM_NAME || 'future-fitness-onboarding',
};

// Deepgram Configuration (for Speech-to-Text)
export const DEEPGRAM_CONFIG = {
  // API Key for Deepgram (actual key should be stored in environment variables)
  apiKey: process.env.DEEPGRAM_API_KEY || 'YOUR_DEEPGRAM_API_KEY',
  
  // Model selection
  model: 'nova-2-general',
  
  // Language settings
  language: 'en',
  
  // Additional options
  smartFormat: true,
  punctuate: true,
};

// Google Gemini Configuration (for LLM)
export const GEMINI_CONFIG = {
  // API Key for Google Gemini (actual key should be stored in environment variables)
  apiKey: process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY',
  
  // Model selection
  model: 'gemini-2.0-flash',
  
  // System prompt for the AI assistant
  systemPrompt: `
    You are an AI fitness assistant for Future Fitness app.
    Your task is to help users complete their onboarding process by collecting relevant fitness information.
    Be friendly, concise, and helpful. If you don't understand a response, politely ask for clarification.
    Your goal is to collect all required information for the user's fitness profile.

    Required information to collect:
    1. Name
    2. Age
    3. Gender (male, female, or other)
    4. Current weight (in kg)
    5. Target weight (in kg)
    6. Target date to achieve weight goal
    7. Fitness goal (lose weight, maintain weight, gain muscle)
    8. Activity level (sedentary, lightly active, moderately active, very active)
    9. Dietary preferences or restrictions

    Validate responses and ask for clarification if needed.
  `,
};

// ElevenLabs Configuration (for Text-to-Speech)
export const ELEVENLABS_CONFIG = {
  // API Key for ElevenLabs (actual key should be stored in environment variables)
  apiKey: process.env.ELEVENLABS_API_KEY || 'YOUR_ELEVENLABS_API_KEY',
  
  // Voice ID for the assistant
  voiceId: 'voice_id_here',
  
  // Model selection
  model: 'eleven_turbo_v2_5',
};

export default {
  livekit: LIVEKIT_CONFIG,
  deepgram: DEEPGRAM_CONFIG,
  gemini: GEMINI_CONFIG,
  elevenlabs: ELEVENLABS_CONFIG,
}; 