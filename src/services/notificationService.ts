import * as Notifications from 'expo-notifications';
import { Platform, Vibration } from 'react-native';
import Constants from 'expo-constants';

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

class NotificationService {
  private static instance: NotificationService;
  private isInitialized: boolean = false;
  private isExpoGo: boolean = Constants.appOwnership === 'expo';

  private constructor() {
    console.log('NotificationService constructor called');
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      console.log('Creating new NotificationService instance');
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
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

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('NotificationService already initialized');
      return;
    }

    console.log('Initializing NotificationService');
    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log('Current notification permission status:', existingStatus);
      
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        console.log('Requesting notification permissions');
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        finalStatus = status;
        console.log('New notification permission status:', status);
      }

      if (finalStatus !== 'granted') {
        throw new Error('Permission not granted for notifications');
      }

      // Configure Android channel
      if (Platform.OS === 'android') {
        console.log('Configuring Android notification channel');
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: VIBRATION_PATTERN,
          lightColor: '#FF231F7C',
        });
      }

      // Set up notification categories
      console.log('Setting up notification categories');
      await Notifications.setNotificationCategoryAsync('gym_invite', [
        {
          identifier: 'accept',
          buttonTitle: 'Accept',
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          },
        },
        {
          identifier: 'decline',
          buttonTitle: 'Decline',
          options: {
            isDestructive: true,
            isAuthenticationRequired: false,
          },
        },
      ]);

      this.isInitialized = true;
      console.log('NotificationService initialization complete');
    } catch (error) {
      console.error('Error initializing notifications:', error);
      this.isInitialized = false;
      throw error;
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
      if (this.isExpoGo) {
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

export const notificationService = NotificationService.getInstance(); 