import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, YStack } from 'tamagui';
import Ionicons from '@expo/vector-icons/Ionicons';

export const LockedFeatureScreen = () => {
  return (
    <View style={styles.container}>
      <YStack space={4} alignItems="center">
        <Ionicons name="lock-closed" size={64} color="#94A3B8" />
        <Text
          fontSize={24}
          fontWeight="600"
          color="#1E293B"
          textAlign="center"
        >
          Coming Soon!
        </Text>
        <Text
          fontSize={16}
          color="#64748B"
          textAlign="center"
          style={styles.message}
        >
          We're working hard to bring you an amazing workout experience.
          This feature will be available in the next update!
        </Text>
      </YStack>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  message: {
    maxWidth: 300,
    lineHeight: 24,
  },
});

export default LockedFeatureScreen;
