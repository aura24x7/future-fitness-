export const GEMINI_MODELS = {
  TEXT: 'gemini-pro',
  VISION: 'gemini-pro-vision'
} as const;

export const AI_CONFIG = {
  GEMINI: {
    GENERATION_CONFIG: {
      temperature: 0.2,
      topK: 32,
      topP: 0.7,
      maxOutputTokens: 2048
    }
  }
} as const;