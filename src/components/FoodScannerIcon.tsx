import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface FoodScannerIconProps {
  focused: boolean;
  color: string;
  size: number;
}

const FoodScannerIcon: React.FC<FoodScannerIconProps> = ({ focused, color, size }) => {
  return (
    <View style={styles.container}>
      <MaterialIcons 
        name="camera-alt" 
        size={size} 
        color={color} 
        style={focused ? styles.focused : {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  focused: {
    transform: [{ scale: 1.1 }],
  },
});

export default FoodScannerIcon;
