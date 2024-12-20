import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TamaguiProvider } from 'tamagui';
import config from '../tamagui.config';
import { colors } from './colors';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  cardBackground: string;
  text: string;
  textSecondary: string;
  border: string;
}

const lightColors: ThemeColors = {
  primary: colors.primary,
  secondary: colors.primaryLight,
  background: colors.background.light,
  cardBackground: colors.background.card.light,
  text: colors.text.primary.light,
  textSecondary: colors.text.secondary.light,
  border: colors.border.light,
};

const darkColors: ThemeColors = {
  primary: colors.primaryLight,
  secondary: colors.primary,
  background: colors.background.dark,
  cardBackground: colors.background.card.dark,
  text: colors.text.primary.dark,
  textSecondary: colors.text.secondary.dark,
  border: colors.border.dark,
};

type ThemeContextType = {
  colors: ThemeColors;
  isDarkMode: boolean;
  toggleTheme: () => void;
  themePreference: 'light' | 'dark' | 'system';
  setThemePreference: (theme: 'light' | 'dark' | 'system') => void;
};

const defaultThemeContext: ThemeContextType = {
  colors: darkColors,
  isDarkMode: true,
  toggleTheme: () => {},
  themePreference: 'dark',
  setThemePreference: () => {},
};

const ThemeContext = createContext<ThemeContextType>(defaultThemeContext);

const THEME_PREFERENCE_KEY = '@theme_preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>('system');

  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
        if (saved) {
          setThemePreference(saved as 'light' | 'dark' | 'system');
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
      }
    };
    loadThemePreference();
  }, []);

  // Memoize theme calculations
  const isDarkMode = useMemo(() => {
    return themePreference === 'system' 
      ? systemColorScheme === 'dark'
      : themePreference === 'dark';
  }, [themePreference, systemColorScheme]);

  // Memoize colors
  const colors = useMemo(() => 
    isDarkMode ? darkColors : lightColors,
  [isDarkMode]);

  const toggleTheme = useCallback(() => {
    setThemePreference(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(THEME_PREFERENCE_KEY, newTheme).catch(error => 
        console.warn('Failed to save theme preference:', error)
      );
      return newTheme;
    });
  }, []);

  // Memoize context value
  const contextValue = useMemo<ThemeContextType>(() => ({
    colors,
    isDarkMode,
    toggleTheme,
    themePreference,
    setThemePreference,
  }), [colors, isDarkMode, toggleTheme, themePreference]);

  return (
    <TamaguiProvider config={config} defaultTheme={isDarkMode ? 'dark' : 'light'}>
      <ThemeContext.Provider value={contextValue}>
        {children}
      </ThemeContext.Provider>
    </TamaguiProvider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
