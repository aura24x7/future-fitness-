// Modern fitness app color palette
export const colors = {
  // Primary Colors
  primary: '#8B5CF6',           // Main purple
  primaryLight: '#A78BFA',      // Light purple
  primaryDark: '#7C3AED',       // Deep purple
  accent: '#FF6B6B',           // Accent color

  // Background Colors
  background: {
    light: '#F9FAFB',           // Light gray
    dark: '#111827',            // Dark gray
    card: {
      light: '#FFFFFF',
      dark: '#1F2937'
    }
  },

  // Text Colors
  text: {
    primary: {
      light: '#1F2937',
      dark: '#F9FAFB'
    },
    secondary: {
      light: '#6B7280',
      dark: '#9CA3AF'
    }
  },

  // Progress Colors
  progress: {
    indicator: '#FF6B6B',
    background: {
      light: '#E5E7EB',
      dark: '#374151'
    }
  },

  // Macro Colors
  macros: {
    carbs: '#FF69B4',           // Pink
    protein: '#87CEEB',         // Sky blue
    fats: '#FFA500',            // Orange
    other: '#9370DB',           // Purple
  },

  // Border Colors
  border: {
    light: '#E5E7EB',
    dark: '#374151'
  }
} as const;

// Opacity values
export const opacity = {
  light: 0.2,
  medium: 0.5,
  high: 0.8,
} as const;

// Shadows
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

// Border Radius
export const borderRadius = {
  small: 4,
  medium: 8,
  large: 16,
  xlarge: 24,
  round: 9999,
} as const;

// Spacing
export const spacing = {
  tiny: 4,
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
  xxlarge: 48,
} as const;
