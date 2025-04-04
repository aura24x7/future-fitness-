import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';

interface HeaderSimpleProps {
  title: string;
  showBackButton?: boolean;
}

export const HeaderSimple: React.FC<HeaderSimpleProps> = ({ title, showBackButton = false }) => {
  const navigation = useNavigation();
  const { colors, isDarkMode } = useTheme();

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: isDarkMode ? '#121212' : '#fff',
        borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      }
    ]}>
      <View style={styles.content}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
        )}
        <Text
          fontSize={20}
          fontWeight="600"
          style={[
            styles.title, 
            showBackButton && styles.titleWithBack,
            { color: isDarkMode ? '#fff' : '#000' }
          ]}
        >
          {title}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    flex: 1,
  },
  titleWithBack: {
    marginLeft: 8,
  },
}); 