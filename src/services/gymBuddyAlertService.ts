import { GymBuddyAlert, BaseAlert } from '../types/gymBuddyAlert';
import { auth, firestore } from '../config/firebase';
import { collection, addDoc, updateDoc, doc, Timestamp, getDoc } from 'firebase/firestore';
import { notificationService } from './notificationService';
import { Alert } from 'react-native';

class GymBuddyAlertService {
  async sendAlert(
    recipientId: string, 
    message: string, 
    type: 'CUSTOM_MESSAGE' | 'GYM_INVITE' = 'CUSTOM_MESSAGE'
  ): Promise<GymBuddyAlert> {
    console.log('Starting to send alert:', { recipientId, message, type });
    
    const user = auth.currentUser;
    if (!user) {
      const error = 'User must be authenticated to send alerts';
      console.error(error);
      throw new Error(error);
    }

    try {
      const baseAlert: BaseAlert = {
        senderId: user.uid,
        senderName: user.displayName || 'Unknown User',
        receiverId: recipientId,
        status: 'pending',
        createdAt: Timestamp.now().toDate().toISOString(),
        type,
        message: type === 'GYM_INVITE' ? "Let's hit the gym!" : message
      };

      console.log('Creating alert document:', baseAlert);
      const docRef = await addDoc(collection(firestore, 'alerts'), baseAlert);
      const newAlert = { ...baseAlert, id: docRef.id };
      console.log('Alert document created:', newAlert);

      // Send notification
      const notificationTitle = type === 'GYM_INVITE' ? 'Gym Buddy Request' : 'New Alert';
      const notificationBody = type === 'GYM_INVITE'
        ? `${user.displayName || 'Someone'} wants to hit the gym with you!`
        : message;

      try {
        console.log('Sending notification:', { title: notificationTitle, body: notificationBody });
        await notificationService.sendLocalNotification(
          notificationTitle,
          notificationBody,
          {
            type,
            alertId: docRef.id,
            senderId: user.uid,
            senderName: user.displayName,
          }
        );
        console.log('Notification sent successfully');
      } catch (error) {
        console.error('Error sending notification:', error);
        // Show error but don't throw since alert was created
        Alert.alert('Warning', 'Alert created but notification might be delayed');
      }

      return newAlert;
    } catch (error) {
      console.error('Error in sendAlert:', error);
      throw error;
    }
  }

  async respondToAlert(alertId: string, response: 'accept' | 'decline'): Promise<void> {
    console.log('Responding to alert:', { alertId, response });
    
    const status = response === 'accept' ? 'accepted' : 'declined';
    const alertRef = doc(firestore, 'alerts', alertId);
    
    try {
      // Get alert data to notify sender
      const alertDoc = await getDoc(alertRef);
      if (!alertDoc.exists()) {
        throw new Error('Alert not found');
      }

      const alertData = alertDoc.data() as GymBuddyAlert;
      console.log('Found alert data:', alertData);
      
      await updateDoc(alertRef, {
        status,
        responseAt: Timestamp.now().toDate().toISOString(),
      });
      console.log('Alert status updated');

      // Send notification to sender about the response
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be authenticated to respond to alerts');
      }

      const responderName = currentUser.displayName || 'Someone';
      const notificationTitle = 'Gym Buddy Response';
      const notificationBody = status === 'accepted'
        ? `${responderName} accepted your gym invitation!`
        : `${responderName} can't make it this time.`;

      try {
        console.log('Sending response notification:', { title: notificationTitle, body: notificationBody });
        await notificationService.sendLocalNotification(
          notificationTitle,
          notificationBody,
          {
            type: 'RESPONSE',
            alertId,
            status,
            responderId: currentUser.uid,
            responderName,
          }
        );
        console.log('Response notification sent successfully');
      } catch (error) {
        console.error('Error sending response notification:', error);
        Alert.alert('Warning', 'Response recorded but notification might be delayed');
      }
    } catch (error) {
      console.error('Error in respondToAlert:', error);
      throw error;
    }
  }
}

export const gymBuddyAlertService = new GymBuddyAlertService();
