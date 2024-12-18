import { createTokens } from '@tamagui/core'

// Define size tokens first
const size = {
  0: 0,
  1: 4,
  2: 8,
  3: 16,
  4: 24,
  5: 32,
  6: 40,
  true: 8, // default size
}

// Create tokens with proper structure
export const tokens = createTokens({
  // Size tokens (required by Tamagui)
  size,
  // Space tokens (using size values)
  space: { ...size },
  // Radius tokens (using size values)
  radius: { ...size },
  // Zindex
  zIndex: {
    0: 0,
    1: 100,
    2: 200,
    3: 300,
    4: 400,
    5: 500,
  },
  // Color tokens
  color: {
    // Light theme colors
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#F3F4F6',
    gray100: '#E5E5E5',
    gray200: '#D4D4D4',
    gray300: '#A0A0A0',
    gray400: '#666666',
    gray500: '#2D2D2D',
    gray600: '#1E1E1E',
    gray700: '#000000',  // Updated to pure black for AMOLED screens
    
    // Theme-specific colors
    background: '#F3F4F6',
    backgroundHover: '#E5E5E5',
    backgroundPress: '#D4D4D4',
    
    text: '#1F2937',
    textHover: '#666666',
    textMuted: '#A0A0A0',
    
    primary: '#4CAF50',
    primaryHover: '#45a049',
    primaryPress: '#3d8b40',
    
    error: '#DC2626',
    errorLight: '#FEE2E2',
    errorDark: '#B91C1C',
    
    success: '#45a049',
    successLight: '#F0FDF4',
    successDark: '#166534',
    
    border: '#E5E5E5',
    borderHover: '#D4D4D4',
    borderFocus: '#4CAF50',
    
    card: '#FFFFFF',
    cardHover: '#F3F4F6',
    cardPress: '#E5E5E5',
    
    // Component-specific colors
    headerBackground: '#FFFFFF',
    tabBarBackground: '#FFFFFF',
    exerciseCard: '#FFFFFF',
    exerciseCardCompleted: '#F0FDF4',
    exerciseCardBorder: '#4CAF50',
    gradientStart: '#4CAF50',
    gradientEnd: '#45a049',
  },
})
