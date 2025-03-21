import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useGymBuddyAlerts } from '../../contexts/GymBuddyAlertContext';
import { AlertNotification } from './AlertNotification';
import { GymBuddyAlert } from '../../types/gymBuddyAlert';

export function AlertNotificationManager() {
  const context = useGymBuddyAlerts();
  const [currentAlert, setCurrentAlert] = useState<GymBuddyAlert | null>(null);

  useEffect(() => {
    // Only process alerts if we have a valid context and receivedAlerts array
    if (context?.receivedAlerts) {
      // Find the first pending alert
      const pendingAlert = context.receivedAlerts.find(
        (alert: GymBuddyAlert) => alert.status === 'pending'
      );
      
      if (pendingAlert && !currentAlert) {
        setCurrentAlert(pendingAlert);
      }
    }
  }, [context?.receivedAlerts, currentAlert]);

  const handleAccept = async () => {
    if (currentAlert && context?.respondToAlert) {
      await context.respondToAlert(currentAlert.id, 'accept');
      setCurrentAlert(null);
    }
  };

  const handleReject = async () => {
    if (currentAlert && context?.respondToAlert) {
      await context.respondToAlert(currentAlert.id, 'decline');
      setCurrentAlert(null);
    }
  };

  const handleDismiss = () => {
    setCurrentAlert(null);
  };

  if (!currentAlert || !context) {
    return null;
  }

  return (
    <View style={styles.container}>
      <AlertNotification
        alert={currentAlert}
        onAccept={handleAccept}
        onReject={handleReject}
        onDismiss={handleDismiss}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});
