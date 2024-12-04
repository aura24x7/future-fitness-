import { useColorScheme } from 'react-native';

interface ThemeColors {
  primary: string;
  background: string;
  card: string;
  text: string;
  border: string;
  secondaryText: string;
  cardGradientStart: string;
  cardGradientEnd: string;
}

interface Theme {
  isDarkMode: boolean;
  colors: ThemeColors;
}

export const useTheme = (): { theme: Theme } => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const lightColors: ThemeColors = {
    primary: '#8B5CF6',
    background: '#F9FAFB',
    card: '#FFFFFF',
    text: '#1F2937',
    border: '#E5E7EB',
    secondaryText: '#6B7280',
    cardGradientStart: '#FFFFFF',
    cardGradientEnd: '#F3F4F6',
  };

  const darkColors: ThemeColors = {
    primary: '#A78BFA',
    background: '#111827',
    card: '#1F2937',
    text: '#F9FAFB',
    border: '#374151',
    secondaryText: '#9CA3AF',
    cardGradientStart: '#1F2937',
    cardGradientEnd: '#111827',
  };

  return {
    theme: {
      isDarkMode,
      colors: isDarkMode ? darkColors : lightColors,
    },
  };
};
