export const models = {
  // Gemini Models
  gemini: {
    text: 'gemini-1.5-flash',
    vision: 'gemini-1.5-flash',
    fast: 'gemini-1.5-flash',
  },

  // API Keys
  apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
} as const;
