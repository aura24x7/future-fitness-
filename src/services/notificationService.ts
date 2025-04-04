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

// Enhanced vibration pattern (4 seconds total with stronger vibrations)
const VIBRATION_PATTERN = [
  0,     // Initial delay
  800,   // Vibrate (longer)
  300,   // Pause
  800,   // Vibrate (longer)
  300,   // Pause
  800,   // Vibrate (longer)
  300,   // Pause
  800,   // Vibrate (longer)
  300,   // Final pause
];

// Stronger vibration pattern for workout invites (5 seconds total)
const WORKOUT_VIBRATION_PATTERN = [
  0,     // Initial delay
  1000,  // Vibrate (very long)
  200,   // Pause
  1000,  // Vibrate (very long)
  200,   // Pause
  1000,  // Vibrate (very long)
  200,   // Pause
  1000,  // Vibrate (very long)
  400,   // Final pause
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

          // Set up notification categories for actionable notifications
          await this.setupNotificationCategories();

          // Set up notification channel for Android
          if (Platform.OS === 'android') {
            try {
              console.log('[NotificationService] Setting up Android notification channel...');
              // Default channel
              await Notifications.setNotificationChannelAsync('default', {
                name: 'Default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: VIBRATION_PATTERN,
                lightColor: '#FF231F7C',
              });
              
              // Workout invites channel with stronger vibration
              await Notifications.setNotificationChannelAsync('workout_invites', {
                name: 'Workout Invites',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: WORKOUT_VIBRATION_PATTERN,
                lightColor: '#4f46e5', // Indigo color
                sound: 'default',
              });
              
              console.log('[NotificationService] Android notification channels setup complete');
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
              const { status } = await Notifications.requestPermissionsAsync({
                ios: {
                  allowAlert: true,
                  allowBadge: true,
                  allowSound: true,
                  allowAnnouncements: true,
                  providesAppNotificationSettings: true,
                }
              });
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

  /**
   * Set up notification categories with action buttons
   */
  private async setupNotificationCategories() {
    try {
      console.log('[NotificationService] Setting up notification categories...');
      
      // For workout invitations with Accept/Decline buttons
      await Notifications.setNotificationCategoryAsync('workout_invite', [
        {
          identifier: 'accept',
          buttonTitle: 'Accept',
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          }
        },
        {
          identifier: 'decline',
          buttonTitle: 'Decline',
          options: {
            isDestructive: true,
            isAuthenticationRequired: false,
          }
        }
      ]);
      
      // For meal reminders with simple acknowledgment
      await Notifications.setNotificationCategoryAsync('meal_reminder', [
        {
          identifier: 'acknowledge',
          buttonTitle: 'Got it',
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          }
        }
      ]);
      
      console.log('[NotificationService] Notification categories setup complete');
    } catch (error) {
      console.warn('[NotificationService] Failed to set up notification categories:', error);
      // Continue anyway, functionality will degrade gracefully
    }
  }

  /**
   * Trigger a vibration pattern based on notification type
   */
  private triggerVibration(isWorkoutInvite: boolean = false) {
    try {
      const pattern = isWorkoutInvite ? WORKOUT_VIBRATION_PATTERN : VIBRATION_PATTERN;
      
      if (Platform.OS === 'android') {
        // Android requires the pattern to be specified
        Vibration.vibrate(pattern);
      } else {
        // iOS doesn't support patterns, so we'll do multiple vibrations
        const duration = isWorkoutInvite ? 5000 : 3000; // 5 or 3 seconds
        const interval = 400; // 400ms between vibrations
        let elapsed = 0;
        
        const vibrateInterval = setInterval(() => {
          if (elapsed >= duration) {
            clearInterval(vibrateInterval);
            return;
          }
          Vibration.vibrate(isWorkoutInvite ? 400 : 200);
          elapsed += interval;
        }, interval);
      }
    } catch (error) {
      console.warn('[NotificationService] Vibration error:', error);
      // Fail silently - vibration is a nice-to-have
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
      // Determine notification type
      const isTestNotification = data.isTest || (data.type === 'other' && body.includes('test notification'));
      const isWorkoutInvite = data.type === 'workout' && body.includes('workout');
      
      // Trigger appropriate vibration pattern
      this.triggerVibration(isWorkoutInvite);

      // Special handling for test notifications
      if (isTestNotification) {
        // More aggressive vibration for test notifications
        if (Platform.OS === 'android') {
          Vibration.vibrate([0, 500, 200, 500, 200, 500]);
        } else {
          Vibration.vibrate(1000);
          setTimeout(() => Vibration.vibrate(1000), 1500);
        }
        console.log('📱 TEST NOTIFICATION DETAILS:', { title, body, data });
      }

      // Determine the appropriate notification category
      let categoryIdentifier: string | undefined;
      if (isWorkoutInvite) {
        categoryIdentifier = 'workout_invite';
      } else if (data.type === 'meal') {
        categoryIdentifier = 'meal_reminder';
      } else if (data.type === 'GYM_INVITE') {
        categoryIdentifier = 'workout_invite';
      }
      
      // Create notification content with proper typing
      const notificationContent: Notifications.NotificationContentInput = {
        title: isTestNotification ? `🔔 ${title} 🔔` : isWorkoutInvite ? `🏋️ ${title}` : title,
        body,
        data: {
          ...data,
          timestamp: new Date().toISOString(),
          _displayInForeground: true
        },
        sound: true,
        badge: 1,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        categoryIdentifier,
        // Android specific settings
        androidChannelId: isWorkoutInvite ? 'workout_invites' : 'default',
      };

      // In Expo Go, we need to handle notifications differently
      if (Constants.appOwnership === 'expo') {
        console.log('Running in Expo Go, using local notifications only');
      }

      console.log('Notification content:', notificationContent);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: null, // null means send immediately
      });
      console.log('Notification scheduled with ID:', notificationId);

      // For test notifications in foreground, show an additional console message
      if (isTestNotification) {
        console.log('\n\n==================================');
        console.log('🔔 TEST NOTIFICATION SENT 🔔');
        console.log('ID:', notificationId);
        console.log('BODY:', body);
        console.log('==================================\n\n');
      }

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
      // Check notification type for vibration pattern
      const data = notification.request.content.data;
      const isWorkoutInvite = 
        (data?.type === 'workout' && notification.request.content.body.includes('workout')) ||
        data?.type === 'GYM_INVITE';
      
      // Trigger vibration on notification receive
      this.triggerVibration(isWorkoutInvite);
      
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