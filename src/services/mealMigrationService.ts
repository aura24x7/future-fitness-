import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, firestore } from '@react-native-firebase/firestore';
import { collection, doc, writeBatch, getDocs, query, where, Timestamp } from '@react-native-firebase/firestore';
import { mealStorageService } from './mealStorageService';
import { analyticsService } from './analyticsService';
import { MealDocument } from '../types/meal';

const MIGRATION_KEYS = {
  MIGRATION_STATUS: '@meal_migration_status',
  LAST_MIGRATED_ID: '@meal_last_migrated_id',
  MIGRATION_PROGRESS: '@meal_migration_progress',
};

export enum MigrationStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

interface MigrationProgress {
  status: MigrationStatus;
  totalRecords: number;
  migratedRecords: number;
  lastMigratedId: string | null;
  errors: string[];
  startTime: string | null;
  endTime: string | null;
}

class MealMigrationService {
  private static instance: MealMigrationService;
  private batchSize = 50; // Number of records to migrate in each batch

  private constructor() {}

  static getInstance(): MealMigrationService {
    if (!MealMigrationService.instance) {
      MealMigrationService.instance = new MealMigrationService();
    }
    return MealMigrationService.instance;
  }

  async initiateMigration(): Promise<void> {
    const currentStatus = await this.getMigrationStatus();
    if (currentStatus === MigrationStatus.IN_PROGRESS) {
      throw new Error('Migration already in progress');
    }

    await this.setMigrationProgress({
      status: MigrationStatus.IN_PROGRESS,
      totalRecords: 0,
      migratedRecords: 0,
      lastMigratedId: null,
      errors: [],
      startTime: new Date().toISOString(),
      endTime: null,
    });

    try {
      // Start parallel write mode
      await this.enableParallelWrite();
      
      // Begin migration in background
      this.migrateData();
    } catch (error) {
      console.error('Failed to initiate migration:', error);
      await this.setMigrationStatus(MigrationStatus.FAILED);
      throw error;
    }
  }

  private async migrateData(): Promise<void> {
    try {
      const user = auth().currentUser;
      if (!user) throw new Error('User must be authenticated');

      // Get total count of records
      const totalRecords = await this.getTotalRecordCount();
      let progress = await this.getMigrationProgress();
      progress.totalRecords = totalRecords;
      await this.setMigrationProgress(progress);

      // Migrate in batches
      while (progress.migratedRecords < totalRecords) {
        const batch = await this.getNextBatch(progress.lastMigratedId);
        if (batch.length === 0) break;

        await this.migrateBatch(batch);
        
        progress.migratedRecords += batch.length;
        progress.lastMigratedId = batch[batch.length - 1].id;
        await this.setMigrationProgress(progress);

        // Report progress
        await analyticsService.logStorageUsage({
          totalDocuments: progress.migratedRecords,
          totalSize: 0, // Calculate if needed
          collectionName: 'meals',
        });
      }

      // Complete migration
      await this.completeMigration();
    } catch (error) {
      console.error('Migration failed:', error);
      await this.setMigrationStatus(MigrationStatus.FAILED);
      throw error;
    }
  }

  private async getNextBatch(lastId: string | null): Promise<MealDocument[]> {
    const user = auth().currentUser;
    if (!user) throw new Error('User must be authenticated');

    const mealsRef = collection(firestore(), 'meals');
    let q = query(
      mealsRef,
      where('userId', '==', user.uid)
    );

    if (lastId) {
      q = query(q, where('id', '>', lastId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs
      .slice(0, this.batchSize)
      .map(doc => ({ ...doc.data(), id: doc.id } as MealDocument));
  }

  private async migrateBatch(meals: MealDocument[]): Promise<void> {
    const batch = writeBatch(firestore());

    for (const meal of meals) {
      try {
        // Write to new storage
        await mealStorageService.addMeal({
          ...meal,
          timestamp: Timestamp.fromDate(new Date(meal.timestamp)),
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date()),
        });
      } catch (error) {
        console.error(`Failed to migrate meal ${meal.id}:`, error);
        const progress = await this.getMigrationProgress();
        progress.errors.push(`Failed to migrate meal ${meal.id}: ${error.message}`);
        await this.setMigrationProgress(progress);
      }
    }

    await batch.commit();
  }

  private async completeMigration(): Promise<void> {
    const progress = await this.getMigrationProgress();
    progress.status = MigrationStatus.COMPLETED;
    progress.endTime = new Date().toISOString();
    await this.setMigrationProgress(progress);

    // Disable parallel write mode
    await this.disableParallelWrite();
  }

  private async enableParallelWrite(): Promise<void> {
    await AsyncStorage.setItem('PARALLEL_WRITE_ENABLED', 'true');
  }

  private async disableParallelWrite(): Promise<void> {
    await AsyncStorage.setItem('PARALLEL_WRITE_ENABLED', 'false');
  }

  async getMigrationStatus(): Promise<MigrationStatus> {
    const status = await AsyncStorage.getItem(MIGRATION_KEYS.MIGRATION_STATUS);
    return (status as MigrationStatus) || MigrationStatus.NOT_STARTED;
  }

  private async setMigrationStatus(status: MigrationStatus): Promise<void> {
    await AsyncStorage.setItem(MIGRATION_KEYS.MIGRATION_STATUS, status);
  }

  private async getMigrationProgress(): Promise<MigrationProgress> {
    const progress = await AsyncStorage.getItem(MIGRATION_KEYS.MIGRATION_PROGRESS);
    return progress ? JSON.parse(progress) : {
      status: MigrationStatus.NOT_STARTED,
      totalRecords: 0,
      migratedRecords: 0,
      lastMigratedId: null,
      errors: [],
      startTime: null,
      endTime: null,
    };
  }

  private async setMigrationProgress(progress: MigrationProgress): Promise<void> {
    await AsyncStorage.setItem(MIGRATION_KEYS.MIGRATION_PROGRESS, JSON.stringify(progress));
  }

  private async getTotalRecordCount(): Promise<number> {
    const user = auth().currentUser;
    if (!user) throw new Error('User must be authenticated');

    const mealsRef = collection(firestore(), 'meals');
    const q = query(mealsRef, where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  async cleanupOldData(): Promise<void> {
    const status = await this.getMigrationStatus();
    if (status !== MigrationStatus.COMPLETED) {
      throw new Error('Cannot cleanup before migration is completed');
    }

    const user = auth().currentUser;
    if (!user) throw new Error('User must be authenticated');

    // Clean up old data in batches
    const batch = writeBatch(firestore());
    const oldMealsRef = collection(firestore(), 'meals');
    const snapshot = await getDocs(query(oldMealsRef, where('userId', '==', user.uid)));

    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }
}

export const mealMigrationService = MealMigrationService.getInstance(); 