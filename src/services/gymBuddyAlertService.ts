import { Alert } from 'react-native';
import { firebaseCore } from './firebase/firebaseCore';
import { getNotificationService } from './notificationService';
import { GymBuddyAlert, CustomMessageAlert, GymInviteAlert } from '../types/gymBuddyAlert';

class GymBuddyAlertService {
  private static instance: GymBuddyAlertService;

  private constructor() {}

  static getInstance(): GymBuddyAlertService {
    if (!GymBuddyAlertService.instance) {
      GymBuddyAlertService.instance = new GymBuddyAlertService();
    }
    return GymBuddyAlertService.instance;
  }

  async sendAlert(
    recipientId: string, 
    message: string, 
    type: 'CUSTOM_MESSAGE' | 'GYM_INVITE' = 'CUSTOM_MESSAGE'
  ): Promise<GymBuddyAlert> {
    console.log('Starting to send alert:', { recipientId, message, type });

    const user = firebaseCore.getCurrentUser();
    if (!user) {
      throw new Error('User must be authenticated to send alerts');
    }

    try {
      const baseAlert = {
        senderId: user.uid,
        senderName: user.displayName || 'Anonymous',
        receiverId: recipientId,
        message,
        type,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const db = firebaseCore.getFirestore();
      const docRef = await db.collection('alerts').add(baseAlert);
      const newAlert = { ...baseAlert, id: docRef.id };

      const notificationTitle = type === 'GYM_INVITE' ? 'New Gym Buddy Invite!' : 'New Message';
      const notificationBody = type === 'GYM_INVITE' 
        ? `${user.displayName || 'Someone'} wants to work out with you!`
        : message;

      try {
        console.log('Sending notification:', { title: notificationTitle, body: notificationBody });
        const notificationService = await getNotificationService();
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
    const db = firebaseCore.getFirestore();
    const alertRef = db.collection('alerts').doc(alertId);
    
    try {
      // Get alert data to notify sender
      const alertDoc = await alertRef.get();
      if (!alertDoc.exists) {
        throw new Error('Alert not found');
      }

      const alertData = alertDoc.data() as GymBuddyAlert;
      console.log('Found alert data:', alertData);
      
      await alertRef.update({
        status,
        responseAt: new Date().toISOString(),
      });
      console.log('Alert status updated');

      // Send notification to sender about the response
      const currentUser = firebaseCore.getCurrentUser();
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
        const notificationService = await getNotificationService();
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

export const gymBuddyAlertService = GymBuddyAlertService.getInstance();
