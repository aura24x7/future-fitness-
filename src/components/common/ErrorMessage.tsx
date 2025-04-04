import React from 'react';
import { View } from 'react-native';
import { Text } from 'tamagui';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <View style={{ alignItems: 'center', padding: 16 }}>
      <Text color="$red10" fontSize="$4">
        {message}
      </Text>
    </View>
  );
}; 