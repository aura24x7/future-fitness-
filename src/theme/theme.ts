import { Theme as NavigationTheme } from '@react-navigation/native';

// Extend the NavigationTheme type with our custom colors
export interface Theme extends NavigationTheme {
  colors: NavigationTheme['colors'] & {
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

export const CustomLightTheme: Theme = {
  dark: false,
  colors: {
    primary: '#6366F1',
    background: '#F3F4F6',
    card: '#FFFFFF',
    text: '#1F2937',
    border: '#E5E7EB',
    notification: '#6366F1',
    // Custom colors
    secondaryText: '#6B7280',
    success: '#10B981',
    error: '#DC2626',
    cardBackground: '#FFFFFF',
    headerBackground: '#FFFFFF',
    tabBarBackground: '#FFFFFF',
    exerciseCard: '#FFFFFF',
    exerciseCardCompleted: '#F0FDF4',
    exerciseCardBorder: '#6366F1',
    gradientStart: '#6366F1',
    gradientEnd: '#818CF8',
  },
};

export const CustomDarkTheme: Theme = {
  dark: true,
  colors: {
    primary: '#818CF8',
    background: '#000000',
    card: '#1F2937',
    text: '#F9FAFB',
    border: '#374151',
    notification: '#818CF8',
    // Custom colors
    secondaryText: '#9CA3AF',
    success: '#059669',
    error: '#DC2626',
    cardBackground: '#1F2937',
    headerBackground: '#1F2937',
    tabBarBackground: '#1F2937',
    exerciseCard: '#1F2937',
    exerciseCardCompleted: '#132F1A',
    exerciseCardBorder: '#818CF8',
    gradientStart: '#818CF8',
    gradientEnd: '#6366F1',
  },
};
