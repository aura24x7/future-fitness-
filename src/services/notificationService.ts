import * as Notifications from 'expo-notifications';
import { Platform, Vibration } from 'react-native';
import Constants from 'expo-constants';
import { firebaseCore } from './firebase/firebaseCore';

// Configure default notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

// Custom vibration pattern (3 seconds total)
const VIBRATION_PATTERN = [
  0, // Initial delay
  500, // Vibrate
  200, // Pause
  500, // Vibrate
  200, // Pause
  500, // Vibrate
  200, // Pause
  500, // Vibrate
  400, // Final pause
];

export class NotificationService {
  private static instance: NotificationService | null = null;
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {
    console.log('[NotificationService] Constructor called');
  }

  static async getInstance(): Promise<NotificationService> {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[NotificationService] Already initialized, skipping...');
      return;
    }

    if (!this.initializationPromise) {
      console.log('[NotificationService] Starting initialization...');
      this.initializationPromise = (async () => {
        try {
          // Initialize Firebase first
          console.log('[NotificationService] Ensuring Firebase is initialized...');
          await firebaseCore.ensureInitialized();
          console.log('[NotificationService] Firebase initialization confirmed');

          // Set up notification channel for Android
          if (Platform.OS === 'android') {
            try {
              console.log('[NotificationService] Setting up Android notification channel...');
              await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
              });
              console.log('[NotificationService] Android notification channel setup complete');
            } catch (channelError) {
              console.warn('[NotificationService] Failed to set up notification channel:', channelError);
              // Continue initialization - app can work without custom channel
            }
          }

          // Request permissions with retry logic
          let finalStatus = 'denied';
          try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            finalStatus = existingStatus;
            
            if (existingStatus !== 'granted') {
              const { status } = await Notifications.requestPermissionsAsync();
              finalStatus = status;
            }
          } catch (permissionError) {
            console.warn('[NotificationService] Error checking notification permissions:', permissionError);
            // Continue initialization - permissions can be requested later
          }

          if (finalStatus !== 'granted') {
            console.warn('[NotificationService] Notification permissions not granted');
            // Don't throw - app should work without notifications
          }

          this.isInitialized = true;
          console.log('[NotificationService] Initialization completed successfully');
        } catch (error) {
          console.error('[NotificationService] Initialization failed:', error);
          this.isInitialized = false;
          this.initializationPromise = null;
          throw error;
        }
      })();
    }

    return this.initializationPromise;
  }

  private async setupAndroidNotifications() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: VIBRATION_PATTERN,
        lightColor: '#FF231F7C',
      });
    }
  }

  private triggerVibration() {
    if (Platform.OS === 'android') {
      // Android requires the pattern to be specified
      Vibration.vibrate(VIBRATION_PATTERN);
    } else {
      // iOS doesn't support patterns, so we'll do multiple vibrations
      const duration = 3000; // 3 seconds
      const interval = 500; // 500ms between vibrations
      let elapsed = 0;
      
      const vibrateInterval = setInterval(() => {
        if (elapsed >= duration) {
          clearInterval(vibrateInterval);
          return;
        }
        Vibration.vibrate(100);
        elapsed += interval;
      }, interval);
    }
  }

  async sendLocalNotification(
    title: string,
    body: string,
    data: Record<string, any> = {}
  ): Promise<string> {
    console.log('Sending local notification:', { title, body, data });
    
    if (!this.isInitialized) {
      console.log('NotificationService not initialized, initializing now...');
      await this.initialize();
    }

    try {
      // Trigger vibration immediately
      this.triggerVibration();

      const notificationContent = {
        title,
        body,
        data,
        sound: true,
        priority: 'high',
        vibrationPattern: VIBRATION_PATTERN,
        categoryIdentifier: data.type === 'GYM_INVITE' ? 'gym_invite' : undefined,
      };

      // In Expo Go, we need to handle notifications differently
      if (Constants.appOwnership === 'expo') {
        console.log('Running in Expo Go, using local notifications only');
        notificationContent.data = {
          ...notificationContent.data,
          _displayInForeground: true,
        };
      }

      console.log('Notification content:', notificationContent);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: null, // null means send immediately
      });
      console.log('Notification scheduled with ID:', notificationId);

      return notificationId;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    console.log('Adding notification received listener');
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      // Trigger vibration on notification receive
      this.triggerVibration();
      callback(notification);
    });
    return subscription;
  }

  addNotificationResponseReceivedListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    console.log('Adding notification response listener');
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  removeSubscription(subscription: Notifications.Subscription): void {
    console.log('Removing notification subscription');
    subscription.remove();
  }
}

export async function getNotificationService(): Promise<NotificationService> {
  return NotificationService.getInstance();
}