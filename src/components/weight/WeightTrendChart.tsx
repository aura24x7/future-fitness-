import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, YStack } from 'tamagui';
import { LineChart } from 'react-native-gifted-charts';
import { useWeight } from '../../contexts/WeightContext';
import { format } from 'date-fns';
import { useTheme } from '../../theme/ThemeProvider';

interface WeightTrendChartProps {
  height?: number;
  width?: number;
}

interface ChartDataPoint {
  value: number;
  label: string;
}

export const WeightTrendChart: React.FC<WeightTrendChartProps> = ({
  height = 250,
  width = Dimensions.get('window').width - 32, // Full width minus padding
}) => {
  const { weightLogs, weightGoal, weightSettings } = useWeight();
  const { colors } = useTheme();

  const chartData = useMemo(() => {
    if (!weightLogs.length) return [];

    return weightLogs
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((log) => ({
        value: log.weight,
        label: format(new Date(log.timestamp), 'd'),
        dataPointText: log.weight.toString(),
      }));
  }, [weightLogs]);

  if (!chartData.length) {
    return (
      <YStack
        height={height}
        justifyContent="center"
        alignItems="center"
        backgroundColor="$background"
      >
        <Text color="$gray11">No weight data available</Text>
      </YStack>
    );
  }

  const maxValue = Math.max(...chartData.map(d => d.value)) + 1;
  const minValue = Math.min(...chartData.map(d => d.value)) - 1;
  const yAxisData = Array.from({ length: 6 }, (_, i) => 
    minValue + (i * ((maxValue - minValue) / 5))
  );

  return (
    <View style={[styles.container, { height, width }]}>
      <Text
        fontSize={18}
        fontWeight="600"
        marginBottom="$2"
        color={colors.text}
      >
        Weight Trend ({weightSettings.unit})
      </Text>
      
      <LineChart
        areaChart
        data={chartData}
        height={height - 60}
        width={width - 32}
        spacing={40}
        initialSpacing={10}
        color={colors.primary}
        textColor={colors.text}
        thickness={2}
        yAxisLabelWidth={40}
        yAxisLabelTexts={yAxisData.map(v => v.toFixed(1))}
        yAxisTextStyle={{ color: colors.text }}
        xAxisLabelTextStyle={{ color: colors.text }}
        hideRules
        yAxisThickness={1}
        xAxisThickness={1}
        dataPointsRadius={3}
        rulesType="solid"
        rulesColor={colors.border}
      />

      {weightGoal && (
        <View style={[styles.goalLine, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.goalText, { color: colors.text }]}>
            Goal: {weightGoal.targetWeight} {weightSettings.unit}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  goalLine: {
    position: 'absolute',
    right: 24,
    top: 50,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  goalText: {
    fontSize: 12,
  },
}); 