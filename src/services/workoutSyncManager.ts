import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  SharedWorkoutPlan,
  DailyWorkout,
  SyncOptions,
  SyncResult,
  SyncStatus
} from '../types/workoutSharing';
import { format, addDays, parseISO } from 'date-fns';

const STORAGE_KEYS = {
  USER_WORKOUTS: '@user_workouts',
  SYNC_STATUS: '@workout_sync_status',
};

interface UserWorkoutSchedule {
  [date: string]: DailyWorkout;
}

class WorkoutSyncManager {
  // Get user's existing workout schedule
  private async getUserSchedule(): Promise<UserWorkoutSchedule> {
    try {
      const scheduleJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_WORKOUTS);
      return scheduleJson ? JSON.parse(scheduleJson) : {};
    } catch (error) {
      console.error('Error getting user schedule:', error);
      return {};
    }
  }

  // Save updated schedule
  private async saveUserSchedule(schedule: UserWorkoutSchedule): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_WORKOUTS, JSON.stringify(schedule));
    } catch (error) {
      console.error('Error saving user schedule:', error);
      throw new Error('Failed to save workout schedule');
    }
  }

  // Check for conflicts in the schedule
  private async findConflicts(
    startDate: Date,
    plan: SharedWorkoutPlan,
    existingSchedule: UserWorkoutSchedule
  ): Promise<Array<{ date: string; existingWorkout: DailyWorkout; newWorkout: DailyWorkout }>> {
    const conflicts = [];
    const planDays = Object.keys(plan.schedule).length;

    for (let i = 0; i < planDays; i++) {
      const currentDate = format(addDays(startDate, i), 'yyyy-MM-dd');
      const dayOfWeek = (i % 7).toString();
      
      if (existingSchedule[currentDate] && plan.schedule[dayOfWeek]) {
        conflicts.push({
          date: currentDate,
          existingWorkout: existingSchedule[currentDate],
          newWorkout: plan.schedule[dayOfWeek],
        });
      }
    }

    return conflicts;
  }

  // Prepare sync plan
  async prepareSync(
    plan: SharedWorkoutPlan,
    startDate: Date
  ): Promise<{ conflicts: Array<{ date: string; existingWorkout: DailyWorkout; newWorkout: DailyWorkout }> }> {
    const existingSchedule = await this.getUserSchedule();
    const conflicts = await this.findConflicts(startDate, plan, existingSchedule);
    
    return { conflicts };
  }

  // Execute sync with options
  async executeSync(
    plan: SharedWorkoutPlan,
    options: SyncOptions
  ): Promise<SyncResult> {
    try {
      const existingSchedule = await this.getUserSchedule();
      const startDate = options.startDate;
      const conflicts = await this.findConflicts(startDate, plan, existingSchedule);

      // If there are conflicts and we're not skipping them
      if (conflicts.length > 0 && !options.skipConflicts && !options.replaceExisting) {
        return {
          status: 'conflict',
          conflicts,
          syncedDates: [],
          errorMessage: 'Conflicts found in schedule',
        };
      }

      const updatedSchedule = { ...existingSchedule };
      const syncedDates: string[] = [];
      const planDays = Object.keys(plan.schedule).length;

      // Sync workouts
      for (let i = 0; i < planDays; i++) {
        const currentDate = format(addDays(startDate, i), 'yyyy-MM-dd');
        const dayOfWeek = (i % 7).toString();
        
        if (plan.schedule[dayOfWeek]) {
          // Skip if there's a conflict and we're not replacing
          if (existingSchedule[currentDate] && !options.replaceExisting && !options.skipConflicts) {
            continue;
          }

          updatedSchedule[currentDate] = {
            ...plan.schedule[dayOfWeek],
            // Add any modifications if allowed
            ...(options.modifyPlan ? { modified: true } : {}),
          };
          syncedDates.push(currentDate);
        }
      }

      // Save the updated schedule
      await this.saveUserSchedule(updatedSchedule);

      // Save sync status
      await this.saveSyncStatus(plan.id, {
        lastSync: new Date().toISOString(),
        syncedDates,
        status: 'synced',
      });

      return {
        status: 'synced',
        syncedDates,
      };
    } catch (error) {
      console.error('Sync error:', error);
      return {
        status: 'failed',
        syncedDates: [],
        errorMessage: error instanceof Error ? error.message : 'Unknown error during sync',
      };
    }
  }

  // Get sync status for a plan
  async getSyncStatus(planId: string): Promise<{
    lastSync: string;
    syncedDates: string[];
    status: SyncStatus;
  } | null> {
    try {
      const statusJson = await AsyncStorage.getItem(`${STORAGE_KEYS.SYNC_STATUS}_${planId}`);
      return statusJson ? JSON.parse(statusJson) : null;
    } catch (error) {
      console.error('Error getting sync status:', error);
      return null;
    }
  }

  // Save sync status
  private async saveSyncStatus(
    planId: string,
    status: {
      lastSync: string;
      syncedDates: string[];
      status: SyncStatus;
    }
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.SYNC_STATUS}_${planId}`,
        JSON.stringify(status)
      );
    } catch (error) {
      console.error('Error saving sync status:', error);
      throw new Error('Failed to save sync status');
    }
  }

  // Remove synced workouts
  async removeSyncedWorkouts(planId: string): Promise<void> {
    try {
      const status = await this.getSyncStatus(planId);
      if (!status) return;

      const schedule = await this.getUserSchedule();
      const updatedSchedule = { ...schedule };

      // Remove workouts for synced dates
      status.syncedDates.forEach(date => {
        delete updatedSchedule[date];
      });

      await this.saveUserSchedule(updatedSchedule);
      await AsyncStorage.removeItem(`${STORAGE_KEYS.SYNC_STATUS}_${planId}`);
    } catch (error) {
      console.error('Error removing synced workouts:', error);
      throw new Error('Failed to remove synced workouts');
    }
  }
}

export const workoutSyncManager = new WorkoutSyncManager();
