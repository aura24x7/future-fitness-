// API Configuration
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAPRpoj18r9y-CKUnw812o38-4tf_x5QkM';

// Gemini Model Configuration
export const GEMINI_MODELS = {
    VISION: 'gemini-2.0-flash-exp',
    TEXT: 'gemini-2.0-flash-exp',
    FAST: 'gemini-2.0-flash-exp'
} as const;
