import React from 'react';
import { TouchableOpacity, View, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CheckboxProps {
  checked: boolean;
  onToggle: (checked: boolean) => void;
  size?: number;
}

const Checkbox: React.FC<CheckboxProps> = ({ 
  checked, 
  onToggle, 
  size = 24 
}) => {
  const animatedValue = React.useRef(new Animated.Value(checked ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: checked ? 1 : 0,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  }, [checked]);

  const scale = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ffffff', '#4c669f'],
  });

  return (
    <TouchableOpacity
      onPress={() => onToggle(!checked)}
      activeOpacity={0.6}
    >
      <Animated.View
        style={[
          styles.checkbox,
          {
            width: size,
            height: size,
            borderRadius: size / 4,
            backgroundColor,
            transform: [{ scale }],
          },
        ]}
      >
        {checked && (
          <Ionicons
            name="checkmark"
            size={size * 0.7}
            color="#ffffff"
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkbox: {
    borderWidth: 2,
    borderColor: '#4c669f',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Checkbox;
