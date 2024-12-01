import React from 'react';
import { Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Text, YStack } from 'tamagui';

interface ActivityDataPoint {
  day: string;
  duration: number;
}

interface ActivityBarChartProps {
  data: ActivityDataPoint[];
}

const { width } = Dimensions.get('window');

export const ActivityBarChart: React.FC<ActivityBarChartProps> = ({ data }) => {
  const maxDuration = Math.max(...data.map(d => d.duration));
  
  const chartData = data.map((point) => ({
    value: point.duration,
    label: point.day,
    frontColor: '#6366F1',
    topLabelComponent: () => (
      <Text
        color="#374151"
        fontSize={10}
        style={{
          marginBottom: 4,
          textAlign: 'center',
        }}
      >
        {point.duration}m
      </Text>
    ),
  }));

  return (
    <YStack>
      <BarChart
        data={chartData}
        width={width - 40}
        height={250}
        barWidth={32}
        spacing={24}
        initialSpacing={10}
        endSpacing={10}
        maxValue={maxDuration + 10}
        noOfSections={5}
        yAxisLabelSuffix="m"
        yAxisThickness={1}
        xAxisThickness={1}
        xAxisColor="lightgray"
        yAxisColor="lightgray"
        yAxisTextStyle={{ color: '#666' }}
        rotateLabel
        isAnimated
      />
    </YStack>
  );
};
