import { Stack, XStack, Text, Button } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../theme/ThemeProvider'
import { getGreeting } from '../utils/dateUtils'

interface HeaderProps {
  title?: string
  showDate?: boolean
}

export const Header = ({ title, showDate = true }: HeaderProps) => {
  const navigation = useNavigation()
  const { colors, isDarkMode } = useTheme()
  const date = new Date()
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date)

  const greeting = getGreeting()

  return (
    <Stack style={{ 
      paddingHorizontal: 24,
      paddingTop: 48,
      paddingBottom: 8,
      backgroundColor: isDarkMode ? colors.background : '#FFFFFF'
    }}>
      <XStack justifyContent="space-between" alignItems="center">
        <Stack space={4}>
          <Text 
            fontSize={32} 
            fontWeight="bold" 
            color={colors.text}
            letterSpacing={-0.5}
            lineHeight={38}
            style={{
              marginBottom: 6,
              paddingRight: 16
            }}
          >
            {title || `${greeting},`}
          </Text>
          {showDate && (
            <Text 
              fontSize={16} 
              color={colors.textSecondary}
              letterSpacing={-0.2}
              style={{
                marginTop: 4,
                opacity: 0.8
              }}
            >
              {formattedDate}
            </Text>
          )}
        </Stack>
      </XStack>
    </Stack>
  )
}
