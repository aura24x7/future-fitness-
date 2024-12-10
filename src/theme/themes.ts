import { createTheme } from '@tamagui/core'
import { tokens } from './tokens'

// Light theme
export const lightTheme = createTheme({
  background: tokens.color.background,
  backgroundHover: tokens.color.backgroundHover,
  backgroundPress: tokens.color.backgroundPress,
  
  color: tokens.color.text,
  colorHover: tokens.color.textHover,
  colorMuted: tokens.color.textMuted,
  
  borderColor: tokens.color.border,
  borderColorHover: tokens.color.borderHover,
  borderColorFocus: tokens.color.borderFocus,
  
  shadowColor: tokens.color.black,
  shadowColorHover: tokens.color.black,
  
  // Custom colors (maintaining existing palette)
  primary: tokens.color.primary,
  primaryHover: tokens.color.primaryHover,
  primaryPress: tokens.color.primaryPress,
  
  error: tokens.color.error,
  errorLight: tokens.color.errorLight,
  errorDark: tokens.color.errorDark,
  
  success: tokens.color.success,
  successLight: tokens.color.successLight,
  successDark: tokens.color.successDark,
  
  card: tokens.color.card,
  cardHover: tokens.color.cardHover,
  cardPress: tokens.color.cardPress,
  
  // Component-specific colors
  headerBackground: tokens.color.headerBackground,
  tabBarBackground: tokens.color.tabBarBackground,
  exerciseCard: tokens.color.exerciseCard,
  exerciseCardCompleted: tokens.color.exerciseCardCompleted,
  exerciseCardBorder: tokens.color.exerciseCardBorder,
  gradientStart: tokens.color.gradientStart,
  gradientEnd: tokens.color.gradientEnd,
})

// Dark theme
export const darkTheme = createTheme({
  background: tokens.color.gray700,
  backgroundHover: tokens.color.gray600,
  backgroundPress: tokens.color.gray500,
  
  color: tokens.color.white,
  colorHover: tokens.color.gray300,
  colorMuted: tokens.color.gray400,
  
  borderColor: tokens.color.gray500,
  borderColorHover: tokens.color.gray400,
  borderColorFocus: tokens.color.primary,
  
  shadowColor: tokens.color.black,
  shadowColorHover: tokens.color.black,
  
  // Custom colors (maintaining existing palette)
  primary: tokens.color.primary,
  primaryHover: tokens.color.primaryHover,
  primaryPress: tokens.color.primaryPress,
  
  error: tokens.color.error,
  errorLight: tokens.color.errorLight,
  errorDark: tokens.color.errorDark,
  
  success: tokens.color.success,
  successLight: tokens.color.successDark, // Reversed for dark theme
  successDark: tokens.color.successLight,
  
  card: tokens.color.gray600,
  cardHover: tokens.color.gray500,
  cardPress: tokens.color.gray400,
  
  // Component-specific colors
  headerBackground: tokens.color.gray600,
  tabBarBackground: tokens.color.gray600,
  exerciseCard: tokens.color.gray600,
  exerciseCardCompleted: '#132713', // Preserved original dark theme color
  exerciseCardBorder: tokens.color.primary,
  gradientStart: tokens.color.primary,
  gradientEnd: tokens.color.primaryPress,
})
