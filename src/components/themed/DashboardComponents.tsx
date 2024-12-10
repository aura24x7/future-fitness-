import { styled } from 'tamagui'
import { Card, Text, View } from './core'
import { colors } from '../../theme/colors'

// Preserve existing statistics card styling
export const StatisticsCard = styled(Card, {
  name: 'StatisticsCard',
  padding: 16,
  marginBottom: 8,
  variants: {
    theme: {
      light: {
        backgroundColor: colors.card.light,
        shadowColor: colors.shadow.light,
      },
      dark: {
        backgroundColor: colors.card.dark,
        shadowColor: colors.shadow.dark,
      }
    }
  }
})

// Keep existing chart container styling
export const ProgressChart = styled(View, {
  name: 'ProgressChart',
  height: 200,
  marginVertical: 16,
  variants: {
    theme: {
      light: {
        backgroundColor: colors.chart.light,
      },
      dark: {
        backgroundColor: colors.chart.dark,
      }
    }
  }
})

// Maintain current activity feed styling
export const ActivityFeedItem = styled(Card, {
  name: 'ActivityFeedItem',
  padding: 12,
  marginVertical: 4,
  variants: {
    theme: {
      light: {
        backgroundColor: colors.feed.light,
        borderColor: colors.border.light,
      },
      dark: {
        backgroundColor: colors.feed.dark,
        borderColor: colors.border.dark,
      }
    }
  }
})

// Keep existing text styling
export const StatisticsText = styled(Text, {
  name: 'StatisticsText',
  variants: {
    theme: {
      light: {
        color: colors.text.light,
      },
      dark: {
        color: colors.text.dark,
      }
    },
    variant: {
      header: {
        fontSize: 18,
        fontWeight: 'bold',
      },
      body: {
        fontSize: 14,
      }
    }
  }
})

// Add more themed components as needed while maintaining existing styles 