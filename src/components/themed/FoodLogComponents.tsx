import { styled } from 'tamagui'
import { Card, Text, View } from './core'
import { colors } from '../../theme/colors'

// Daily Summary Card
export const SummaryCard = styled(Card, {
  name: 'SummaryCard',
  padding: 16,
  marginVertical: 8,
  borderRadius: 12,
  variants: {
    theme: {
      light: {
        backgroundColor: colors.background.card.light,
        borderColor: colors.border.light,
      },
      dark: {
        backgroundColor: colors.background.card.dark,
        borderColor: colors.border.dark,
      }
    }
  }
})

// Meal Section Card
export const MealSectionCard = styled(Card, {
  name: 'MealSectionCard',
  padding: 16,
  marginVertical: 4,
  borderRadius: 12,
  variants: {
    theme: {
      light: {
        backgroundColor: colors.background.card.light,
        borderColor: colors.border.light,
      },
      dark: {
        backgroundColor: colors.background.card.dark,
        borderColor: colors.border.dark,
      }
    }
  }
})

// Food Item Row
export const FoodItemRow = styled(View, {
  name: 'FoodItemRow',
  flexDirection: 'row',
  alignItems: 'center',
  padding: 12,
  borderRadius: 8,
  marginVertical: 4,
  variants: {
    theme: {
      light: {
        backgroundColor: colors.background.secondary.light,
      },
      dark: {
        backgroundColor: colors.background.secondary.dark,
      }
    }
  }
})

// Macro Display
export const MacroDisplay = styled(View, {
  name: 'MacroDisplay',
  alignItems: 'center',
  flex: 1,
})

// Text variants for food log
export const FoodLogText = styled(Text, {
  name: 'FoodLogText',
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
        fontSize: 24,
        fontWeight: 'bold',
      },
      sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
      },
      foodName: {
        fontSize: 16,
        fontWeight: '500',
      },
      macroLabel: {
        fontSize: 14,
        color: colors.text.secondary.light,
      },
      macroValue: {
        fontSize: 18,
        fontWeight: 'bold',
      },
      calories: {
        fontSize: 16,
        color: colors.text.secondary.light,
      }
    }
  }
})

// Navigation button
export const NavButton = styled(View, {
  name: 'NavButton',
  padding: 8,
  borderRadius: 8,
  variants: {
    theme: {
      light: {
        backgroundColor: 'transparent',
      },
      dark: {
        backgroundColor: 'transparent',
      }
    }
  }
}) 