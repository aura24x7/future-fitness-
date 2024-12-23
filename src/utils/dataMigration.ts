import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';
import { waterService } from '../services/waterService';
import { workoutService } from '../services/workoutService';
import { logger } from './logger';
import NetInfo from '@react-native-community/netinfo';

const MIGRATION_VERSION = '1.0.0';
const MIGRATION_KEY = '@app_migration_version';
const MIGRATION_ATTEMPTS_KEY = '@app_migration_attempts';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 5000; // 5 seconds

const LEGACY_KEYS = {
  WATER: '@water_tracking',
  WORKOUTS: '@workout_logs',
};

interface MigrationResult {
  success: boolean;
  error?: string;
  migrated: boolean;
  phase?: 'backup' | 'water' | 'workout' | 'complete' | 'error';
  progress?: number;
  message?: string;
}

type MigrationCallback = (status: MigrationResult) => void;

class DataMigrationService {
  private static instance: DataMigrationService;
  private isRunning: boolean = false;
  private statusCallback?: MigrationCallback;

  private constructor() {}

  static getInstance(): DataMigrationService {
    if (!DataMigrationService.instance) {
      DataMigrationService.instance = new DataMigrationService();
    }
    return DataMigrationService.instance;
  }

  setStatusCallback(callback: MigrationCallback) {
    this.statusCallback = callback;
  }

  private updateStatus(status: MigrationResult) {
    this.statusCallback?.(status);
  }

  private async checkNetwork(): Promise<boolean> {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected === true;
  }

  private async waitForNetwork(): Promise<void> {
    let attempts = 0;
    while (!(await this.checkNetwork()) && attempts < 3) {
      logger.warn('Network unavailable, waiting before retry...');
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      attempts++;
    }
    if (attempts >= 3) {
      throw new Error('Network unavailable after multiple attempts');
    }
  }

  private async shouldMigrate(): Promise<boolean> {
    try {
      const version = await AsyncStorage.getItem(MIGRATION_KEY);
      return version !== MIGRATION_VERSION;
    } catch (error) {
      logger.error('Error checking migration version:', error);
      return true;
    }
  }

  private async getAttempts(): Promise<number> {
    try {
      const attempts = await AsyncStorage.getItem(MIGRATION_ATTEMPTS_KEY);
      return attempts ? parseInt(attempts, 10) : 0;
    } catch {
      return 0;
    }
  }

  private async incrementAttempts(): Promise<void> {
    try {
      const attempts = await this.getAttempts();
      await AsyncStorage.setItem(MIGRATION_ATTEMPTS_KEY, (attempts + 1).toString());
    } catch (error) {
      logger.error('Error incrementing attempts:', error);
    }
  }

  private async backupData(): Promise<void> {
    try {
      this.updateStatus({
        success: true,
        migrated: false,
        phase: 'backup',
        progress: 0.2,
        message: 'Creating data backup...'
      });

      const allData = await AsyncStorage.multiGet([
        LEGACY_KEYS.WATER,
        LEGACY_KEYS.WORKOUTS,
      ]);
      
      const backupKey = `@data_backup_${new Date().toISOString()}`;
      await AsyncStorage.setItem(backupKey, JSON.stringify(allData));
      
      logger.info('Data backup created:', { backupKey });
    } catch (error) {
      logger.error('Error backing up data:', error);
      throw new Error('Failed to backup data before migration');
    }
  }

  private async migrateWaterData(userId: string): Promise<void> {
    try {
      this.updateStatus({
        success: true,
        migrated: false,
        phase: 'water',
        progress: 0.4,
        message: 'Migrating water tracking data...'
      });

      const waterData = await AsyncStorage.getItem(LEGACY_KEYS.WATER);
      if (waterData) {
        const parsedData = JSON.parse(waterData);
        let processed = 0;
        const total = Object.keys(parsedData).length;

        for (const [date, amount] of Object.entries(parsedData)) {
          await waterService.migrateWaterData(date, Number(amount));
          processed++;
          this.updateStatus({
            success: true,
            migrated: false,
            phase: 'water',
            progress: 0.4 + (processed / total) * 0.3,
            message: `Migrated ${processed}/${total} water records...`
          });
        }
      }
    } catch (error) {
      logger.error('Error migrating water data:', error);
      throw new Error('Failed to migrate water data');
    }
  }

  private async migrateWorkoutData(userId: string): Promise<void> {
    try {
      this.updateStatus({
        success: true,
        migrated: false,
        phase: 'workout',
        progress: 0.7,
        message: 'Migrating workout data...'
      });

      const workoutData = await AsyncStorage.getItem(LEGACY_KEYS.WORKOUTS);
      if (workoutData) {
        const parsedData = JSON.parse(workoutData);
        let processed = 0;
        const total = parsedData.length;

        for (const workout of parsedData) {
          await workoutService.migrateWorkoutData(workout);
          processed++;
          this.updateStatus({
            success: true,
            migrated: false,
            phase: 'workout',
            progress: 0.7 + (processed / total) * 0.3,
            message: `Migrated ${processed}/${total} workout records...`
          });
        }
      }
    } catch (error) {
      logger.error('Error migrating workout data:', error);
      throw new Error('Failed to migrate workout data');
    }
  }

  async migrateData(): Promise<MigrationResult> {
    if (this.isRunning) {
      return { success: false, error: 'Migration already in progress', migrated: false };
    }

    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated', migrated: false };
    }

    try {
      this.isRunning = true;

      // Check network connectivity
      await this.waitForNetwork();

      if (!await this.shouldMigrate()) {
        return { success: true, migrated: false };
      }

      const attempts = await this.getAttempts();
      if (attempts >= MAX_RETRY_ATTEMPTS) {
        logger.warn('Max migration attempts reached');
        return { 
          success: false, 
          error: 'Maximum migration attempts reached. Please contact support.', 
          migrated: false 
        };
      }

      await this.incrementAttempts();

      // Backup existing data first
      await this.backupData();

      // Migrate data
      await this.migrateWaterData(user.uid);
      await this.migrateWorkoutData(user.uid);

      // Mark migration as complete
      await AsyncStorage.setItem(MIGRATION_KEY, MIGRATION_VERSION);
      await AsyncStorage.removeItem(MIGRATION_ATTEMPTS_KEY);

      this.updateStatus({
        success: true,
        migrated: true,
        phase: 'complete',
        progress: 1,
        message: 'Migration completed successfully!'
      });

      logger.info('Migration completed successfully');
      return { success: true, migrated: true, phase: 'complete', progress: 1 };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during migration';
      logger.error('Migration failed:', { error: errorMessage });
      
      this.updateStatus({
        success: false,
        migrated: false,
        phase: 'error',
        error: errorMessage,
        message: 'Migration failed. Your data is safe and will be migrated later.'
      });

      return {
        success: false,
        error: errorMessage,
        migrated: false,
        phase: 'error'
      };
    } finally {
      this.isRunning = false;
    }
  }
}

export const dataMigrationService = DataMigrationService.getInstance();
