import { styled } from 'tamagui'
import { View } from 'react-native'

export const Card = styled(View, {
  name: 'Card',
  backgroundColor: '$card',
  borderRadius: '$2',
  padding: '$3',
  borderWidth: 1,
  borderColor: '$borderColor',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,

  variants: {
    size: {
      small: {
        padding: '$2',
      },
      medium: {
        padding: '$3',
      },
      large: {
        padding: '$4',
      },
    },
    variant: {
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1,
      },
      filled: {
        borderWidth: 0,
      },
    },
  },

  defaultVariants: {
    size: 'medium',
    variant: 'filled',
  },
})
