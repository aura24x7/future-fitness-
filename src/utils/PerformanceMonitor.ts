import { InteractionManager } from 'react-native'

class ThemePerformanceMonitor {
  private static instance: ThemePerformanceMonitor
  private transitions: number[] = []
  private readonly targetFrameTime = 16.67 // 60fps target

  static getInstance() {
    if (!this.instance) {
      this.instance = new ThemePerformanceMonitor()
    }
    return this.instance
  }

  startTransition() {
    const start = Date.now()
    return () => {
      const duration = Date.now() - start
      this.transitions.push(duration)
      this.analyzePerformance()
    }
  }

  private analyzePerformance() {
    const average = this.transitions.reduce((a, b) => a + b, 0) / this.transitions.length
    if (average > this.targetFrameTime) {
      console.warn('Theme transition performance warning:', average.toFixed(2) + 'ms')
      this.suggestOptimizations()
    }
  }

  private suggestOptimizations() {
    InteractionManager.runAfterInteractions(() => {
      console.info('Performance optimization tips:', [
        'Use useCallback for event handlers',
        'Memoize complex calculations',
        'Avoid unnecessary re-renders',
        'Use proper keys for lists'
      ])
    })
  }

  clearMetrics() {
    this.transitions = []
  }

  getMetrics() {
    return {
      transitions: [...this.transitions],
      average: this.transitions.reduce((a, b) => a + b, 0) / this.transitions.length,
      count: this.transitions.length
    }
  }
}

export const performanceMonitor = ThemePerformanceMonitor.getInstance() 