import { RolloutUtils } from './rolloutUtils';
import { MonitoringUtils } from './monitoringUtils';

export const DeploymentTracker = {
  // Track deployment progress without affecting app
  phases: {
    async getCurrentPhase(): Promise<string> {
      const status = await RolloutUtils.rolloutStatus.getStatus();
      return status.phase;
    },

    // Development only phase update
    async updatePhase(phase: string): Promise<void> {
      if (__DEV__) {
        await RolloutUtils.rolloutStatus.updateStatus({
          phase,
          percentage: 0
        });
      }
    }
  },

  // Monitor deployment metrics
  metrics: {
    async captureMetrics(): Promise<{
      performance: any;
      accessibility: any;
      errors: string[];
    }> {
      const performance = await RolloutUtils.performanceMetrics.captureMetrics();
      const accessibility = await RolloutUtils.accessibilityMetrics.verifyCompliance();
      const errors = MonitoringUtils.errorTracking.getReport();

      return {
        performance,
        accessibility,
        errors
      };
    }
  }
}; 