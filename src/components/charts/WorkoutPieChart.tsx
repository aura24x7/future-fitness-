import React from 'react';
import { Dimensions } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Text, YStack, XStack } from 'tamagui';

interface WorkoutDataPoint {
  type: string;
  percentage: number;
}

interface WorkoutPieChartProps {
  data: WorkoutDataPoint[];
}

const colors = ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE'];
const { width } = Dimensions.get('window');

export const WorkoutPieChart: React.FC<WorkoutPieChartProps> = ({ data }) => {
  const chartData = data.map((point, index) => ({
    value: point.percentage,
    color: colors[index % colors.length],
    text: `${point.percentage}%`,
  }));

  return (
    <YStack alignItems="center">
      <PieChart
        data={chartData}
        donut
        radius={width * 0.25}
        textColor="#374151"
        textSize={12}
        focusOnPress
      />
      <YStack space="$2" marginTop="$4">
        {data.map((point, index) => (
          <XStack key={index} space="$2" alignItems="center">
            <Text
              backgroundColor={colors[index % colors.length]}
              width={12}
              height={12}
              borderRadius={6}
            />
            <Text color="#374151" fontSize={14}>
              {point.type} ({point.percentage}%)
            </Text>
          </XStack>
        ))}
      </YStack>
    </YStack>
  );
};
