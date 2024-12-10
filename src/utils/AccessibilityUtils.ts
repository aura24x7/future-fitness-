import { AccessibilityInfo, Platform } from 'react-native'

export const getAccessibilityConfig = (isDark: boolean) => ({
  screenReaderConfig: {
    announceTheme: () => {
      const message = `Theme changed to ${isDark ? 'dark' : 'light'} mode`
      AccessibilityInfo.announceForAccessibility(message)
    },
  },
  contrastRatio: {
    minimum: 4.5,
    enhanced: 7,
  },
  focusIndicator: {
    color: isDark ? '#A78BFA' : '#7C3AED',
    width: 2,
  }
})

export const useAccessibleFocus = (ref: any) => {
  const setFocus = () => {
    if (Platform.OS === 'ios') {
      AccessibilityInfo.setAccessibilityFocus(ref.current)
    }
  }
  return setFocus
} 