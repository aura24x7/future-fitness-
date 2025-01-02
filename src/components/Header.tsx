import { Stack, XStack, Text, Button } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../theme/ThemeProvider'
import { getGreeting } from '../utils/dateUtils'
import { Platform, View, StatusBar } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

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
    <Stack>
      <View style={{
        paddingTop: Platform.OS === 'ios' ? StatusBar.currentHeight || 44 : StatusBar.currentHeight || 20,
        backgroundColor: isDarkMode ? colors.background : '#FFFFFF',
      }}>
        <LinearGradient
          colors={isDarkMode ? 
            ['rgba(0,0,0,0)', 'rgba(0,0,0,0.02)'] : 
            ['rgba(255,255,255,0)', 'rgba(255,255,255,0.05)']}
          style={{
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: 16,
          }}
        >
          <XStack 
            justifyContent="space-between" 
            alignItems="center"
            style={{
              marginBottom: 8,
            }}
          >
            <View>
              <Text
                fontSize={16}
                color={isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'}
                style={{
                  marginBottom: 4,
                  fontWeight: '500',
                }}
              >
                {greeting}
              </Text>
              <Text
                fontSize={24}
                fontWeight="bold"
                color={colors.text}
                style={{
                  letterSpacing: -0.5,
                }}
              >
                {formattedDate}
              </Text>
            </View>
            <View style={{
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              padding: 8,
              borderRadius: 20,
            }}>
              <Ionicons 
                name="notifications-outline" 
                size={24} 
                color={isDarkMode ? colors.text : '#1A1A1A'} 
              />
            </View>
          </XStack>
        </LinearGradient>
      </View>
    </Stack>
  )
}
