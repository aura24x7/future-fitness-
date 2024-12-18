import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useSimpleFoodLog } from '../contexts/SimpleFoodLogContext';
import { useTheme } from '../theme/ThemeProvider';
import { RemovedItem, BatchRemovedItems, simpleFoodLogService } from '../services/simpleFoodLogService';

interface UndoHistoryViewerProps {
  isVisible: boolean;
  onClose: () => void;
}

const UndoHistoryViewer: React.FC<UndoHistoryViewerProps> = ({
  isVisible,
  onClose,
}) => {
  const { undoRemove, undoBatchRemove } = useSimpleFoodLog();
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { colors, isDarkMode } = useTheme();

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await simpleFoodLogService.getUndoHistory();
      setHistory(result);
    } catch (err) {
      setError('Failed to load undo history');
      console.error('Error loading undo history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      loadHistory();
    }
  }, [isVisible]);

  const handleUndo = async (item: any) => {
    try {
      setError(null);
      if (item.type === 'single') {
        await undoRemove(item.data as RemovedItem);
      } else {
        await undoBatchRemove(item.data as BatchRemovedItems);
      }
      await loadHistory(); // Refresh history after undo
    } catch (err) {
      setError('Failed to undo item');
      console.error('Error undoing item:', err);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isSingle = item.type === 'single';
    const title = isSingle
      ? (item.data as RemovedItem).name
      : `Batch Remove (${(item.data as BatchRemovedItems).items.length} items)`;

    return (
      <View style={[styles.itemContainer, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.itemContent}>
          <Text style={[styles.itemTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.itemTime, { color: colors.textSecondary }]}>
            {new Date(item.data.removedAt).toLocaleTimeString()}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.undoButton, { backgroundColor: colors.primary }]}
          onPress={() => handleUndo(item)}
        >
          <Text style={styles.undoButtonText}>Undo</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.modalBackground }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Undo History</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, { color: colors.primary }]}>Close</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : error ? (
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        ) : history.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No undo history available
          </Text>
        ) : (
          <FlatList
            data={history}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemTime: {
    fontSize: 14,
  },
  undoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  undoButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    padding: 16,
  },
});

export default UndoHistoryViewer; 