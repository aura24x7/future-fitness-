import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'tamagui';
import { useTheme } from '../../theme/ThemeProvider';

export type TimeRange = 'weekly' | 'monthly';

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  selectedRange,
  onRangeChange,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor:
              selectedRange === 'weekly' ? colors.primary : 'transparent',
            borderColor: colors.primary,
          },
        ]}
        onPress={() => onRangeChange('weekly')}
      >
        <Text
          style={{
            color: selectedRange === 'weekly' ? '#fff' : colors.primary,
          }}
          fontSize={14}
          fontWeight="600"
        >
          Weekly
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor:
              selectedRange === 'monthly' ? colors.primary : 'transparent',
            borderColor: colors.primary,
          },
        ]}
        onPress={() => onRangeChange('monthly')}
      >
        <Text
          style={{
            color: selectedRange === 'monthly' ? '#fff' : colors.primary,
          }}
          fontSize={14}
          fontWeight="600"
        >
          Monthly
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 10,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
  },
});

export default TimeRangeSelector; 