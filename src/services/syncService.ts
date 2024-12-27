import { storageService } from './storageService';
import { userProfileService } from './userProfileService';
import { eventEmitter } from './eventEmitter';
import { NetworkError } from '../utils/errors';
import NetInfo from '@react-native-community/netinfo';

export const SYNC_EVENTS = {
  STARTED: 'sync:started',
  COMPLETED: 'sync:completed',
  ERROR: 'sync:error',
  CONFLICT: 'sync:conflict',
} as const;

class SyncService {
  private static instance: SyncService;
  private isSyncing: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  async initialize(): Promise<void> {
    // Start periodic sync
    this.startPeriodicSync();

    // Listen for network changes
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        this.sync().catch(console.error);
      }
    });
  }

  private startPeriodicSync(interval: number = 5 * 60 * 1000): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.syncInterval = setInterval(() => {
      this.sync().catch(console.error);
    }, interval);
  }

  async sync(): Promise<void> {
    if (this.isSyncing) return;

    try {
      this.isSyncing = true;
      eventEmitter.emit(SYNC_EVENTS.STARTED);

      // Check network connectivity
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected) {
        throw new NetworkError('No network connection available');
      }

      // Get sync queue
      const syncQueue = await storageService.getSyncQueue();
      if (syncQueue.length === 0) {
        return;
      }

      // Process sync queue in order
      for (const item of syncQueue) {
        try {
          switch (item.type) {
            case 'profile':
              await this.syncProfileChange(item);
              break;
            case 'meal':
              await this.syncMealChange(item);
              break;
          }
        } catch (error) {
          if (error instanceof NetworkError) {
            throw error; // Stop sync if network error
          }
          // Log other errors but continue with next item
          console.error(`Error syncing item ${item.id}:`, error);
          eventEmitter.emit(SYNC_EVENTS.ERROR, { item, error });
        }
      }

      // Clear sync queue after successful sync
      await storageService.clearSyncQueue();
      await storageService.updateLastSync();
      eventEmitter.emit(SYNC_EVENTS.COMPLETED);
    } catch (error) {
      console.error('Sync error:', error);
      eventEmitter.emit(SYNC_EVENTS.ERROR, { error });
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncProfileChange(item: any): Promise<void> {
    const { action, data } = item;

    try {
      switch (action) {
        case 'update':
          await userProfileService.updateProfile(data);
          break;
        case 'delete':
          await userProfileService.deleteProfile();
          break;
        default:
          console.warn(`Unknown profile action: ${action}`);
      }
    } catch (error) {
      if (this.isConflictError(error)) {
        await this.handleProfileConflict(item);
      } else {
        throw error;
      }
    }
  }

  private async syncMealChange(item: any): Promise<void> {
    // TODO: Implement meal sync logic when meal service is ready
  }

  private async handleProfileConflict(item: any): Promise<void> {
    const serverProfile = await userProfileService.getProfile();
    const localProfile = await storageService.getProfile();

    if (!serverProfile || !localProfile) {
      throw new Error('Missing data for conflict resolution');
    }

    // Emit conflict event for UI to handle
    eventEmitter.emit(SYNC_EVENTS.CONFLICT, {
      type: 'profile',
      serverData: serverProfile,
      localData: localProfile,
      syncItem: item,
    });
  }

  private isConflictError(error: any): boolean {
    // TODO: Implement proper conflict detection based on backend error responses
    return error.code === 'CONFLICT' || error.message?.includes('conflict');
  }

  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

export const syncService = SyncService.getInstance(); 