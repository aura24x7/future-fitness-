import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FeatureFlag {
  defaultValue: boolean;
  description: string;
  rolloutPercentage: number;
}

export interface FeatureFlags {
  useAdvancedOnboarding: FeatureFlag;
  enableAnimations: FeatureFlag;
  useNewNavigationFlow: FeatureFlag;
  enablePerformanceMonitoring: FeatureFlag;
}

const FEATURE_FLAGS_KEY = '@feature_flags';

export const DEFAULT_FLAGS: FeatureFlags = {
  useAdvancedOnboarding: {
    defaultValue: false,
    description: 'Use new onboarding implementation',
    rolloutPercentage: 0,
  },
  enableAnimations: {
    defaultValue: true,
    description: 'Enable animations in onboarding',
    rolloutPercentage: 100,
  },
  useNewNavigationFlow: {
    defaultValue: false,
    description: 'Use new navigation implementation',
    rolloutPercentage: 0,
  },
  enablePerformanceMonitoring: {
    defaultValue: true,
    description: 'Enable performance monitoring',
    rolloutPercentage: 100,
  },
};

class FeatureFlagService {
  private static instance: FeatureFlagService;
  private flags: FeatureFlags = DEFAULT_FLAGS;
  private userIdentifier: string | null = null;

  private constructor() {}

  static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  async initialize(userIdentifier: string) {
    this.userIdentifier = userIdentifier;
    await this.loadFlags();
  }

  private async loadFlags() {
    try {
      const storedFlags = await AsyncStorage.getItem(FEATURE_FLAGS_KEY);
      if (storedFlags) {
        this.flags = { ...DEFAULT_FLAGS, ...JSON.parse(storedFlags) };
      }
    } catch (error) {
      console.error('Error loading feature flags:', error);
    }
  }

  private async saveFlags() {
    try {
      await AsyncStorage.setItem(FEATURE_FLAGS_KEY, JSON.stringify(this.flags));
    } catch (error) {
      console.error('Error saving feature flags:', error);
    }
  }

  isEnabled(flagName: keyof FeatureFlags): boolean {
    const flag = this.flags[flagName];
    if (!flag) return false;

    // If no user identifier, use default value
    if (!this.userIdentifier) return flag.defaultValue;

    // Use user identifier to determine if user is in rollout
    const hash = this.hashString(this.userIdentifier + flagName);
    const normalizedHash = hash % 100; // Get number between 0-99

    return normalizedHash < flag.rolloutPercentage;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  async setFlag(flagName: keyof FeatureFlags, value: Partial<FeatureFlag>) {
    this.flags[flagName] = { ...this.flags[flagName], ...value };
    await this.saveFlags();
  }

  getFlags(): FeatureFlags {
    return this.flags;
  }
}

export const useFeatureFlag = (flagName: keyof FeatureFlags): boolean => {
  const service = FeatureFlagService.getInstance();
  return service.isEnabled(flagName);
};

export default FeatureFlagService; 