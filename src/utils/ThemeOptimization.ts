import { useCallback, useMemo, useRef, useEffect } from 'react'
import { InteractionManager } from 'react-native'
import { performanceMonitor } from './PerformanceMonitor'

export const useThemeTransition = (callback: () => void) => {
  const isTransitioning = useRef(false)

  return useCallback(() => {
    if (isTransitioning.current) return

    isTransitioning.current = true
    const endTransition = performanceMonitor.startTransition()

    InteractionManager.runAfterInteractions(() => {
      try {
        callback()
      } finally {
        endTransition()
        isTransitioning.current = false
      }
    })
  }, [callback])
}

export const useThemedStyle = <T extends object>(
  lightStyle: T,
  darkStyle: T,
  isDark: boolean
) => {
  return useMemo(() => {
    return isDark ? darkStyle : lightStyle
  }, [lightStyle, darkStyle, isDark])
}

export const useThemedMemo = <T>(lightValue: T, darkValue: T, isDark: boolean) => {
  return useMemo(() => {
    return isDark ? darkValue : lightValue
  }, [lightValue, darkValue, isDark])
} 