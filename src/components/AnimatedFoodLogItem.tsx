import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { SimpleFoodItem } from '../services/simpleFoodLogService';

interface Props {
  item: SimpleFoodItem;
  onPress?: () => void;
  onLongPress?: () => void;
  isSelected?: boolean;
  style?: any;
}

const AnimatedFoodLogItem: React.FC<Props> = ({
  item,
  onPress,
  onLongPress,
  isSelected,
  style
}) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.95);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const selectedStyle = isSelected ? styles.selected : null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      <TouchableOpacity
        style={[styles.touchable, selectedStyle]}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
      >
        <View style={styles.content}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.details}>
            <Text style={styles.calories}>{item.calories} cal</Text>
            <View style={styles.macros}>
              <Text style={styles.macro}>P: {item.protein}g</Text>
              <Text style={styles.macro}>C: {item.carbs}g</Text>
              <Text style={styles.macro}>F: {item.fat}g</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  touchable: {
    padding: 16,
    borderRadius: 12,
  },
  selected: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 16,
  },
  details: {
    alignItems: 'flex-end',
  },
  calories: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  macros: {
    flexDirection: 'row',
    gap: 8,
  },
  macro: {
    fontSize: 13,
    color: '#666',
  },
});

export default AnimatedFoodLogItem; 