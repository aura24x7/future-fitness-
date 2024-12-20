// AI Configuration
export const AI_CONFIG = {
    // Gemini API configuration
    GEMINI: {
        API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
        MODEL: 'gemini-1.5-pro',  // Using Flash as unified model for both text and vision
        GENERATION: {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
        },
        MAX_RETRIES: 3,
        TIMEOUT: 30000, // 30 seconds
        ERROR_MESSAGES: {
            API_DISABLED: 'Gemini API is not enabled for this project. Please enable it in the Google Cloud Console.',
            INVALID_KEY: 'Invalid API key. Please check your configuration.',
            NETWORK_ERROR: 'Network error occurred. Please check your connection.',
            TIMEOUT: 'Request timed out. Please try again.',
            GENERATION_ERROR: 'Error generating response. Please try again.',
        }
    },
    
    // Workout generation settings
    WORKOUT: {
        DEFAULT_DURATION: 45, // minutes
        DIFFICULTY_LEVELS: ['beginner', 'intermediate', 'advanced'],
        MAX_EXERCISES_PER_WORKOUT: 8,
    },
    
    // Meal plan generation settings
    MEAL_PLAN: {
        MEALS_PER_DAY: 3,
        INCLUDE_SNACKS: true,
        CALORIES_RANGE: {
            min: 1500,
            max: 2500
        },
    },
    
    // Image analysis settings
    VISION: {
        SUPPORTED_FORMATS: ['image/jpeg', 'image/png'],
        MAX_IMAGE_SIZE: 4 * 1024 * 1024, // 4MB
        ANALYSIS_TYPES: {
            FORM_CHECK: 'exercise_form',
            FOOD_RECOGNITION: 'food_recognition',
            PROGRESS_TRACKING: 'progress_tracking'
        }
    }
};
