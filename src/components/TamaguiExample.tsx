import React from 'react'
import { Button, H1, YStack, Text, XStack } from 'tamagui'

export function TamaguiExample() {
  return (
    <YStack
      space="$4"
      padding="$4"
      alignItems="center"
    >
      <H1>Welcome to AI Fitness</H1>
      
      <XStack space="$4">
        <Button
          size="$6"
          theme="active"
          onPress={() => console.log('Start Workout')}
        >
          Start Workout
        </Button>

        <Button
          size="$6"
          theme="alt2"
          onPress={() => console.log('View Progress')}
        >
          View Progress
        </Button>
      </XStack>

      <Text
        theme="alt1"
        fontSize="$6"
      >
        Your AI-powered fitness journey starts here
      </Text>
    </YStack>
  )
}
