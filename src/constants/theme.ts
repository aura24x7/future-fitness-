export const THEME_STORAGE_KEY = '@future_fitness/theme_preference'

export const THEME_ANIMATION_CONFIG = {
  duration: 200, // milliseconds
  useNativeDriver: false,
}

export const SHADOW_STYLES = {
  light: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dark: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    elevation: 5,
  },
}

// Preserve existing color values
export const EXERCISE_CARD_COLORS = {
  light: {
    background: '#FFFFFF',
    completed: '#F0FDF4',
    border: '#4CAF50',
  },
  dark: {
    background: '#1E1E1E',
    completed: '#132713',
    border: '#4CAF50',
  },
}

export const MEAL_CARD_COLORS = {
  light: {
    background: '#FFFFFF',
    completed: '#F0FDF4',
    border: '#E5E5E5',
  },
  dark: {
    background: '#1E1E1E',
    completed: '#132713',
    border: '#2D2D2D',
  },
}
