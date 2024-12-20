import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (description: string) => Promise<void>;
}

const TextInputModal: React.FC<Props> = ({ isVisible, onClose, onSubmit }) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { colors, isDarkMode } = useTheme();

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      await onSubmit(text);
      setText('');
      onClose();
    } catch (error) {
      console.error('Error submitting food description:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      useNativeDriver
      hideModalContentWhileAnimating
      style={styles.modal}
      avoidKeyboard
      statusBarTranslucent
    >
      <View style={[
        styles.container,
        {
          backgroundColor: isDarkMode ? colors.cardBackground : colors.background,
        }
      ]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
          >
            <Ionicons
              name="close"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            Log Food
          </Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.content}>
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
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />

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
              <Text style={styles.submitButtonText}>
                Analyze
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 4,
  },
  headerRight: {
    width: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TextInputModal; 