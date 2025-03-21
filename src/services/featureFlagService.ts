import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';

export enum FeatureFlag {
  USE_NEW_MEAL_STORAGE = 'use_new_meal_storage',
  PARALLEL_WRITE_ENABLED = 'parallel_write_enabled',
  CLEANUP_OLD_DATA = 'cleanup_old_data',
}

interface FeatureState {
  enabled: boolean;
  rolloutPercentage: number;
  lastUpdated: string;
}

class FeatureFlagService {
  private static instance: FeatureFlagService;
  private flags: Map<FeatureFlag, FeatureState>;
  private readonly storageKey = '@feature_flags';

  private constructor() {
    this.flags = new Map();
    this.loadFlags();
  }

  static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  private async loadFlags(): Promise<void> {
    try {
      const storedFlags = await AsyncStorage.getItem(this.storageKey);
      if (storedFlags) {
        const parsedFlags = JSON.parse(storedFlags);
        this.flags = new Map(
          Object.entries(parsedFlags).map(([key, value]) => [key as FeatureFlag, value as FeatureState])
        );
      } else {
        // Initialize default flags
        this.flags.set(FeatureFlag.USE_NEW_MEAL_STORAGE, {
          enabled: false,
          rolloutPercentage: 0,
          lastUpdated: new Date().toISOString(),
        });
        this.flags.set(FeatureFlag.PARALLEL_WRITE_ENABLED, {
          enabled: false,
          rolloutPercentage: 0,
          lastUpdated: new Date().toISOString(),
        });
        this.flags.set(FeatureFlag.CLEANUP_OLD_DATA, {
          enabled: false,
          rolloutPercentage: 0,
          lastUpdated: new Date().toISOString(),
        });
        await this.saveFlags();
      }
    } catch (error) {
      console.error('Error loading feature flags:', error);
    }
  }

  private async saveFlags(): Promise<void> {
    try {
      const flagsObject = Object.fromEntries(this.flags);
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(flagsObject));
    } catch (error) {
      console.error('Error saving feature flags:', error);
    }
  }

  async isEnabled(flag: FeatureFlag): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) return false;

    const flagState = this.flags.get(flag);
    if (!flagState) return false;

    if (!flagState.enabled) return false;

    // If 100% rollout, return true
    if (flagState.rolloutPercentage >= 100) return true;

    // If 0% rollout, return false
    if (flagState.rolloutPercentage <= 0) return false;

    // Determine if user is in the rollout group
    const userNumber = this.getUserNumber(user.uid);
    return userNumber <= flagState.rolloutPercentage;
  }

  async setFlag(flag: FeatureFlag, state: Partial<FeatureState>): Promise<void> {
    const currentState = this.flags.get(flag) || {
      enabled: false,
      rolloutPercentage: 0,
      lastUpdated: new Date().toISOString(),
    };

    this.flags.set(flag, {
      ...currentState,
      ...state,
      lastUpdated: new Date().toISOString(),
    });

    await this.saveFlags();
  }

  async getFlagState(flag: FeatureFlag): Promise<FeatureState | null> {
    return this.flags.get(flag) || null;
  }

  private getUserNumber(userId: string): number {
    // Generate a number between 0 and 100 based on user ID
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash % 100) + 1;
  }

  // Helper methods for meal storage migration
  async enableNewMealStorage(percentage: number = 100): Promise<void> {
    await this.setFlag(FeatureFlag.USE_NEW_MEAL_STORAGE, {
      enabled: true,
      rolloutPercentage: percentage,
    });
  }

  async enableParallelWrite(percentage: number = 100): Promise<void> {
    await this.setFlag(FeatureFlag.PARALLEL_WRITE_ENABLED, {
      enabled: true,
      rolloutPercentage: percentage,
    });
  }

  async enableCleanup(percentage: number = 100): Promise<void> {
    await this.setFlag(FeatureFlag.CLEANUP_OLD_DATA, {
      enabled: true,
      rolloutPercentage: percentage,
    });
  }

  async disableAllFlags(): Promise<void> {
    for (const flag of Object.values(FeatureFlag)) {
      await this.setFlag(flag, {
        enabled: false,
        rolloutPercentage: 0,
      });
    }
  }
}

export const featureFlagService = FeatureFlagService.getInstance(); 
