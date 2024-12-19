import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GymBuddyAlert } from '../../types/gymBuddyAlert';

interface AlertNotificationProps {
  alert: GymBuddyAlert;
  onAccept: () => void;
  onReject: () => void;
  onDismiss: () => void;
}

const { height } = Dimensions.get('window');

export function AlertNotification({
  alert,
  onAccept,
  onReject,
  onDismiss,
}: AlertNotificationProps) {
  const translateY = new Animated.Value(-100);
  const isGymInvite = alert.type === 'GYM_INVITE';

  useEffect(() => {
    // Slide in
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 20,
      friction: 6,
    }).start();

    // Vibrate for gym invites
    if (isGymInvite) {
      Vibration.vibrate([0, 100, 100, 100]);
    }

    // Auto dismiss after 10 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.timing(translateY, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons 
            name={isGymInvite ? "barbell-outline" : "fitness"} 
            size={24} 
            color="#6366F1" 
          />
          <Text style={styles.title}>
            {isGymInvite ? 'Gym Buddy Request' : 'Workout Buddy Request'}
          </Text>
        </View>
        
        <Text style={styles.message}>
          <Text style={styles.name}>{alert.senderName}</Text>
          {isGymInvite ? ' wants to hit the gym with you!' : ' wants to join your workout!'}
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.rejectButton]}
            onPress={onReject}
          >
            <Text style={[styles.buttonText, styles.rejectText]}>
              {isGymInvite ? 'Not Today' : 'Decline'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={onAccept}
          >
            <Text style={[styles.buttonText, styles.acceptText]}>
              {isGymInvite ? "Let's Go!" : 'Join'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    padding: 16,
    margin: 16,
    marginTop: height * 0.05,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  content: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  message: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 22,
  },
  name: {
    fontWeight: '600',
    color: '#1F2937',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 4,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  acceptButton: {
    backgroundColor: '#6366F1',
  },
  rejectButton: {
    backgroundColor: '#F3F4F6',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  acceptText: {
    color: '#FFFFFF',
  },
  rejectText: {
    color: '#6B7280',
  },
});
