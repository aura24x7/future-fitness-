import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGymBuddyAlert } from '../../contexts/GymBuddyAlertContext';
import { GymBuddyAlert } from '../../types/gymBuddyAlert';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

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

  React.useEffect(() => {
    if (isVisible && alert.type === 'GYM_INVITE') {
      // Vibration pattern for gym invites: 2 short pulses
      Vibration.vibrate([0, 100, 100, 100]);
    }
  }, [isVisible, alert.type]);

  const handleResponse = async (response: 'accept' | 'decline') => {
    setLoading(true);
    try {
      await respondToAlert(alert.id, response === 'accept');
      onClose();
    } catch (error) {
      console.error('Error responding to alert:', error);
    } finally {
      setLoading(false);
    }
  };

  const isGymInvite = alert.type === 'GYM_INVITE';

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
            {isGymInvite ? (
              <View style={styles.headerContent}>
                <Ionicons name="barbell-outline" size={24} color="#fff" />
                <Text style={styles.headerText}>Gym Buddy Invite</Text>
              </View>
            ) : (
              <Text style={styles.headerText}>New Alert from {alert.senderName}</Text>
            )}
            <Text style={styles.timeText}>
              {format(new Date(alert.createdAt), 'MMM d, h:mm a')}
            </Text>
          </LinearGradient>

          <View style={styles.content}>
            <View style={styles.messageContainer}>
              {isGymInvite ? (
                <View style={styles.gymInviteContent}>
                  <Text style={styles.senderName}>{alert.senderName}</Text>
                  <Text style={styles.message}>wants to hit the gym with you!</Text>
                </View>
              ) : (
                <Text style={styles.message}>{alert.message}</Text>
              )}
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
                  <Text style={styles.buttonText}>
                    {isGymInvite ? 'Not Today' : 'Decline'}
                  </Text>
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
                  <Text style={styles.buttonText}>
                    {isGymInvite ? "Let's Go!" : 'Accept'}
                  </Text>
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5,
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
  gymInviteContent: {
    alignItems: 'center',
    gap: 8,
  },
  senderName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
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
