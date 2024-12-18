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
    dark: '#000000',            // AMOLED black
    card: {
      light: '#FFFFFF',
      dark: '#000000'           // Updated to AMOLED black
    },
    secondary: {
      light: '#F3F4F6',
      dark: '#000000'           // Updated to AMOLED black
    },
    input: {
      light: '#F3F4F6',
      dark: '#000000'           // Updated to AMOLED black
    }
  },

  // Text Colors
  text: {
    primary: {
      light: '#111827',
      dark: '#FFFFFF'           // Updated for better contrast
    },
    secondary: {
      light: '#6B7280',
      dark: '#94A3B8'           // Updated for better contrast
    },
    accent: {
      light: '#8B5CF6',
      dark: '#818CF8'           // Updated for better contrast
    }
  },

  // Progress Colors
  progress: {
    indicator: '#FF6B6B',
    background: {
      light: '#E5E7EB',
      dark: '#374151'
    },
    success: {
      light: '#10B981',
      dark: '#059669'
    },
    error: {
      light: '#EF4444',
      dark: '#DC2626'
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
    dark: '#374151',
    focus: {
      light: '#8B5CF6',
      dark: '#A78BFA'
    }
  },

  // Gradient Colors
  gradient: {
    primary: ['#6366F1', '#818CF8'],    // Indigo gradient
    secondary: ['#3B82F6', '#60A5FA'],   // Blue gradient
  },

  // Input Colors
  input: {
    background: {
      light: '#FFFFFF',
      dark: '#000000'           // Updated to AMOLED black
    },
    placeholder: {
      light: '#9CA3AF',
      dark: '#6B7280'
    },
    border: {
      light: '#E5E7EB',
      dark: '#374151',
      focus: {
        light: '#8B5CF6',
        dark: '#A78BFA'
      }
    }
  },

  // Chart Colors
  chart: {
    grid: {
      light: '#E5E7EB',
      dark: '#374151'
    },
    label: {
      light: '#6B7280',
      dark: '#9CA3AF'
    }
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
    light: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    dark: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    }
  },
  medium: {
    light: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    dark: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 5,
    }
  },
  large: {
    light: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    },
    dark: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    }
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
