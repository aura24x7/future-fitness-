import { styled } from 'tamagui'
import { Text as RNText } from 'react-native'

export const Text = styled(RNText, {
  name: 'Text',
  color: '$color',
  variants: {
    size: {
      xs: {
        fontSize: 12,
      },
      sm: {
        fontSize: 14,
      },
      md: {
        fontSize: 16,
      },
      lg: {
        fontSize: 18,
      },
      xl: {
        fontSize: 20,
      },
      '2xl': {
        fontSize: 24,
      },
    },
    weight: {
      normal: {
        fontWeight: 'normal',
      },
      medium: {
        fontWeight: '500',
      },
      bold: {
        fontWeight: 'bold',
      },
    },
    variant: {
      default: {
        color: '$color',
      },
      muted: {
        color: '$colorMuted',
      },
      error: {
        color: '$error',
      },
      success: {
        color: '$success',
      },
    },
  },
  defaultVariants: {
    size: 'md',
    weight: 'normal',
    variant: 'default',
  },
})
