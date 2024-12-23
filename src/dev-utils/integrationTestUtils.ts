import { useTheme } from '@tamagui/core';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const IntegrationTestUtils = {
  // Verify theme persistence without modifying storage
  verifyThemePersistence: async (): Promise<boolean> => {
    try {
      const storedTheme = await AsyncStorage.getItem('theme-preference');
      return storedTheme !== null;
    } catch {
      return false;
    }
  },

  // Test navigation state preservation
  verifyNavigationState: (currentState: any, previousState: any): boolean => {
    return JSON.stringify(currentState) === JSON.stringify(previousState);
  },

  // Verify theme context updates
  verifyThemeContext: (theme: any): boolean => {
    const requiredProperties = ['colors', 'spacing', 'typography'];
    return requiredProperties.every(prop => theme[prop] !== undefined);
  },

  // Development only utilities
  __DEV__: {
    logIntegrationStatus: (component: string, status: any) => {
      if (__DEV__) {
        console.log(`Integration status for ${component}:`, status);
      }
    }
  }
}; 