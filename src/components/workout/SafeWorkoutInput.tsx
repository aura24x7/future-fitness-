import React from 'react';
import { TextInput, TextInputProps, StyleSheet, View, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface SafeWorkoutInputProps extends TextInputProps {
  error?: string;
  label?: string;
}

export const SafeWorkoutInput: React.FC<SafeWorkoutInputProps> = ({
  error,
  label,
  style,
  ...props
}) => {
  const { colors, isDarkMode } = useTheme();
  const errorColor = '#EF4444'; // Modern red color
  const labelColor = isDarkMode ? colors.text : '#374151';
  const borderColor = error 
    ? errorColor 
    : isDarkMode 
      ? 'rgba(139, 92, 246, 0.4)' // Purple in dark mode
      : '#E5E7EB';
  
  const backgroundColor = isDarkMode 
    ? 'rgba(35, 35, 35, 0.8)' 
    : '#FFFFFF';
    
  const textColor = isDarkMode ? '#FFFFFF' : '#111827';
  const placeholderColor = isDarkMode ? 'rgba(170, 170, 170, 0.7)' : '#9CA3AF';

  return (
    <View style={styles.container}>
      {label && (
        <Text 
          style={[
            styles.label, 
            { color: labelColor }
          ]}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          { 
            shadowColor: '#000',
            shadowOffset: { width: 0, height: isDarkMode ? 2 : 1 },
            shadowOpacity: isDarkMode ? 0.3 : 0.1,
            shadowRadius: isDarkMode ? 4 : 3,
            elevation: isDarkMode ? 4 : 2,
          }
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { 
              backgroundColor: backgroundColor,
              borderColor: borderColor,
              color: textColor,
            },
            props.multiline && styles.multilineInput,
            style
          ]}
          placeholderTextColor={placeholderColor}
          {...props}
        />
      </View>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={[styles.error, { color: errorColor }]}>
            {error}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    marginBottom: 6,
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    height: 48,
  },
  multilineInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  errorContainer: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  error: {
    fontSize: 12,
    fontWeight: '500',
  }
}); 