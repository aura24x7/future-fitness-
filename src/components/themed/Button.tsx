import { styled } from 'tamagui'
import { Pressable } from 'react-native'

export const Button = styled(Pressable, {
  name: 'Button',
  backgroundColor: '$primary',
  borderRadius: '$medium',
  padding: '$medium',
  alignItems: 'center',
  justifyContent: 'center',
  
  pressStyle: {
    opacity: 0.8,
    scale: 0.98,
  },

  variants: {
    size: {
      small: {
        padding: '$small',
        borderRadius: '$small',
      },
      medium: {
        padding: '$medium',
        borderRadius: '$medium',
      },
      large: {
        padding: '$large',
        borderRadius: '$large',
      },
    },
    variant: {
      filled: {
        backgroundColor: '$primary',
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '$primary',
      },
      text: {
        backgroundColor: 'transparent',
        padding: 0,
      },
    },
    disabled: {
      true: {
        opacity: 0.5,
        pressStyle: {
          opacity: 0.5,
          scale: 1,
        },
      },
    },
  },

  defaultVariants: {
    size: 'medium',
    variant: 'filled',
    disabled: false,
  },
})
