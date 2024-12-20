import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY, GEMINI_MODELS } from './api.config';

export const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Export models for easy access
export { GEMINI_MODELS }; 