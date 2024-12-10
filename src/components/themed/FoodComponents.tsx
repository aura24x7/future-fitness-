import { styled } from 'tamagui'
import { Card, Text, View } from './core'
import { colors } from '../../theme/colors'

// Preserve existing meal card styling
export const MealCard = styled(Card, {
  name: 'MealCard',
  padding: 16,
  marginVertical: 8,
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

// Keep existing nutrition info styling
export const NutritionInfo = styled(View, {
  name: 'NutritionInfo',
  padding: 12,
  borderRadius: 8,
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

// Maintain current search bar styling
export const SearchBar = styled(View, {
  name: 'SearchBar',
  height: 48,
  paddingHorizontal: 16,
  borderRadius: 8,
  marginVertical: 8,
  variants: {
    theme: {
      light: {
        backgroundColor: colors.background.input.light,
        borderColor: colors.border.light,
      },
      dark: {
        backgroundColor: colors.background.input.dark,
        borderColor: colors.border.dark,
      }
    }
  }
})

// Keep existing food text styling
export const FoodText = styled(Text, {
  name: 'FoodText',
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
        fontSize: 18,
        fontWeight: 'bold',
      },
      subtitle: {
        fontSize: 16,
      },
      body: {
        fontSize: 14,
      },
      caption: {
        fontSize: 12,
        opacity: 0.7,
      }
    }
  }
})

export const FilterChip = styled(View, {
  name: 'FilterChip',
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 16,
  marginRight: 8,
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
    },
    selected: {
      true: {
        backgroundColor: colors.primary,
      }
    }
  }
})

export const NutritionChart = styled(View, {
  name: 'NutritionChart',
  height: 200,
  marginVertical: 16,
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