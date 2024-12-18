import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import FoodLogItem from './FoodLogItem';
import { useSimpleFoodLog } from '../contexts/SimpleFoodLogContext';
import { RemovedItem } from '../services/simpleFoodLogService';
import UndoHistoryViewer from './UndoHistoryViewer';

interface SimpleFoodLogSectionProps {
  onScanFood?: () => void;
}

const SimpleFoodLogSection: React.FC<SimpleFoodLogSectionProps> = ({
  onScanFood,
}) => {
  const { colors, isDarkMode } = useTheme();
  const {
    items,
    isLoading,
    error,
    removeFoodItem,
    undoRemove,
    isSelectionMode,
    selectedItems,
    toggleSelectionMode,
    removeBatchItems,
    undoBatchRemove,
  } = useSimpleFoodLog();

  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [lastRemovedItem, setLastRemovedItem] = useState<RemovedItem | null>(null);
  const [isUndoing, setIsUndoing] = useState(false);

  const handleRemove = async (id: string) => {
    try {
      // Find the item before removal for undo functionality
      const itemToRemove = items.find(item => item.id === id);
      if (!itemToRemove) return;

      // Remove the item
      const removedItem = await removeFoodItem(id);

      // Store the removed item for potential undo
      setLastRemovedItem(removedItem);

      // Show success message with undo option
      Alert.alert(
        'Item Removed',
        `"${removedItem.name}" has been removed from your food log.`,
        [
          {
            text: 'Undo',
            onPress: async () => {
              try {
                setIsUndoing(true);
                await undoRemove(removedItem);
                setLastRemovedItem(null);
                Alert.alert(
                  'Item Restored',
                  `"${removedItem.name}" has been restored to your food log.`,
                  [{ text: 'OK' }]
                );
              } catch (error) {
                console.error('Error undoing remove:', error);
                Alert.alert(
                  'Error',
                  'Failed to restore the item. Please try again.',
                  [{ text: 'OK' }]
                );
              } finally {
                setIsUndoing(false);
              }
            },
            style: 'default',
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Error removing food item:', error);
      Alert.alert(
        'Error',
        'Failed to remove food item. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleBatchRemove = async () => {
    if (selectedItems.size === 0) return;

    Alert.alert(
      'Remove Selected Items',
      `Are you sure you want to remove ${selectedItems.size} item${selectedItems.size > 1 ? 's' : ''} from your food log?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const batchRemovedItems = await removeBatchItems();
              if (batchRemovedItems) {
                Alert.alert(
                  'Items Removed',
                  `${selectedItems.size} item${selectedItems.size > 1 ? 's have' : ' has'} been removed from your food log.`,
                  [
                    {
                      text: 'Undo',
                      onPress: async () => {
                        try {
                          await undoBatchRemove(batchRemovedItems);
                          Alert.alert(
                            'Items Restored',
                            'The selected items have been restored to your food log.',
                            [{ text: 'OK' }]
                          );
                        } catch (error) {
                          console.error('Error undoing batch remove:', error);
                          Alert.alert(
                            'Error',
                            'Failed to restore items. Please try again.',
                            [{ text: 'OK' }]
                          );
                        }
                      },
                      style: 'default',
                    },
                    {
                      text: 'OK',
                      style: 'cancel',
                    },
                  ],
                  { cancelable: true }
                );
              }
            } catch (error) {
              console.error('Error removing batch items:', error);
              Alert.alert(
                'Error',
                'Failed to remove selected items. Please try again.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (error) {
    return (
      <LinearGradient
        colors={isDarkMode ? 
          ['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)'] :
          ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']
        }
        style={[styles.container, styles.glassEffect]}
      >
        <View style={styles.errorContainer}>
          <Ionicons 
            name="alert-circle-outline" 
            size={32} 
            color={colors.error} 
          />
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              setError(null);
              loadFoodLog(1, true);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={isDarkMode ? 
        ['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)'] :
        ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']
      }
      style={[styles.container, styles.glassEffect]}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons 
            name="restaurant-outline" 
            size={20} 
            color={colors.primary} 
          />
          <Text style={[styles.title, { color: colors.text }]}>
            Simple Food Log
          </Text>
        </View>
        <View style={styles.headerActions}>
          {items.length > 0 && (
            <TouchableOpacity
              onPress={toggleSelectionMode}
              style={[
                styles.actionButton,
                isSelectionMode && { backgroundColor: colors.primary }
              ]}
            >
              <Ionicons 
                name={isSelectionMode ? "close" : "checkbox-outline"}
                size={20}
                color={isSelectionMode ? "#fff" : colors.primary}
              />
            </TouchableOpacity>
          )}
          {isSelectionMode && selectedItems.size > 0 ? (
            <TouchableOpacity
              onPress={handleBatchRemove}
              style={[styles.actionButton, { backgroundColor: colors.error }]}
            >
              <Ionicons name="trash-outline" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: colors.cardBackground }]}
                onPress={() => setIsHistoryVisible(true)}
              >
                <Text style={[styles.iconButtonText, { color: colors.text }]}>History</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading food log...
          </Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.iconCircle, { backgroundColor: isDarkMode ? 'rgba(99,102,241,0.1)' : '#6366F110' }]}>
            <Ionicons 
              name="nutrition-outline" 
              size={32} 
              color={colors.primary} 
            />
          </View>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            Track Your Food Intake
          </Text>
          <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
            Track your food to maintain a healthy diet
          </Text>
        </View>
      ) : (
        <View style={styles.foodList}>
          {items.map((item) => (
            <FoodLogItem
              key={item.id}
              id={item.id}
              name={item.name}
              calories={item.calories}
              protein={item.protein}
              carbs={item.carbs}
              fat={item.fat}
              onRemove={handleRemove}
            />
          ))}
        </View>
      )}

      <UndoHistoryViewer
        isVisible={isHistoryVisible}
        onClose={() => setIsHistoryVisible(false)}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  glassEffect: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    padding: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  scanButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(99,102,241,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  scanNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#6366F1',
  },
  scanButtonIcon: {
    marginRight: 8,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  foodList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(99,102,241,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SimpleFoodLogSection; 