import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useSimpleFoodLog } from '../contexts/SimpleFoodLogContext';
import { Text } from './themed/Text';

interface FoodLogItemProps {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  onRemove?: (id: string) => Promise<void>;
}

const FoodLogItem: React.FC<FoodLogItemProps> = ({
  id,
  name,
  calories,
  protein,
  carbs,
  fat,
}) => {
  const { colors, isDarkMode } = useTheme();
  const { 
    isSelectionMode,
    selectedItems,
    toggleItemSelection,
  } = useSimpleFoodLog();

  const isSelected = selectedItems.has(id);

  const handlePress = () => {
    if (isSelectionMode) {
      toggleItemSelection(id);
      return;
    }
  };

  const handleLongPress = () => {
    if (!isSelectionMode) {
      toggleItemSelection(id);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isSelected
            ? isDarkMode
              ? 'rgba(99,102,241,0.2)'
              : 'rgba(99,102,241,0.1)'
            : 'transparent'
        }
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.mainContent}>
        <View style={styles.nameContainer}>
          {isSelectionMode && (
            <View style={[styles.checkbox, isSelected && { backgroundColor: colors.primary }]}>
              {isSelected && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
          )}
          <Text 
            variant="subtitle1" 
            style={[styles.name, { color: colors.text }]}
          >
            {name}
          </Text>
        </View>
        <View style={styles.macrosContainer}>
          <View style={styles.macroItem}>
            <Text 
              variant="caption" 
              style={{ color: colors.textSecondary }}
            >
              Cal
            </Text>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(99,102,241,0.1)' }]}>
              <Ionicons name="flame" size={16} color="#6366F1" />
            </View>
            <Text 
              variant="body2" 
              style={{ color: colors.textSecondary }}
            >
              {calories}
            </Text>
          </View>
          <View style={styles.macroItem}>
            <Text 
              variant="caption" 
              style={{ color: colors.textSecondary }}
            >
              Protein
            </Text>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(34,197,94,0.1)' }]}>
              <Ionicons name="fitness" size={16} color="#22C55E" />
            </View>
            <Text 
              variant="body2" 
              style={{ color: colors.textSecondary }}
            >
              {protein}g
            </Text>
          </View>
          <View style={styles.macroItem}>
            <Text 
              variant="caption" 
              style={{ color: colors.textSecondary }}
            >
              Carbs
            </Text>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(59,130,246,0.1)' }]}>
              <Ionicons name="leaf" size={16} color="#3B82F6" />
            </View>
            <Text 
              variant="body2" 
              style={{ color: colors.textSecondary }}
            >
              {carbs}g
            </Text>
          </View>
          <View style={styles.macroItem}>
            <Text 
              variant="caption" 
              style={{ color: colors.textSecondary }}
            >
              Fat
            </Text>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(249,115,22,0.1)' }]}>
              <Ionicons name="water" size={16} color="#F97316" />
            </View>
            <Text 
              variant="body2" 
              style={{ color: colors.textSecondary }}
            >
              {fat}g
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  mainContent: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6366F1',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    flex: 1,
  },
  macrosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  macroItem: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
});

export default FoodLogItem; 