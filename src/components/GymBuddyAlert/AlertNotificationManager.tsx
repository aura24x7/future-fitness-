import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useGymBuddyAlert } from '../../contexts/GymBuddyAlertContext';
import { AlertNotification } from './AlertNotification';
import { GymBuddyAlert } from '../../types/gymBuddyAlert';

export function AlertNotificationManager() {
  const { state, respondToAlert } = useGymBuddyAlert();
  const [currentAlert, setCurrentAlert] = useState<GymBuddyAlert | null>(null);

  useEffect(() => {
    // Find the first pending alert
    const pendingAlert = state.receivedAlerts.find(
      alert => alert.status === 'pending'
    );
    
    if (pendingAlert && !currentAlert) {
      setCurrentAlert(pendingAlert);
    }
  }, [state.receivedAlerts]);

  const handleAccept = async () => {
    if (currentAlert) {
      await respondToAlert(currentAlert.id, true);
      setCurrentAlert(null);
    }
  };

  const handleReject = async () => {
    if (currentAlert) {
      await respondToAlert(currentAlert.id, false);
      setCurrentAlert(null);
    }
  };

  const handleDismiss = () => {
    setCurrentAlert(null);
  };

  if (!currentAlert) {
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
