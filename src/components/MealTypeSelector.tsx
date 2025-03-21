import React from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Text } from 'tamagui';
import { useTheme } from '../theme/ThemeProvider';
import { MealType } from '../types/calorie';

interface MealTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mealType: MealType) => void;
}

const MealTypeSelector: React.FC<MealTypeSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const { colors, isDarkMode } = useTheme();

  const mealTypes = [
    { type: MealType.BREAKFAST, label: 'Breakfast', icon: '🍳' },
    { type: MealType.LUNCH, label: 'Lunch', icon: '🍱' },
    { type: MealType.DINNER, label: 'Dinner', icon: '🍽️' },
    { type: MealType.SNACKS, label: 'Snacks', icon: '🍪' },
  ];

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.dismissArea} onPress={onClose} />
        <View style={[
          styles.modalContent,
          { backgroundColor: isDarkMode ? colors.background : '#FFFFFF' }
        ]}>
          <Text
            style={{ color: colors.text }}
            fontSize={18}
            fontWeight="600"
            marginBottom={20}
          >
            Select Meal Type
          </Text>
          <View style={styles.optionsContainer}>
            {mealTypes.map(({ type, label, icon }) => (
              <TouchableOpacity
                key={type}
                style={[styles.option, { backgroundColor: colors.background }]}
                onPress={() => {
                  onSelect(type);
                  onClose();
                }}
              >
                <Text fontSize={24} marginBottom={8}>
                  {icon}
                </Text>
                <Text
                  style={{ color: colors.text }}
                  fontSize={16}
                  fontWeight="500"
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dismissArea: {
    flex: 1,
  },
  modalContent: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  option: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});

export default MealTypeSelector; 