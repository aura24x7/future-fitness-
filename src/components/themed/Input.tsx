import { styled } from 'tamagui'
import { TextInput } from 'react-native'

export const Input = styled(TextInput, {
  name: 'Input',
  backgroundColor: '$background',
  color: '$color',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$medium',
  padding: '$medium',
  
  // Preserve existing input behavior
  placeholderTextColor: '$secondaryText',
  
  // States
  focusStyle: {
    borderColor: '$primary',
    borderWidth: 2,
  },

  variants: {
    size: {
      small: {
        padding: '$small',
        fontSize: 14,
      },
      medium: {
        padding: '$medium',
        fontSize: 16,
      },
      large: {
        padding: '$large',
        fontSize: 18,
      },
    },
    variant: {
      outlined: {
        backgroundColor: 'transparent',
      },
      filled: {
        backgroundColor: '$backgroundPress',
        borderWidth: 0,
      },
    },
    error: {
      true: {
        borderColor: '$error',
        focusStyle: {
          borderColor: '$error',
          borderWidth: 2,
        },
      },
    },
  },

  defaultVariants: {
    size: 'medium',
    variant: 'outlined',
    error: false,
  },
})
