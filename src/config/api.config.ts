// API Configuration
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAPRpoj18r9y-CKUnw812o38-4tf_x5QkM';

// Gemini Model Configuration
export const GEMINI_MODELS = {
    VISION: 'gemini-1.5-flash',
    TEXT: 'gemini-1.5-flash',
    FAST: 'gemini-1.5-flash'
} as const;
