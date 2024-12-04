import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MacroNutrients } from '../../types/calorie';

interface Props {
  macros: MacroNutrients;
  goals: MacroNutrients;
}

const MacroChart: React.FC<Props> = ({ macros, goals }) => {
  const calculateProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const renderMacroBar = (
    label: string,
    current: number,
    goal: number,
    color: string
  ) => {
    const progress = calculateProgress(current, goal);
    
    return (
      <View style={styles.macroItem}>
        <View style={styles.macroHeader}>
          <Text style={styles.macroLabel}>{label}</Text>
          <Text style={styles.macroValues}>
            {current}g / {goal}g
          </Text>
        </View>
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${progress}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderMacroBar('Protein', macros.protein, goals.protein, '#FF6B6B')}
      {renderMacroBar('Carbs', macros.carbs, goals.carbs, '#4ECDC4')}
      {renderMacroBar('Fat', macros.fat, goals.fat, '#FFD93D')}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  macroItem: {
    marginBottom: 15,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  macroLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  macroValues: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
});

export default MacroChart;
