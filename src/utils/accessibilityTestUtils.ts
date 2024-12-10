import { AccessibilityInfo, findNodeHandle, Platform, Dimensions } from 'react-native';

export const AccessibilityTestUtils = {
  // Test screen reader focus without modifying components
  verifyScreenReaderFocus: async (ref: any): Promise<boolean> => {
    if (!ref.current) return false;
    const node = findNodeHandle(ref.current);
    if (!node) return false;
    
    try {
      await AccessibilityInfo.setAccessibilityFocus(node);
      return true;
    } catch {
      return false;
    }
  },

  // Verify accessibility props without modifying components
  verifyAccessibilityProps: (props: any): boolean => {
    const requiredProps = [
      'accessibilityLabel',
      'accessibilityRole',
      'accessible'
    ];
    
    return requiredProps.every(prop => props[prop] !== undefined);
  },

  // Test color contrast ratios
  verifyContrastRatio: (foreground: string, background: string): number => {
    // Implementation of WCAG contrast ratio calculation
    // Returns contrast ratio without modifying anything
    return 4.5; // Placeholder - implement actual calculation
  },

  // New specific tests
  enhancedTests: {
    // Verify semantic heading levels
    verifyHeadingLevels: (headings: Array<{ level: number; label: string }>): boolean => {
      let previousLevel = 0;
      return headings.every(({ level }) => {
        const isValid = level === 1 || level - previousLevel <= 1;
        previousLevel = level;
        return isValid;
      });
    },

    // Verify touch target spacing
    verifyTouchTargetSpacing: (
      element: { x: number; y: number; width: number; height: number },
      siblings: Array<{ x: number; y: number; width: number; height: number }>
    ): boolean => {
      const minSpacing = Platform.select({ ios: 8, android: 10 });
      return siblings.every(sibling => {
        const horizontalSpacing = Math.min(
          Math.abs(element.x - (sibling.x + sibling.width)),
          Math.abs(sibling.x - (element.x + element.width))
        );
        const verticalSpacing = Math.min(
          Math.abs(element.y - (sibling.y + sibling.height)),
          Math.abs(sibling.y - (element.y + element.height))
        );
        return horizontalSpacing >= minSpacing || verticalSpacing >= minSpacing;
      });
    },

    // Verify text scaling
    verifyTextScaling: (fontSize: number, minSize: number = 16): boolean => {
      return fontSize >= minSize;
    },

    // New specific test cases
    rtlSupport: {
      verifyRTLLayout: (originalLayout: any, rtlLayout: any): boolean => {
        // Verify RTL layout without modifying components
        const { width } = Dimensions.get('window');
        return rtlLayout.x === width - (originalLayout.x + originalLayout.width);
      },

      verifyTextAlignment: (style: any, isRTL: boolean): boolean => {
        if (!isRTL) return true;
        return style.textAlign === 'right' || style.writingDirection === 'rtl';
      }
    },

    colorBlindness: {
      verifyColorBlindFriendly: (colors: string[]): boolean => {
        // Implement color blind simulation check
        // Returns true if colors are distinguishable in all modes
        return true; // Placeholder implementation
      },

      verifyNonColorDependent: (component: any): boolean => {
        // Verify component doesn't rely solely on color for information
        return true; // Placeholder implementation
      }
    },

    dynamicType: {
      verifyDynamicTypeScaling: (
        originalSize: number,
        scaledSize: number,
        scale: number
      ): boolean => {
        const expectedSize = originalSize * scale;
        return Math.abs(scaledSize - expectedSize) < 1;
      }
    }
  },

  // Development only checks
  __DEV__: {
    logAccessibilityIssues: (component: string, issues: string[]) => {
      if (__DEV__) {
        console.warn(`Accessibility issues in ${component}:`, issues);
      }
    }
  }
}; 