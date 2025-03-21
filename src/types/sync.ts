export interface SyncStatus {
  lastSync: string | null;
  pendingOperations: number;
}

export interface SyncOperation {
  id: string;
  timestamp: Date;
  data: SyncableData;
  operation: 'create' | 'update' | 'delete';
  retryCount: number;
}

export interface SyncableData {
  collection: string;
  id: string;
  [key: string]: any;
}

export interface SyncError {
  code: string;
  message: string;
  operation?: SyncOperation;
}

export interface SyncConfig {
  syncInterval: number; // milliseconds
  maxRetries: number;
  cleanupThreshold: number; // days
}

export interface SyncOptions {
  immediate?: boolean;
  priority?: 'high' | 'normal' | 'low';
  retryCount?: number;
  timeout?: number;
}

export const DEFAULT_SYNC_CONFIG: SyncConfig = {
  syncInterval: 5 * 60 * 1000, // 5 minutes
  maxRetries: 3,
  cleanupThreshold: 30, // 30 days
}; 