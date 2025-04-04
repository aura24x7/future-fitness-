import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'tamagui';
import { useTheme } from '../../theme/ThemeProvider';

interface MacroTooltipProps {
  totalCalories: number;
  protein: { grams: number; calories: number };
  carbs: { grams: number; calories: number };
  fat: { grams: number; calories: number };
}

const MacroTooltip: React.FC<MacroTooltipProps> = ({
  totalCalories,
  protein,
  carbs,
  fat,
}) => {
  const { colors, isDarkMode } = useTheme();
  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        transform: [{ translateX: -60 }], // Center the tooltip over the bar
      }
    ]}>
      <View style={styles.arrow} />
      <Text
        style={{ color: colors.text }}
        fontSize={14}
        fontWeight="600"
        marginBottom={8}
      >
        Total: {totalCalories} cal
      </Text>
      <View style={styles.macroRow}>
        <Text style={{ color: colors.text }} fontSize={12}>
          Protein: {protein.grams}g
        </Text>
        <Text style={{ color: colors.textSecondary }} fontSize={12}>
          ({protein.calories} cal)
        </Text>
      </View>
      <View style={styles.macroRow}>
        <Text style={{ color: colors.text }} fontSize={12}>
          Carbs: {carbs.grams}g
        </Text>
        <Text style={{ color: colors.textSecondary }} fontSize={12}>
          ({carbs.calories} cal)
        </Text>
      </View>
      <View style={styles.macroRow}>
        <Text style={{ color: colors.text }} fontSize={12}>
          Fat: {fat.grams}g
        </Text>
        <Text style={{ color: colors.textSecondary }} fontSize={12}>
          ({fat.calories} cal)
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 120,
  },
  arrow: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(30, 30, 30, 0.95)',
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
});

export default MacroTooltip; 