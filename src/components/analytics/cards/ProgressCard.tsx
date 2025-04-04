import { Card, Text, YStack, XStack } from 'tamagui';
import { WeightUnit } from '../../../types/weight';

interface ProgressCardProps {
  title: string;
  current: number;
  start: number;
  target: number;
  unit: WeightUnit;
}

export const ProgressCard = ({ title, current, start, target, unit }: ProgressCardProps) => {
  const progress = Math.min(100, Math.max(0, ((start - current) / (start - target)) * 100));

  return (
    <Card elevate bordered>
      <YStack padding="$4" space="$2">
        <Text fontSize={16} fontWeight="600">{title}</Text>
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize={14} color="$gray10">Start: {start} {unit}</Text>
          <Text fontSize={14} color="$gray10">Target: {target} {unit}</Text>
        </XStack>
        <XStack space="$2" alignItems="center">
          <Text fontSize={20} fontWeight="700">{current} {unit}</Text>
          <Text fontSize={14} color={progress > 0 ? '$green10' : '$gray10'}>
            ({progress.toFixed(1)}%)
          </Text>
        </XStack>
      </YStack>
    </Card>
  );
}; 