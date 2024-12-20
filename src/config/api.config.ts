// API Configuration
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAPRpoj18r9y-CKUnw812o38-4tf_x5QkM';

// Gemini Model Configuration
export const GEMINI_MODELS = {
    VISION: 'gemini-1.5-flash', // Using Pro for better food recognition accuracy
    TEXT: 'gemini-1.5-flash',
    FAST: 'gemini-1.5-flash'
} as const;

// Generation Configuration
export const GENERATION_CONFIG = {
    temperature: 0.2,
    topK: 32,
    topP: 0.7,
    maxOutputTokens: 2048
} as const;
