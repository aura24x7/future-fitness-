import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from '../components/themed/Text';

export const HomeScreen = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text 
        variant="heading1" 
        style={{ color: colors.text }}
      >
        Welcome to Future Fitness
      </Text>
      <Text 
        variant="subtitle1" 
        style={{ color: colors.textSecondary }}
      >
        Your journey to a healthier lifestyle starts here
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
}); 