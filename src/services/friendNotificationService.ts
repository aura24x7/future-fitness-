import { firestore, functions } from '../firebase/firebaseInit';
import { collection, doc, setDoc, query, where, getDocs, updateDoc, deleteDoc, getDoc, Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { getNotificationService } from './notificationService';
import { userService } from './userService';

export interface FriendNotification {
  id: string;
  senderId: string;
  senderName?: string;
  recipientId: string;
  type: 'workout' | 'meal' | 'other';
  message: string;
  createdAt: Date;
  read: boolean;
  // Optional field for workout invites
  response?: 'accepted' | 'declined' | undefined;
}

class FriendNotificationService {
  private static instance: FriendNotificationService;

  private constructor() {}

  public static getInstance(): FriendNotificationService {
    if (!FriendNotificationService.instance) {
      FriendNotificationService.instance = new FriendNotificationService();
    }
    return FriendNotificationService.instance;
  }

  /**
   * Send a notification to another user
   */
  async sendNotification(
    senderId: string, 
    recipientId: string, 
    type: 'workout' | 'meal' | 'other', 
    message: string
  ): Promise<string> {
    try {
      // First, check if there's a valid connection between users
      const isValidConnection = await this.validateConnection(senderId, recipientId);
      
      if (!isValidConnection) {
        throw new Error('No valid connection exists between these users');
      }
      
      // Get sender info for the notification
      const sender = await userService.findUserById(senderId);
      const senderName = sender?.name || 'A friend';
      
      // Create a document reference with auto-generated ID
      const notificationRef = doc(collection(firestore, 'notifications'));
      const notificationId = notificationRef.id;
      
      // Create the notification data
      const notificationData = {
        id: notificationId,
        senderId,
        senderName,
        recipientId,
        type,
        message,
        createdAt: new Date(),
        read: false
      };
      
      // Save to Firestore
      await setDoc(notificationRef, notificationData);
      
      // Check if this is a test notification
      const isTestNotification = type === 'other' && message.includes('test notification');
      
      // For test notifications or if the recipient is the current user, prioritize local notification
      const currentUserId = userService.getCurrentUserId();
      const shouldSendLocalNotification = isTestNotification || recipientId === currentUserId;
      
      // Always try to send a local notification for testing first
      if (shouldSendLocalNotification) {
        try {
          console.log('Sending local notification to current user...');
          const notificationService = await getNotificationService();
          
          // Use different title for test notifications
          const title = isTestNotification 
            ? 'Test Notification' 
            : `${type === 'workout' ? 'Workout Reminder' : type === 'meal' ? 'Meal Reminder' : 'Notification'}`;
            
          await notificationService.sendLocalNotification(
            title,
            `${senderName}: ${message}`,
            { type, senderId, notificationId, isTest: isTestNotification }
          );
          
          console.log('Local notification sent successfully');
        } catch (localNotificationError) {
          console.warn('Failed to send local notification:', localNotificationError);
          // Continue anyway - the notification is still stored in Firestore
        }
      }
      
      // Only try to send remote push notification via Cloud Function if not a test notification
      if (!isTestNotification) {
        try {
          console.log('Attempting to send push notification via Cloud Function...');
          // Call Firebase Cloud Function to trigger push notification
          const sendPushNotification = httpsCallable(functions, 'sendPushNotification');
          await sendPushNotification({
            recipientId,
            senderName,
            message,
            type
          });
          console.log('Remote push notification sent successfully');
        } catch (cloudFunctionError) {
          console.warn('Failed to send push notification:', cloudFunctionError);
          // The error is expected during development - the Cloud Function might not be deployed
          
          // If this was supposed to be a remote notification but failed, and we haven't sent a local one already,
          // try sending a local notification as fallback
          if (recipientId !== currentUserId && !shouldSendLocalNotification) {
            console.log('Attempting local notification fallback for remote recipient...');
            // This will only work if the recipient is using the same device
            try {
              const notificationService = await getNotificationService();
              await notificationService.sendLocalNotification(
                `${type === 'workout' ? 'Workout Reminder' : type === 'meal' ? 'Meal Reminder' : 'Notification'}`,
                `${senderName}: ${message}`,
                { type, senderId, notificationId }
              );
            } catch (fallbackError) {
              console.warn('Fallback local notification also failed:', fallbackError);
            }
          }
        }
      }
      
      return notificationId;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Get notifications for a specific user
   */
  async getNotifications(userId: string): Promise<FriendNotification[]> {
    try {
      const notificationsRef = collection(firestore, 'notifications');
      const q = query(notificationsRef, where("recipientId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      const notifications: FriendNotification[] = [];
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        // Convert Firestore timestamp to Date if needed
        let createdAt = data.createdAt;
        if (createdAt && typeof createdAt !== 'string' && 'toDate' in createdAt) {
          createdAt = (createdAt as Timestamp).toDate();
        }
        
        notifications.push({
          ...data,
          createdAt: createdAt instanceof Date ? createdAt : new Date(createdAt)
        } as FriendNotification);
      });
      
      // Sort by creation date (newest first)
      return notifications.sort((a, b) => 
        b.createdAt.getTime() - a.createdAt.getTime()
      );
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const notificationsRef = collection(firestore, 'notifications');
      const q = query(
        notificationsRef, 
        where("recipientId", "==", userId),
        where("read", "==", false)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(firestore, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(firestore, 'notifications', notificationId);
      await deleteDoc(notificationRef);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const notificationsRef = collection(firestore, 'notifications');
      const q = query(
        notificationsRef, 
        where("recipientId", "==", userId),
        where("read", "==", false)
      );
      const querySnapshot = await getDocs(q);
      
      const batch: Promise<void>[] = [];
      querySnapshot.docs.forEach(doc => {
        const notificationRef = doc.ref;
        batch.push(updateDoc(notificationRef, { read: true }));
      });
      
      await Promise.all(batch);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Validate that users have an active connection
   */
  private async validateConnection(userId1: string, userId2: string): Promise<boolean> {
    try {
      const connectionId1 = `${userId1}_${userId2}`;
      const connectionId2 = `${userId2}_${userId1}`;
      
      const connectionRef1 = doc(firestore, 'connections', connectionId1);
      const connectionRef2 = doc(firestore, 'connections', connectionId2);
      
      const connectionDoc1 = await getDoc(connectionRef1);
      const connectionDoc2 = await getDoc(connectionRef2);
      
      if (connectionDoc1.exists()) {
        const data = connectionDoc1.data();
        return data.status === 'active' || data.status === 'accepted';
      }
      
      if (connectionDoc2.exists()) {
        const data = connectionDoc2.data();
        return data.status === 'active' || data.status === 'accepted';
      }
      
      return false;
    } catch (error) {
      console.error('Error validating connection:', error);
      return false;
    }
  }

  /**
   * Send a workout invitation notification
   * @param senderId User sending the invite
   * @param recipientId User receiving the invite
   * @param gymName Optional gym name/location
   * @param time Optional time information
   */
  async sendWorkoutInvite(
    senderId: string,
    recipientId: string,
    gymName?: string,
    time?: string
  ): Promise<string> {
    try {
      // First, check if there's a valid connection between users
      const isValidConnection = await this.validateConnection(senderId, recipientId);
      
      if (!isValidConnection) {
        throw new Error('No valid connection exists between these users');
      }
      
      // Get sender info for the notification
      const sender = await userService.findUserById(senderId);
      const senderName = sender?.name || 'A friend';
      
      // Create specific message for workout invite
      const locationStr = gymName ? ` at ${gymName}` : '';
      const timeStr = time ? ` at ${time}` : '';
      const message = `${senderName} invites you to workout${locationStr}${timeStr}`;
      
      // Create a document reference with auto-generated ID
      const notificationRef = doc(collection(firestore, 'notifications'));
      const notificationId = notificationRef.id;
      
      // Create the notification data with workout specific fields
      const notificationData = {
        id: notificationId,
        senderId,
        senderName,
        recipientId,
        type: 'workout' as const,
        message,
        createdAt: new Date(),
        read: false,
        gymName,
        time,
        response: undefined
      };
      
      // Save to Firestore
      await setDoc(notificationRef, notificationData);
      
      // Try to send local notification if recipient is current user
      const currentUserId = userService.getCurrentUserId();
      if (recipientId === currentUserId) {
        try {
          console.log('Sending workout invite local notification...');
          const notificationService = await getNotificationService();
          
          await notificationService.sendLocalNotification(
            'Workout Invitation',
            message,
            { 
              type: 'GYM_INVITE', 
              senderId, 
              notificationId,
              gymName,
              time,
              isWorkoutInvite: true 
            }
          );
          
          console.log('Workout invite local notification sent successfully');
        } catch (localNotificationError) {
          console.warn('Failed to send workout invite notification:', localNotificationError);
        }
      } else {
        // Try to send remote notification
        try {
          console.log('Attempting to send workout invite via Cloud Function...');
          // Call Firebase Cloud Function to trigger push notification
          const sendPushNotification = httpsCallable(functions, 'sendPushNotification');
          await sendPushNotification({
            recipientId,
            senderName,
            message,
            type: 'GYM_INVITE',
            data: {
              gymName,
              time,
              notificationId
            }
          });
          console.log('Remote workout invite push notification sent successfully');
        } catch (cloudFunctionError) {
          console.warn('Failed to send workout invite push notification:', cloudFunctionError);
          // Cloud Function may not be deployed yet
        }
      }
      
      return notificationId;
    } catch (error) {
      console.error('Error sending workout invitation:', error);
      throw error;
    }
  }
  
  /**
   * Handle workout invitation response (accept/decline)
   */
  async respondToWorkoutInvite(
    notificationId: string, 
    response: 'accepted' | 'declined'
  ): Promise<void> {
    try {
      const notificationRef = doc(firestore, 'notifications', notificationId);
      const notificationDoc = await getDoc(notificationRef);
      
      if (!notificationDoc.exists()) {
        throw new Error('Notification not found');
      }
      
      const notificationData = notificationDoc.data();
      
      // Update the notification with response
      await updateDoc(notificationRef, {
        response,
        read: true,
        respondedAt: new Date()
      });
      
      // Notify the sender of the response
      if (notificationData.senderId) {
        const currentUser = userService.getCurrentUserId();
        const currentUserInfo = await userService.findUserById(currentUser);
        
        // Create a notification for the sender
        const responseMessage = response === 'accepted' 
          ? `${currentUserInfo?.name || 'Your friend'} accepted your workout invitation` 
          : `${currentUserInfo?.name || 'Your friend'} can't make it to the workout`;
        
        // Save notification to sender
        await this.sendNotification(
          currentUser,
          notificationData.senderId,
          'workout',
          responseMessage
        );
      }
    } catch (error) {
      console.error('Error responding to workout invite:', error);
      throw error;
    }
  }
}

export const friendNotificationService = FriendNotificationService.getInstance(); 