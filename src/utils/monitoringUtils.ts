import { InteractionManager, PerformanceObserver } from 'react-native';

export const MonitoringUtils = {
  // Theme switch performance monitoring
  themePerformance: {
    measureSwitchTime: async (callback: () => void): Promise<number> => {
      const start = performance.now();
      await callback();
      await InteractionManager.runAfterInteractions();
      return performance.now() - start;
    },

    trackFrameDrops: (duration: number): number => {
      // Non-intrusive frame drop detection
      return 0; // Implement actual tracking
    }
  },

  // Memory usage monitoring
  memoryUsage: {
    getCurrentUsage: (): number => {
      if (global.performance && performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    },

    trackThemeSwitchImpact: async (callback: () => void): Promise<{
      before: number;
      after: number;
      difference: number;
    }> => {
      const before = MonitoringUtils.memoryUsage.getCurrentUsage();
      await callback();
      const after = MonitoringUtils.memoryUsage.getCurrentUsage();
      
      return {
        before,
        after,
        difference: after - before
      };
    }
  },

  // Error tracking (development only)
  errorTracking: {
    themeErrors: new Set<string>(),
    
    track: (error: Error): void => {
      if (__DEV__) {
        MonitoringUtils.errorTracking.themeErrors.add(error.message);
        console.warn('Theme Error:', error.message);
      }
    },

    getReport: (): string[] => {
      return Array.from(MonitoringUtils.errorTracking.themeErrors);
    }
  }
}; 