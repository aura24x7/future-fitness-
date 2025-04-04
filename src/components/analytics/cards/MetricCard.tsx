import { Card, Text, YStack } from 'tamagui';
import { WeightUnit } from '../../../types/weight';

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: WeightUnit;
}

export const MetricCard = ({ title, value, unit }: MetricCardProps) => {
  return (
    <Card elevate bordered flex={1}>
      <YStack padding="$4" space="$2">
        <Text fontSize={14} color="$gray10">{title}</Text>
        <Text fontSize={18} fontWeight="600">
          {typeof value === 'number' ? value.toFixed(1) : value}
          {unit ? ` ${unit}` : ''}
        </Text>
      </YStack>
    </Card>
  );
}; 