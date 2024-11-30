// API Configuration
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDqyCgo8S2hRBLCUB3REO09lh87x-dlOYE';

// Gemini Model Configuration
export const GEMINI_MODELS = {
    VISION: 'gemini-1.5-flash',
    TEXT: 'gemini-1.5-flash',
    FAST: 'gemini-1.5-flash'
} as const;
