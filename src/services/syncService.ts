import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, firestore } from '@react-native-firebase/firestore';
import { collection, doc, setDoc, getDoc, writeBatch, Timestamp, DocumentData, QueryDocumentSnapshot, deleteDoc } from '@react-native-firebase/firestore';
import { SyncStatus, SyncOperation as SyncOperationType, SyncableData, SyncOptions } from '../types/sync';

const SYNC_KEYS = {
  LAST_SYNC: '@last_sync_timestamp',
  PENDING_OPERATIONS: '@pending_sync_operations',
  SYNC_STATUS: '@sync_status',
  SYNC_PROGRESS: '@sync_progress',
};

const CLEANUP_THRESHOLD = 30; // Days to keep detailed logs

interface SyncOperation {
  id: string;
  timestamp: Date;
  data: SyncableData;
  operation: 'create' | 'update' | 'delete';
  retryCount: number;
  priority?: 'high' | 'normal' | 'low';
  offlineCreated?: boolean;
}

interface SyncCompletionStatus {
  lastSync: string;
  pendingOperations: number;
  lastSuccessfulOperation?: {
    id: string;
    timestamp: string;
    operation: 'create' | 'update' | 'delete';
  };
  offlineOperations?: boolean;
}

class SyncService {
  private static instance: SyncService;
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;

  private constructor() {
    this.initializeNetworkListener();
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private async initializeNetworkListener() {
    const netInfo = await import('@react-native-community/netinfo');
    netInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      if (wasOffline && this.isOnline) {
        this.syncPendingOperations();
      }
    });
  }

  async scheduleSync(
    data: SyncableData, 
    operation: 'create' | 'update' | 'delete',
    options: SyncOptions = {}
  ): Promise<void> {
    try {
      const pendingOps = await this.getPendingOperations();
      const syncOp: SyncOperation = {
        id: Date.now().toString(),
        timestamp: new Date(),
        data,
        operation,
        retryCount: 0,
        priority: options.priority || 'normal',
      };

      if (options.immediate) {
        // Perform immediate sync
        await this.performSync(syncOp);
      } else {
        // Add to pending operations
        pendingOps.push(syncOp);
        if (options.priority === 'high') {
          // Sort by priority
          pendingOps.sort((a, b) => {
            const priorityMap = { high: 2, normal: 1, low: 0 };
            return (priorityMap[b.priority || 'normal'] || 0) - (priorityMap[a.priority || 'normal'] || 0);
          });
        }
        await AsyncStorage.setItem(SYNC_KEYS.PENDING_OPERATIONS, JSON.stringify(pendingOps));

        if (this.isOnline && !this.syncInProgress) {
          await this.syncPendingOperations();
        }
      }
    } catch (error) {
      console.error('Error scheduling sync:', error);
      throw new Error('Failed to schedule sync operation');
    }
  }

  private async performSync(syncOp: SyncOperation): Promise<void> {
    try {
      const { collection: collectionName, id, ...data } = syncOp.data;
      const docRef = doc(firestore(), collectionName, id);
      console.log(`[Sync] Starting sync operation for ${collectionName}/${id}`);

      switch (syncOp.operation) {
        case 'create':
        case 'update':
          await setDoc(docRef, {
            ...data,
            updatedAt: Timestamp.fromDate(new Date()),
            syncedAt: Timestamp.fromDate(new Date()),
          }, { merge: true });
          
          // Verify the sync was successful
          const verifyDoc = await getDoc(docRef);
          if (!verifyDoc.exists()) {
            throw new Error('Sync verification failed: Document not found after sync');
          }
          console.log(`[Sync] Successfully synced ${collectionName}/${id}`);
          break;
          
        case 'delete':
          await deleteDoc(docRef);
          // Verify deletion
          const verifyDeletion = await getDoc(docRef);
          if (verifyDeletion.exists()) {
            throw new Error('Sync verification failed: Document still exists after deletion');
          }
          console.log(`[Sync] Successfully deleted ${collectionName}/${id}`);
          break;
      }

      // Update sync completion status
      await this.updateSyncCompletion(syncOp);
    } catch (error) {
      console.error('[Sync] Error during sync operation:', error);
      throw error;
    }
  }

  private async updateSyncCompletion(syncOp: SyncOperation): Promise<void> {
    try {
      const status: SyncCompletionStatus = {
        lastSync: new Date().toISOString(),
        pendingOperations: 0,
        lastSuccessfulOperation: {
          id: syncOp.id,
          timestamp: new Date().toISOString(),
          operation: syncOp.operation,
        },
      };
      await AsyncStorage.setItem(SYNC_KEYS.SYNC_STATUS, JSON.stringify(status));
      console.log(`[Sync] Updated sync completion status for operation ${syncOp.id}`);
    } catch (error) {
      console.error('[Sync] Error updating sync completion status:', error);
    }
  }

  private async handleOfflineOperation(syncOp: SyncOperation): Promise<void> {
    try {
      const pendingOps = await this.getPendingOperations();
      
      // Add offline flag and priority
      syncOp.priority = true; // Prioritize offline operations when back online
      syncOp.offlineCreated = true;
      
      pendingOps.push(syncOp);
      await AsyncStorage.setItem(SYNC_KEYS.PENDING_OPERATIONS, JSON.stringify(pendingOps));
      console.log(`[Sync] Stored offline operation ${syncOp.id} for later sync`);
      
      // Update sync status
      const status: SyncCompletionStatus = {
        lastSync: new Date().toISOString(),
        pendingOperations: pendingOps.length,
        offlineOperations: true,
      };
      await AsyncStorage.setItem(SYNC_KEYS.SYNC_STATUS, JSON.stringify(status));
    } catch (error) {
      console.error('[Sync] Error handling offline operation:', error);
      throw error;
    }
  }

  private async syncPendingOperations(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) return;

    try {
      this.syncInProgress = true;
      const pendingOps = await this.getPendingOperations();
      await this.updateSyncStatus(pendingOps.length);

      const batch = writeBatch(firestore());
      const successfulOps: string[] = [];
      let processedCount = 0;

      for (const op of pendingOps) {
        try {
          const { collection: collectionName, id, ...data } = op.data;
          const docRef = doc(collection(firestore(), collectionName), id);

          switch (op.operation) {
            case 'create':
            case 'update':
              batch.set(docRef, {
                ...data,
                updatedAt: Timestamp.fromDate(new Date()),
                syncedAt: Timestamp.fromDate(new Date()),
              }, { merge: true });
              break;
            case 'delete':
              batch.delete(docRef);
              break;
          }

          successfulOps.push(op.id);
          processedCount++;
          await this.updateSyncStatus(pendingOps.length - processedCount);
        } catch (error) {
          console.error(`Error processing operation ${op.id}:`, error);
          op.retryCount++;
          if (op.retryCount >= 3) {
            successfulOps.push(op.id);
            processedCount++;
            await this.updateSyncStatus(pendingOps.length - processedCount);
          }
        }
      }

      await batch.commit();
      await this.removeSyncedOperations(successfulOps);
      await this.updateLastSyncTimestamp();
      await this.updateSyncStatus(0);
    } catch (error) {
      console.error('Error during sync:', error);
      throw new Error('Sync operation failed');
    } finally {
      this.syncInProgress = false;
    }
  }

  private async getPendingOperations(): Promise<SyncOperation[]> {
    try {
      const ops = await AsyncStorage.getItem(SYNC_KEYS.PENDING_OPERATIONS);
      return ops ? JSON.parse(ops) : [];
    } catch (error) {
      console.error('Error getting pending operations:', error);
      return [];
    }
  }

  private async removeSyncedOperations(operationIds: string[]): Promise<void> {
    try {
      const pendingOps = await this.getPendingOperations();
      const remainingOps = pendingOps.filter(op => !operationIds.includes(op.id));
      await AsyncStorage.setItem(SYNC_KEYS.PENDING_OPERATIONS, JSON.stringify(remainingOps));
    } catch (error) {
      console.error('Error removing synced operations:', error);
    }
  }

  private async updateLastSyncTimestamp(): Promise<void> {
    try {
      await AsyncStorage.setItem(SYNC_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (error) {
      console.error('Error updating last sync timestamp:', error);
    }
  }

  async cleanupOldData(): Promise<void> {
    try {
      const user = auth().currentUser;
      if (!user) return;

      const cleanupDate = new Date();
      cleanupDate.setDate(cleanupDate.getDate() - CLEANUP_THRESHOLD);

      // Keep only summaries for old data
      const collections = ['activity_logs', 'weight_logs', 'meal_logs'];
      const batch = writeBatch(firestore());

      for (const collectionName of collections) {
        const collectionRef = collection(firestore(), collectionName);
        const oldDocs = await this.getOldDocuments(collectionRef, cleanupDate);

        for (const doc of oldDocs) {
          // Archive summary data before deletion if needed
          await this.archiveDocumentSummary(doc);
          batch.delete(doc.ref);
        }
      }

      await batch.commit();
    } catch (error) {
      console.error('Error cleaning up old data:', error);
    }
  }

  private async getOldDocuments(collectionRef: any, cleanupDate: Date): Promise<QueryDocumentSnapshot<DocumentData>[]> {
    // Implementation for getting old documents
    // This will be implemented based on your data structure
    return [];
  }

  private async archiveDocumentSummary(doc: QueryDocumentSnapshot<DocumentData>): Promise<void> {
    // Implementation for archiving document summaries
    // This will be implemented based on your data structure
  }

  async getSyncStatus(): Promise<SyncStatus> {
    try {
      const status = await AsyncStorage.getItem(SYNC_KEYS.SYNC_STATUS);
      return status ? JSON.parse(status) : { lastSync: null, pendingOperations: 0 };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return { lastSync: null, pendingOperations: 0 };
    }
  }

  private async updateSyncStatus(pendingOps: number): Promise<void> {
    try {
      const status: SyncStatus = {
        lastSync: new Date().toISOString(),
        pendingOperations: pendingOps,
      };
      await AsyncStorage.setItem(SYNC_KEYS.SYNC_STATUS, JSON.stringify(status));
    } catch (error) {
      console.error('Error updating sync status:', error);
    }
  }
}

export default SyncService; 