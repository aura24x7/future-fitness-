import React from 'react';
import { Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Text, YStack } from 'tamagui';

interface WeightDataPoint {
  date: string;
  weight: number;
}

interface WeightChartProps {
  data: WeightDataPoint[];
}

const { width } = Dimensions.get('window');

export const WeightChart: React.FC<WeightChartProps> = ({ data }) => {
  const chartData = data.map((point) => ({
    value: point.weight,
    label: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    dataPointText: `${point.weight}kg`,
  }));

  return (
    <YStack>
      <LineChart
        data={chartData}
        height={250}
        width={width - 40}
        spacing={40}
        initialSpacing={20}
        color="#6366F1"
        thickness={2}
        maxValue={Math.ceil(Math.max(...data.map(d => d.weight)) + 5)}
        minValue={Math.floor(Math.min(...data.map(d => d.weight)) - 5)}
        noOfSections={6}
        yAxisLabelPrefix=""
        yAxisLabelSuffix="kg"
        xAxisColor="lightgray"
        yAxisColor="lightgray"
        yAxisTextStyle={{ color: '#666' }}
        xAxisLabelTextStyle={{ color: '#666', textAlign: 'center' }}
        hideDataPoints={false}
        dataPointsColor="#6366F1"
        dataPointsRadius={4}
        curved
        isAnimated
      />
    </YStack>
  );
};
