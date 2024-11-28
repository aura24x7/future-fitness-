// Modern fitness app color palette
export const colors = {
  // Primary Colors
  primary: {
    main: '#2196F3',           // Trustworthy blue
    light: '#64B5F6',          // Light blue
    dark: '#1976D2',           // Deep blue
    contrast: '#FF9800',       // Energetic orange
  },

  // Secondary Colors
  secondary: {
    main: '#FF9800',          // Energetic orange
    light: '#FFB74D',         // Light orange
    dark: '#F57C00',          // Deep orange
    contrast: '#4CAF50',      // Healthy green
  },

  // Accent Colors
  accent: {
    success: '#4CAF50',       // Healthy green
    warning: '#FFC107',       // Cheerful yellow
    error: '#F44336',         // Alert red
    info: '#2196F3',         // Info blue
  },

  // Gradients
  gradients: {
    primary: ['#2196F3', '#1976D2'],      // Blue gradient
    secondary: ['#FF9800', '#F57C00'],     // Orange gradient
    success: ['#4CAF50', '#388E3C'],       // Green gradient
    dark: ['#424242', '#212121'],          // Dark gradient
  },

  // Background Colors
  background: {
    primary: '#FFFFFF',       // Pure white
    secondary: '#F5F5F5',     // Light gray
    dark: '#212121',         // Dark gray
  },

  // Text Colors
  text: {
    primary: '#212121',       // Near black
    secondary: '#757575',     // Medium gray
    light: '#BDBDBD',        // Light gray
    white: '#FFFFFF',        // White
  },

  // Border Colors
  border: {
    light: '#E0E0E0',        // Light gray
    medium: '#BDBDBD',       // Medium gray
    dark: '#9E9E9E',         // Dark gray
  },

  // Status Colors
  status: {
    active: '#4CAF50',       // Green
    inactive: '#757575',     // Gray
    warning: '#FFC107',      // Yellow
    error: '#F44336',        // Red
  },
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
  small: 8,
  medium: 12,
  large: 16,
  round: 999,
} as const;

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;
