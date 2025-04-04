import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Text, XStack, Spinner } from 'tamagui';
import { syncService } from '../../services/syncService';
import { SyncStatus } from '../../types/sync';

export const SyncStatusIndicator: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: null,
    pendingOperations: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const updateStatus = async () => {
      try {
        const status = await syncService.getSyncStatus();
        setSyncStatus(status);
      } catch (error) {
        console.error('Error getting sync status:', error);
      }
    };

    // Update status initially and every minute
    updateStatus();
    const interval = setInterval(updateStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  const getLastSyncText = () => {
    if (!syncStatus.lastSync) return 'Never synced';
    const lastSync = new Date(syncStatus.lastSync);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastSync.getTime()) / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return lastSync.toLocaleDateString();
  };

  return (
    <XStack
      space="$2"
      padding="$2"
      alignItems="center"
      opacity={0.8}
    >
      {isLoading && <Spinner size="small" />}
      <Text fontSize={12} color="$gray11">
        {syncStatus.pendingOperations > 0
          ? `Syncing ${syncStatus.pendingOperations} items...`
          : `Last sync: ${getLastSyncText()}`}
      </Text>
    </XStack>
  );
}; 