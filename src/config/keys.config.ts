// API Keys Configuration
export const API_KEYS = {
    GEMINI: 'AIzaSyCEfP4zd3kbokwFtfAMWZqetXLoBq5ZofA'
} as const;

// Validation
Object.entries(API_KEYS).forEach(([key, value]) => {
    if (!value) {
        console.error(`❌ Missing API key for: ${key}`);
    }
}); 