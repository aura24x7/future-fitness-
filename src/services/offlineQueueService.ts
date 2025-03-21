import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { SyncOptions } from '../types/sync';

interface QueuedOperation {
  id: string;
  collection: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
  retryCount: number;
  priority: 'high' | 'normal' | 'low';
}

export class OfflineQueueService {
  private static instance: OfflineQueueService;
  private isProcessing: boolean = false;
  private networkListener: any;
  private readonly QUEUE_STORAGE_KEY = '@offline_queue';
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  private constructor() {
    this.setupNetworkListener();
  }

  public static getInstance(): OfflineQueueService {
    if (!OfflineQueueService.instance) {
      OfflineQueueService.instance = new OfflineQueueService();
    }
    return OfflineQueueService.instance;
  }

  private setupNetworkListener(): void {
    this.networkListener = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        this.processQueue();
      }
    });
  }

  public async enqueueOperation(
    operation: Omit<QueuedOperation, 'timestamp' | 'retryCount'>
  ): Promise<void> {
    const queue = await this.getQueue();
    const queuedOp: QueuedOperation = {
      ...operation,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    queue.push(queuedOp);
    await this.saveQueue(queue);

    // Try to process immediately if online
    const networkState = await NetInfo.fetch();
    if (networkState.isConnected) {
      this.processQueue();
    }
  }

  private async getQueue(): Promise<QueuedOperation[]> {
    try {
      const queueData = await AsyncStorage.getItem(this.QUEUE_STORAGE_KEY);
      return queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error('[OfflineQueue] Error reading queue:', error);
      return [];
    }
  }

  private async saveQueue(queue: QueuedOperation[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('[OfflineQueue] Error saving queue:', error);
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;

    try {
      this.isProcessing = true;
      const queue = await this.getQueue();
      if (!queue.length) return;

      // Sort by priority and timestamp
      queue.sort((a, b) => {
        const priorityOrder = { high: 0, normal: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });

      const remainingOps: QueuedOperation[] = [];
      for (const op of queue) {
        try {
          await this.processOperation(op);
        } catch (error) {
          if (op.retryCount < this.MAX_RETRIES) {
            remainingOps.push({
              ...op,
              retryCount: op.retryCount + 1
            });
          } else {
            console.error(`[OfflineQueue] Operation failed after ${this.MAX_RETRIES} retries:`, op);
          }
        }
      }

      await this.saveQueue(remainingOps);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processOperation(operation: QueuedOperation): Promise<void> {
    const syncOptions: SyncOptions = {
      immediate: true,
      priority: operation.priority
    };

    switch (operation.operation) {
      case 'create':
        await this.handleCreate(operation, syncOptions);
        break;
      case 'update':
        await this.handleUpdate(operation, syncOptions);
        break;
      case 'delete':
        await this.handleDelete(operation, syncOptions);
        break;
    }
  }

  private async handleCreate(operation: QueuedOperation, syncOptions: SyncOptions): Promise<void> {
    // Implementation will be added when integrating with MealStorageService
    console.log('[OfflineQueue] Processing create operation:', operation.id);
  }

  private async handleUpdate(operation: QueuedOperation, syncOptions: SyncOptions): Promise<void> {
    // Implementation will be added when integrating with MealStorageService
    console.log('[OfflineQueue] Processing update operation:', operation.id);
  }

  private async handleDelete(operation: QueuedOperation, syncOptions: SyncOptions): Promise<void> {
    // Implementation will be added when integrating with MealStorageService
    console.log('[OfflineQueue] Processing delete operation:', operation.id);
  }

  public cleanup(): void {
    if (this.networkListener) {
      this.networkListener();
    }
  }
}

export default OfflineQueueService.getInstance(); 