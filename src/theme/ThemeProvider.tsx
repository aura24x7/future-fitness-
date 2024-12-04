import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Theme } from '@react-navigation/native';
import { CustomLightTheme, CustomDarkTheme } from './theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme as useTamaguiTheme } from 'tamagui';

type ThemeContextType = {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_PREFERENCE_KEY = '@theme_preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(systemColorScheme === 'dark');
  const tamaguiTheme = useTamaguiTheme();

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    // Sync Tamagui theme with our theme
    if (tamaguiTheme.name !== (isDarkMode ? 'dark' : 'light')) {
      tamaguiTheme.name = isDarkMode ? 'dark' : 'light';
    }
  }, [isDarkMode, tamaguiTheme]);

  const loadThemePreference = async () => {
    try {
      const savedPreference = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
      if (savedPreference !== null) {
        setIsDarkMode(savedPreference === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem(THEME_PREFERENCE_KEY, newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = isDarkMode ? CustomDarkTheme : CustomLightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
