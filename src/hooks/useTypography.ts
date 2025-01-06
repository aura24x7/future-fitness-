import { useMemo } from 'react';
import { TextStyle } from 'react-native';

interface TypographyOptions {
  size?: number;
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  lineHeight?: number;
  color?: string;
}

export function useTypography() {
  return useMemo(() => ({
    getTextStyle: ({
      size = 16,
      weight = 'normal',
      lineHeight,
      color,
    }: TypographyOptions = {}): TextStyle => {
      const fontFamily = {
        normal: 'Inter',
        medium: 'Inter-Medium',
        semibold: 'Inter-SemiBold',
        bold: 'Inter-Bold',
      }[weight];

      return {
        fontFamily,
        fontSize: size,
        lineHeight: lineHeight || Math.round(size * 1.5),
        color,
      };
    },

    // Heading styles
    heading1: {
      fontFamily: 'Inter-Bold',
      fontSize: 24,
      lineHeight: 32,
    },
    heading2: {
      fontFamily: 'Inter-Bold',
      fontSize: 20,
      lineHeight: 28,
    },
    heading3: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 18,
      lineHeight: 24,
    },

    // Subtitle styles
    subtitle1: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 16,
      lineHeight: 24,
    },
    subtitle2: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
      lineHeight: 20,
    },

    // Body styles
    body1: {
      fontFamily: 'Inter',
      fontSize: 16,
      lineHeight: 24,
    },
    body2: {
      fontFamily: 'Inter',
      fontSize: 14,
      lineHeight: 20,
    },

    // Other styles
    caption: {
      fontFamily: 'Inter',
      fontSize: 12,
      lineHeight: 16,
    },
    overline: {
      fontFamily: 'Inter-Medium',
      fontSize: 10,
      lineHeight: 14,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
  }), []);
} 