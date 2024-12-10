import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TamaguiProvider } from 'tamagui';
import config from '../tamagui.config';

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
  primary: '#6366F1',
  secondary: '#818CF8',
  background: '#F9FAFB',
  cardBackground: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
};

const darkColors: ThemeColors = {
  primary: '#818CF8',
  secondary: '#6366F1',
  background: '#1F2937',
  cardBackground: '#374151',
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  border: '#4B5563',
};

type ThemeContextType = {
  colors: ThemeColors;
  isDarkMode: boolean;
  toggleTheme: () => void;
  themePreference: 'light' | 'dark' | 'system';
  setThemePreference: (theme: 'light' | 'dark' | 'system') => void;
};

const defaultThemeContext: ThemeContextType = {
  colors: lightColors,
  isDarkMode: false,
  toggleTheme: () => {},
  themePreference: 'system',
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
