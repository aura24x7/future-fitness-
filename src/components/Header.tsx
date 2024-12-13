import { Stack, XStack, Text, Button } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'

interface HeaderProps {
  title?: string
  showDate?: boolean
}

export const Header = ({ title, showDate = true }: HeaderProps) => {
  const navigation = useNavigation()
  const date = new Date()
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date)

  const handleProfilePress = () => {
    navigation.navigate('Profile')
  }

  return (
    <Stack space="$2" p="$4">
      <XStack justifyContent="space-between" alignItems="center">
        <Stack>
          <Text fontSize={24} fontWeight="bold" color="$gray12">
            {title || 'Good evening, User'}
          </Text>
          {showDate && (
            <Text fontSize={16} color="$gray11">
              {formattedDate}
            </Text>
          )}
        </Stack>
        <Button
          size="$4"
          circular
          icon={<Ionicons name="person-outline" size={24} color="#666" />}
          backgroundColor="$gray3"
          pressStyle={{ backgroundColor: '$gray4' }}
          onPress={handleProfilePress}
          aria-label="Profile"
        />
      </XStack>
    </Stack>
  )
}
