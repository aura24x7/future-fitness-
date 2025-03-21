import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { syncService } from './syncService';
import { isConnected } from '../utils/networkUtils';

const BACKGROUND_SYNC_TASK = 'BACKGROUND_SYNC_TASK';
const SYNC_INTERVAL = 15; // minutes

class BackgroundSyncService {
  private static instance: BackgroundSyncService;

  private constructor() {}

  static getInstance(): BackgroundSyncService {
    if (!BackgroundSyncService.instance) {
      BackgroundSyncService.instance = new BackgroundSyncService();
    }
    return BackgroundSyncService.instance;
  }

  async registerBackgroundSync(): Promise<void> {
    try {
      TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
        const isNetworkAvailable = await isConnected();
        if (!isNetworkAvailable) {
          return BackgroundFetch.BackgroundFetchResult.NoData;
        }

        try {
          await syncService.syncPendingOperations();
          return BackgroundFetch.BackgroundFetchResult.NewData;
        } catch (error) {
          console.error('Background sync failed:', error);
          return BackgroundFetch.BackgroundFetchResult.Failed;
        }
      });

      await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
        minimumInterval: SYNC_INTERVAL * 60, // Convert to seconds
        stopOnTerminate: false,
        startOnBoot: true,
      });
    } catch (error) {
      console.error('Failed to register background sync:', error);
    }
  }

  async unregisterBackgroundSync(): Promise<void> {
    try {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
    } catch (error) {
      console.error('Failed to unregister background sync:', error);
    }
  }
}

export const backgroundSyncService = BackgroundSyncService.getInstance(); 