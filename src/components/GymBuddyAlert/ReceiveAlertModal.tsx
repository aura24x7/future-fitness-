import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGymBuddyAlert } from '../../contexts/GymBuddyAlertContext';
import { GymBuddyAlert } from '../../types/gymBuddyAlert';
import { format } from 'date-fns';

interface ReceiveAlertModalProps {
  isVisible: boolean;
  onClose: () => void;
  alert: GymBuddyAlert;
}

export function ReceiveAlertModal({
  isVisible,
  onClose,
  alert,
}: ReceiveAlertModalProps) {
  const { respondToAlert } = useGymBuddyAlert();
  const [loading, setLoading] = React.useState(false);

  const handleResponse = async (response: 'accept' | 'decline') => {
    setLoading(true);
    try {
      await respondToAlert(alert.id, response);
      onClose();
    } catch (error) {
      console.error('Error responding to alert:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.overlay}>
          <LinearGradient
            colors={['#6366F1', '#818CF8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientHeader}
          >
            <Text style={styles.headerText}>New Alert from {alert.senderName}</Text>
            <Text style={styles.timeText}>
              {format(new Date(alert.createdAt), 'MMM d, h:mm a')}
            </Text>
          </LinearGradient>

          <View style={styles.content}>
            <View style={styles.messageContainer}>
              <Text style={styles.message}>{alert.message}</Text>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.button, styles.declineButton]}
                onPress={() => handleResponse('decline')}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Decline</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.acceptButton]}
                onPress={() => handleResponse('accept')}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Accept</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlay: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gradientHeader: {
    padding: 20,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
  },
  content: {
    padding: 20,
  },
  messageContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    minHeight: 80,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1F2937',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  declineButton: {
    backgroundColor: '#FF5252',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
