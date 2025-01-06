import { Platform } from 'react-native';

export const typography = {
  fonts: {
    primary: Platform.select({
      ios: 'SF Pro Display',
      android: 'Inter',
      default: 'Inter',
    }),
    body: Platform.select({
      ios: '-apple-system',
      android: 'Roboto',
      default: 'Inter',
    }),
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export type Typography = typeof typography; 