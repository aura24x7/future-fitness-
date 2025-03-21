/**
 * Storage constants for the application
 * Centralized storage key management to prevent duplication and conflicts
 */

export const STORAGE_VERSION = '1.0.0';

export const STORAGE_KEYS = {
  NUTRITION: {
    // Main keys
    GOALS: '@future_fitness/nutrition/goals',
    DAILY_TOTALS: '@future_fitness/nutrition/daily_totals',
    VERSION: '@future_fitness/nutrition/version',
    
    // Backup and migration
    BACKUP: '@future_fitness/nutrition/backup',
    MIGRATION_STATUS: '@future_fitness/nutrition/migration_status',
    
    // Legacy keys (for migration)
    LEGACY: {
      CALORIE_DATA: '@calorie_data',
      CALORIE_TOTALS: '@calorie_totals',
      NUTRITION_GOALS: '@nutrition_goals',
      MEAL_DATA: '@meals'
    }
  },

  // Version control
  APP: {
    VERSION: '@future_fitness/app/version',
    LAST_UPDATE: '@future_fitness/app/last_update'
  }
} as const;

/**
 * Storage structure versions
 * Used to manage data migrations and backwards compatibility
 */
export const STORAGE_STRUCTURES = {
  NUTRITION: {
    V1: {
      version: '1.0.0',
      goals: {
        dailyCalories: 0,
        macros: {
          protein: { value: 0, unit: 'g' },
          carbs: { value: 0, unit: 'g' },
          fat: { value: 0, unit: 'g' }
        }
      },
      dailyTotals: {}
    }
  }
} as const;

/**
 * Type definitions for storage structures
 */
export interface StorageStructureV1 {
  version: string;
  goals: {
    dailyCalories: number;
    macros: {
      protein: { value: number; unit: string; };
      carbs: { value: number; unit: string; };
      fat: { value: number; unit: string; };
    };
  };
  dailyTotals: {
    [date: string]: {
      calories: number;
      macros: {
        protein: number;
        carbs: number;
        fat: number;
      };
    };
  };
}

/**
 * Utility type to ensure storage key type safety
 */
export type StorageKey = typeof STORAGE_KEYS;

// Storage keys for AsyncStorage
export const ONBOARDING_STORAGE_KEY = '@aifit_onboarding_data';
export const ONBOARDING_COMPLETE_KEY = '@aifit_onboarding_complete';
export const AUTH_PERSISTENCE_KEY = '@auth_persistence';
export const AUTH_CREDENTIALS_KEY = '@auth_credentials'; 