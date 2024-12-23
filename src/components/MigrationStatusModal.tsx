import React from 'react';
import { Modal, View, StyleSheet, ActivityIndicator } from 'react-native';
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
}

const MigrationStatusModal: React.FC<MigrationStatusModalProps> = ({
  visible,
  status,
}) => {
  const { colors, isDarkMode } = useTheme();

  const getStatusMessage = () => {
    switch (status.phase) {
      case 'backup':
        return 'Backing up your data...';
      case 'water':
        return 'Migrating water tracking data...';
      case 'workout':
        return 'Migrating workout data...';
      case 'complete':
        return 'Migration completed successfully!';
      case 'error':
        return 'An error occurred during migration';
      default:
        return 'Preparing migration...';
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View style={[
        styles.container,
        { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)' }
      ]}>
        <View style={[
          styles.content,
          { backgroundColor: colors.background }
        ]}>
          {status.phase !== 'complete' && status.phase !== 'error' && (
            <ActivityIndicator size="large" color={colors.primary} />
          )}
          
          <Text
            color={colors.text}
            fontSize={18}
            fontWeight="600"
            textAlign="center"
            marginTop={16}
          >
            {getStatusMessage()}
          </Text>
          
          <Text
            color={colors.textMuted}
            fontSize={14}
            textAlign="center"
            marginTop={8}
          >
            {status.message}
          </Text>

          {status.error && (
            <Text
              color="red"
              fontSize={14}
              textAlign="center"
              marginTop={8}
            >
              {status.error}
            </Text>
          )}

          {status.progress !== undefined && (
            <View style={styles.progressContainer}>
              <View 
                style={[
                  styles.progressBar,
                  { 
                    backgroundColor: colors.primary,
                    width: `${status.progress * 100}%`
                  }
                ]} 
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
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
});

export default MigrationStatusModal;
