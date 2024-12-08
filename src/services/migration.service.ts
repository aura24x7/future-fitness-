import AsyncStorage from '@react-native-async-storage/async-storage';
import { firestoreService } from './firestore.service';
import { OnboardingData } from '../hooks/useOnboarding';

const MIGRATION_VERSION_KEY = '@migration_version';
const CURRENT_MIGRATION_VERSION = '1.0.0';

interface MigrationResult {
  success: boolean;
  error?: string;
  migrated: boolean;
}

class MigrationService {
  async shouldMigrate(): Promise<boolean> {
    try {
      const version = await AsyncStorage.getItem(MIGRATION_VERSION_KEY);
      return version !== CURRENT_MIGRATION_VERSION;
    } catch {
      return true;
    }
  }

  async migrateUserData(userId: string): Promise<MigrationResult> {
    try {
      // Check if migration is needed
      if (!await this.shouldMigrate()) {
        return { success: true, migrated: false };
      }

      // 1. Backup existing data
      const backupData = await this.backupExistingData(userId);
      
      // 2. Get all local storage keys
      const allKeys = await AsyncStorage.getAllKeys();
      
      // 3. Migrate onboarding data
      if (allKeys.includes('@onboarding_data')) {
        const onboardingData = await AsyncStorage.getItem('@onboarding_data');
        if (onboardingData) {
          const parsedData = JSON.parse(onboardingData) as OnboardingData;
          await firestoreService.updateOnboardingData(userId, {
            ...parsedData,
            migrated: true,
            migrationDate: new Date().toISOString()
          });
        }
      }

      // 4. Update migration version
      await AsyncStorage.setItem(MIGRATION_VERSION_KEY, CURRENT_MIGRATION_VERSION);

      return { success: true, migrated: true };
    } catch (error) {
      console.error('Migration failed:', error);
      
      // Attempt rollback if backup exists
      try {
        await this.rollbackMigration(userId);
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during migration',
        migrated: false
      };
    }
  }

  private async backupExistingData(userId: string): Promise<void> {
    try {
      // 1. Backup Firestore data
      const userData = await firestoreService.getUserData(userId);
      if (userData) {
        await AsyncStorage.setItem(
          '@data_backup',
          JSON.stringify({
            timestamp: new Date().toISOString(),
            data: userData
          })
        );
      }

      // 2. Backup all AsyncStorage data
      const allKeys = await AsyncStorage.getAllKeys();
      const allData = await AsyncStorage.multiGet(allKeys);
      await AsyncStorage.setItem(
        '@storage_backup',
        JSON.stringify({
          timestamp: new Date().toISOString(),
          data: allData
        })
      );
    } catch (error) {
      console.error('Backup failed:', error);
      throw new Error('Failed to create backup before migration');
    }
  }

  private async rollbackMigration(userId: string): Promise<void> {
    try {
      // 1. Restore Firestore data
      const backupData = await AsyncStorage.getItem('@data_backup');
      if (backupData) {
        const { data } = JSON.parse(backupData);
        if (data.onboarding) {
          await firestoreService.updateOnboardingData(userId, data.onboarding);
        }
      }

      // 2. Restore AsyncStorage data
      const storageBackup = await AsyncStorage.getItem('@storage_backup');
      if (storageBackup) {
        const { data } = JSON.parse(storageBackup);
        await AsyncStorage.multiSet(data);
      }

      // 3. Clear backup data
      await AsyncStorage.multiRemove(['@data_backup', '@storage_backup']);
    } catch (error) {
      console.error('Rollback failed:', error);
      throw new Error('Failed to rollback migration');
    }
  }

  async clearBackups(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['@data_backup', '@storage_backup']);
    } catch (error) {
      console.error('Failed to clear backups:', error);
    }
  }
}

export const migrationService = new MigrationService();
