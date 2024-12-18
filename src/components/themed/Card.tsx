import { styled } from 'tamagui'
import { View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '../../theme/colors'

const GradientBorder = styled(LinearGradient, {
  name: 'GradientBorder',
  borderRadius: '$2',
  padding: 1, // Border width
})

export const Card = styled(View, {
  name: 'Card',
  backgroundColor: '$background',
  borderRadius: '$2',
  padding: '$3',
  overflow: 'hidden',
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
      },
      filled: {
        backgroundColor: '$background',
      },
      gradient: {
        backgroundColor: '$background',
      }
    },
  },

  defaultVariants: {
    size: 'medium',
    variant: 'filled',
  },
})

// Compound component that includes gradient border
export const GradientCard = ({ children, gradientColors = ['#6366F1', '#818CF8'], style, ...props }) => {
  return (
    <GradientBorder
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={style}
    >
      <Card {...props} style={{ margin: -1 }}>
        {children}
      </Card>
    </GradientBorder>
  )
}
