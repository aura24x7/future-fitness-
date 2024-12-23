import { API_KEYS } from './keys.config';

// Gemini API Configuration
const API_KEY = API_KEYS.GEMINI.trim();

// Debug logging for API key configuration
if (!API_KEY) {
    console.error('❌ Gemini API key is not configured');
    console.error('Please check keys.config.ts and ensure GEMINI key is set');
} else {
    const keyPreview = API_KEY.substring(0, 8) + '...';
    console.log('📝 Gemini API Key loaded:', keyPreview);
}

// Export the trimmed API key
export const GEMINI_API_KEY = API_KEY;

// Model names exactly as per documentation
export const GEMINI_MODELS = {
    TEXT: "gemini-1.5-flash",
    VISION: "gemini-1.5-flash",
    FAST: "gemini-1.5-flash"
} as const;

// Generation config exactly as per documentation
export const GENERATION_CONFIG = {
    temperature: 0.7,
    topK: 40,
    topP: 0.8,
    maxOutputTokens: 2048,
} as const;
