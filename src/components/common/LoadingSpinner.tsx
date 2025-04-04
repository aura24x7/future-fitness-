import React from 'react';
import { ActivityIndicator } from 'react-native';
import { View } from 'tamagui';

export const LoadingSpinner = () => {
  return (
    <View alignItems="center" justifyContent="center" padding="$4">
      <ActivityIndicator size="large" color="#6366F1" />
    </View>
  );
}; 