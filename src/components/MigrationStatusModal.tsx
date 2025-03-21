import React from 'react';
import { Modal, View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text } from 'tamagui';
import { useTheme } from '../theme/ThemeProvider';

interface MigrationStatusModalProps {
  visible: boolean;
  status: {
    phase: 'backup' | 'water' | 'workout' | 'complete' | 'error';
    message: string;
    error?: string;
    progress?: number;
  };
  onClose: () => void;
}

const MigrationStatusModal: React.FC<MigrationStatusModalProps> = ({
  visible,
  status,
  onClose,
}) => {
  const { colors, isDarkMode } = useTheme();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            {status.phase === 'error' ? 'Migration Error' : 'Migration in Progress'}
          </Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {status.message}
          </Text>
          {status.error && (
            <Text style={[styles.error, { color: isDarkMode ? '#DC2626' : '#EF4444' }]}>
              {status.error}
            </Text>
          )}
          {status.progress !== undefined && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: colors.primary,
                      width: `${status.progress * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                {Math.round(status.progress * 100)}%
              </Text>
            </View>
          )}
          {status.phase === 'error' && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 24,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  progressContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    marginTop: 8,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
});

export default MigrationStatusModal;
