import { Card, Text, YStack, XStack, Progress } from 'tamagui';

interface CalorieDeficitCardProps {
  deficit: number;
  target: number;
}

export const CalorieDeficitCard = ({ deficit, target }: CalorieDeficitCardProps) => {
  const progress = Math.min(100, Math.max(0, (deficit / target) * 100));
  
  return (
    <Card elevate bordered>
      <YStack padding="$4" space="$3">
        <Text fontSize={14} color="$gray10">Weekly Calorie Deficit</Text>
        <YStack space="$2">
          <XStack justifyContent="space-between">
            <Text fontSize={18} fontWeight="600">
              {Math.abs(deficit).toLocaleString()} kcal
            </Text>
            <Text fontSize={14} color="$gray10">
              Target: {target.toLocaleString()} kcal
            </Text>
          </XStack>
          <Progress value={progress}>
            <Progress.Indicator backgroundColor="$green10" />
          </Progress>
        </YStack>
      </YStack>
    </Card>
  );
}; 