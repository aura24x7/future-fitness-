import { styled } from 'tamagui'
import { Card, Text, View } from './core'
import { colors, shadows } from '../../theme/colors'

// Preserve existing exercise card styling
export const ExerciseCard = styled(Card, {
  name: 'ExerciseCard',
  padding: 16,
  marginVertical: 8,
  variants: {
    theme: {
      light: {
        backgroundColor: colors.background.card.light,
        borderColor: colors.border.light,
        ...shadows.small.light,
      },
      dark: {
        backgroundColor: colors.background.card.dark,
        borderColor: colors.border.dark,
        ...shadows.small.dark,
      }
    }
  }
})

// Keep existing progress indicator styling
export const ProgressIndicator = styled(View, {
  name: 'ProgressIndicator',
  height: 4,
  borderRadius: 2,
  variants: {
    theme: {
      light: {
        backgroundColor: colors.progress.background.light,
        borderColor: colors.border.light,
      },
      dark: {
        backgroundColor: colors.progress.background.dark,
        borderColor: colors.border.dark,
      }
    }
  }
})

// Maintain current timer interface styling
export const TimerDisplay = styled(View, {
  name: 'TimerDisplay',
  padding: 24,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  variants: {
    theme: {
      light: {
        backgroundColor: colors.background.secondary.light,
        borderColor: colors.border.light,
      },
      dark: {
        backgroundColor: colors.background.secondary.dark,
        borderColor: colors.border.dark,
      }
    }
  }
})

// Keep existing workout text styling
export const WorkoutText = styled(Text, {
  name: 'WorkoutText',
  variants: {
    theme: {
      light: {
        color: colors.text.primary.light,
      },
      dark: {
        color: colors.text.primary.dark,
      }
    },
    variant: {
      title: {
        fontSize: 20,
        fontWeight: 'bold',
      },
      subtitle: {
        fontSize: 16,
        fontWeight: '600',
      },
      body: {
        fontSize: 14,
      },
      timer: {
        fontSize: 48,
        fontWeight: 'bold',
        fontFamily: 'monospace',
      }
    }
  }
}) 