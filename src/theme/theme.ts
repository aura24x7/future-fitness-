import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';

export const CustomLightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4CAF50',
    background: '#F3F4F6',
    card: '#FFFFFF',
    text: '#1F2937',
    border: '#E5E5E5',
    notification: '#4CAF50',
    // Custom colors
    secondaryText: '#666666',
    success: '#45a049',
    error: '#DC2626',
    cardBackground: '#FFFFFF',
    headerBackground: '#FFFFFF',
    tabBarBackground: '#FFFFFF',
    exerciseCard: '#FFFFFF',
    exerciseCardCompleted: '#F0FDF4',
    exerciseCardBorder: '#4CAF50',
    gradientStart: '#4CAF50',
    gradientEnd: '#45a049',
  },
};

export const CustomDarkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#4CAF50',
    background: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    border: '#2D2D2D',
    notification: '#4CAF50',
    // Custom colors
    secondaryText: '#A0A0A0',
    success: '#45a049',
    error: '#DC2626',
    cardBackground: '#1E1E1E',
    headerBackground: '#1E1E1E',
    tabBarBackground: '#1E1E1E',
    exerciseCard: '#1E1E1E',
    exerciseCardCompleted: '#132713',
    exerciseCardBorder: '#4CAF50',
    gradientStart: '#4CAF50',
    gradientEnd: '#45a049',
  },
};

// Add custom colors to the Theme type
declare module '@react-navigation/native' {
  export interface Theme {
    colors: {
      secondaryText: string;
      success: string;
      error: string;
      cardBackground: string;
      headerBackground: string;
      tabBarBackground: string;
      exerciseCard: string;
      exerciseCardCompleted: string;
      exerciseCardBorder: string;
      gradientStart: string;
      gradientEnd: string;
    };
  }
}
