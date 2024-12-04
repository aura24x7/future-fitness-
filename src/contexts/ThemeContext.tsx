import React, { createContext, useContext, useState } from 'react';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  cardBackground: string;
  text: string;
  textSecondary: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
}

const defaultColors: ThemeColors = {
  primary: '#6366F1',
  secondary: '#818CF8',
  background: '#F9FAFB',
  cardBackground: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
};

const darkColors: ThemeColors = {
  primary: '#818CF8',
  secondary: '#6366F1',
  background: '#1F2937',
  cardBackground: '#374151',
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const value = {
    colors: isDark ? darkColors : defaultColors,
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
