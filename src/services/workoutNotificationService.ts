import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getFirestore, collection, doc, addDoc, onSnapshot, query, where, orderBy, getDocs, updateDoc, FieldValue, Timestamp } from 'firebase/firestore';
import { SharedWorkoutPlan } from '../types/workoutSharing';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface NotificationData {
  type: 'workout_share' | 'workout_update' | 'workout_reminder';
  planId: string;
  senderId: string;
  title: string;
  message: string;
  timestamp: number;
}

class WorkoutNotificationService {
  private db = getFirestore();
  private subscriptions = new Map<string, () => void>();

  // Initialize notification permissions
  initialize = async (): Promise<boolean> => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return false;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('workout-sharing', {
          name: 'Workout Sharing',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6366F1',
        });
      }

      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  };

  // Subscribe to notifications for a user
  subscribeToNotifications = (userId: string, onNotification: (data: NotificationData) => void) => {
    // Unsubscribe from existing subscription
    this.unsubscribeFromNotifications(userId);

    const notificationsCollection = collection(this.db, 'notifications');
    const q = query(notificationsCollection, where('recipientId', '==', userId), where('read', '==', false));
    const unsubscribe = onSnapshot(q, snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const notification = change.doc.data() as NotificationData;
          this.showNotification(notification);
          onNotification(notification);
        }
      });
    }, error => {
      console.error('Error in notification subscription:', error);
    });

    this.subscriptions.set(userId, unsubscribe);
  };

  // Unsubscribe from notifications
  unsubscribeFromNotifications = (userId: string) => {
    const unsubscribe = this.subscriptions.get(userId);
    if (unsubscribe) {
      unsubscribe();
      this.subscriptions.delete(userId);
    }
  };

  // Show local notification
  private showNotification = async (data: NotificationData) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: data.title,
          body: data.message,
          data: data,
          sound: true,
          badge: 1,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  // Create workout share notification
  createShareNotification = async (
    recipientId: string,
    senderId: string,
    plan: SharedWorkoutPlan
  ) => {
    try {
      const notification: NotificationData = {
        type: 'workout_share',
        planId: plan.id,
        senderId,
        title: 'New Workout Plan Shared',
        message: `${plan.metadata.author.name} shared "${plan.title}" with you`,
        timestamp: Date.now(),
      };

      const notificationsCollection = collection(this.db, 'notifications');
      await addDoc(notificationsCollection, {
        ...notification,
        recipientId,
        read: false,
        createdAt: FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating share notification:', error);
    }
  };

  // Create workout update notification
  createUpdateNotification = async (
    recipientId: string,
    senderId: string,
    plan: SharedWorkoutPlan
  ) => {
    try {
      const notification: NotificationData = {
        type: 'workout_update',
        planId: plan.id,
        senderId,
        title: 'Workout Plan Updated',
        message: `${plan.metadata.author.name} updated "${plan.title}"`,
        timestamp: Date.now(),
      };

      const notificationsCollection = collection(this.db, 'notifications');
      await addDoc(notificationsCollection, {
        ...notification,
        recipientId,
        read: false,
        createdAt: FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating update notification:', error);
    }
  };

  // Mark notification as read
  markAsRead = async (notificationId: string) => {
    try {
      const notificationsCollection = collection(this.db, 'notifications');
      const notificationDoc = doc(notificationsCollection, notificationId);
      await updateDoc(notificationDoc, {
        read: true,
        readAt: FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Get unread notifications count
  getUnreadCount = async (userId: string): Promise<number> => {
    try {
      const notificationsCollection = collection(this.db, 'notifications');
      const q = query(notificationsCollection, where('recipientId', '==', userId), where('read', '==', false));
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  };

  // Clean up all subscriptions
  cleanup = () => {
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions.clear();
  };
}

export const workoutNotificationService = new WorkoutNotificationService();
