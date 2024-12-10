import { styled } from 'tamagui'
import { View as RNView, Text as RNText } from 'react-native'

export const View = styled(RNView, {
  name: 'View',
})

export const Card = styled(View, {
  name: 'Card',
  variants: {
    theme: {
      light: {
        backgroundColor: '$backgroundLight',
        borderColor: '$borderLight',
      },
      dark: {
        backgroundColor: '$backgroundDark',
        borderColor: '$borderDark',
      }
    }
  }
})

export const Text = styled(RNText, {
  name: 'Text',
  variants: {
    theme: {
      light: {
        color: '$textLight',
      },
      dark: {
        color: '$textDark',
      }
    }
  }
}) 