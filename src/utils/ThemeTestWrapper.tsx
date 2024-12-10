import React from 'react';
import { View } from 'react-native';
import { useThemeTest, ThemeTestUtils } from './themeTestUtils';

export const ThemeTestWrapper = ({ 
  children,
  testID
}: { 
  children: React.ReactNode;
  testID?: string;
}) => {
  const { verifyThemeConsistency } = useThemeTest();

  if (__DEV__) {
    // Run non-intrusive tests
    const { isValid, issues } = verifyThemeConsistency();
    
    if (!isValid) {
      console.warn(`Theme issues for ${testID}:`, issues);
    }
  }

  // Return original component without modification
  return <>{children}</>;
}; 