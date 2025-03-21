import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { naturalLanguageFoodService } from '../services/ai/naturalLanguageFood/naturalLanguageFoodService';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../components/themed/Text';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const FoodTextInputScreen: React.FC = () => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const handleSubmit = async () => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const result = await naturalLanguageFoodService.analyzeFoodText(text);
      navigation.navigate('ScannedFoodDetails', {
        result,
        source: 'text'
      });
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to analyze food text. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanPress = () => {
    navigation.navigate('FoodScanner');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text variant="subtitle1" style={{ color: colors.text }}>
          Add Food
        </Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="What did you eat? (e.g., 2 chapatis and dal)"
            placeholderTextColor={colors.textSecondary}
            multiline
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: isDarkMode
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.05)',
              }
            ]}
            autoFocus
          />
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={handleScanPress}
          >
            <Ionicons name="camera-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: colors.primary,
              opacity: isLoading || !text.trim() ? 0.6 : 1,
            }
          ]}
          onPress={handleSubmit}
          disabled={isLoading || !text.trim()}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text variant="subtitle2" style={styles.submitButtonText}>
              Analyze Food
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    padding: 4,
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  input: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    paddingRight: 48,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  cameraButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  submitButton: {
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
  },
});

export default FoodTextInputScreen; 