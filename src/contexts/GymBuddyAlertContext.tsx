import React, { createContext, useContext, useReducer, useCallback, useEffect, useState, useRef } from 'react';
import { Vibration, Alert } from 'react-native';
import { gymBuddyAlertService } from '../services/gymBuddyAlertService';
import { 
  GymBuddyAlert,
  CustomMessageAlert,
  GymInviteAlert,
  AlertResponse
} from '../types/gymBuddyAlert';
import { firebaseCore } from '../services/firebase/firebaseCore';
import { getNotificationService } from '../services/notificationService';
import { friendNotificationService } from '../services/friendNotificationService';

interface AlertContextState {
  sentAlerts: GymBuddyAlert[];
  receivedAlerts: GymBuddyAlert[];
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface AlertContextValue extends AlertContextState {
  sendCustomMessageAlert: (recipientId: string, message: string) => Promise<CustomMessageAlert>;
  sendGymInvite: (recipientId: string, gymName?: string, time?: string) => Promise<GymInviteAlert>;
  respondToAlert: (alertId: string, accept: 'accept' | 'decline') => Promise<void>;
}

const initialState: AlertContextState = {
  sentAlerts: [],
  receivedAlerts: [],
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

type AlertAction =
  | { type: 'SEND_ALERT_START' }
  | { type: 'SEND_ALERT_SUCCESS'; payload: GymBuddyAlert }
  | { type: 'SEND_ALERT_ERROR'; payload: string }
  | { type: 'RECEIVE_ALERT'; payload: GymBuddyAlert }
  | { type: 'SET_AUTHENTICATED'; payload: boolean };

function alertReducer(state: AlertContextState, action: AlertAction): AlertContextState {
  switch (action.type) {
    case 'SEND_ALERT_START':
      return { ...state, isLoading: true, error: null };
    case 'SEND_ALERT_SUCCESS':
      return {
        ...state,
        isLoading: false,
        sentAlerts: [...state.sentAlerts, action.payload],
      };
    case 'SEND_ALERT_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'RECEIVE_ALERT':
      return {
        ...state,
        receivedAlerts: [...state.receivedAlerts, action.payload],
      };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    default:
      return state;
  }
}

const GymBuddyAlertContext = createContext<AlertContextValue | undefined>(undefined);

export function GymBuddyAlertProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(alertReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);
  const subscriptionsRef = useRef<any[]>([]);

  // Initialize services
  useEffect(() => {
    let mounted = true;
    
    const initialize = async () => {
      try {
        console.log('[GymBuddyAlertProvider] Starting initialization...');
        
        // Ensure Firebase is initialized
        await firebaseCore.ensureInitialized();
        if (!mounted) return;
        
        // Initialize notification service
        console.log('[GymBuddyAlertProvider] Initializing notifications...');
        const notificationService = await getNotificationService();
        await notificationService.initialize();
        
        // Set up notification listeners
        const subscription = notificationService.addNotificationReceivedListener(
          (notification) => {
            const data = notification.request.content.data;
            
            // Check if this is a workout invitation
            if (data?.type === 'GYM_INVITE' || data?.isWorkoutInvite) {
              const user = firebaseCore.getCurrentUser();
              if (!user) return;

              if (data.notificationId && data.senderId) {
                dispatch({
                  type: 'RECEIVE_ALERT',
                  payload: {
                    id: data.notificationId as string,
                    senderId: data.senderId as string,
                    senderName: data.senderName as string || 'Friend',
                    receiverId: user.uid,
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    type: 'GYM_INVITE',
                    message: notification.request.content.body || "Let's hit the gym!",
                    gymName: data.gymName as string,
                    time: data.time as string
                  }
                });
              }
            }
          }
        );
        subscriptionsRef.current.push(subscription);

        // Add notification response listener
        const responseSubscription = notificationService.addNotificationResponseReceivedListener(
          async (response) => {
            const data = response.notification.request.content.data;
            console.log('Notification response received:', response.actionIdentifier, data);
            
            // Handle workout invitation responses
            if (data?.notificationId && 
                (data?.type === 'GYM_INVITE' || data?.isWorkoutInvite || data?.type === 'workout')) {
                
              try {
                // Determine if accepted or declined
                const accept = response.actionIdentifier === 'accept' ? 'accepted' : 'declined';
                
                // Respond to the workout invitation
                await friendNotificationService.respondToWorkoutInvite(
                  data.notificationId as string, 
                  accept
                );
                
                console.log(`Workout invitation ${accept}`);
                
                // Also update local state
                respondToAlert(data.notificationId as string, accept === 'accepted' ? 'accept' : 'decline');
              } catch (error) {
                console.error('Error responding to workout invitation:', error);
                Alert.alert('Error', 'Failed to respond to workout invitation');
              }
            }
          }
        );
        subscriptionsRef.current.push(responseSubscription);

        // Set up auth state listener
        const authUnsubscribe = firebaseCore.onAuthStateChanged((user) => {
          if (mounted) {
            dispatch({ type: 'SET_AUTHENTICATED', payload: !!user });
          }
        });
        subscriptionsRef.current.push(authUnsubscribe);

        if (mounted) {
          console.log('[GymBuddyAlertProvider] Initialization completed successfully');
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('[GymBuddyAlertProvider] Initialization error:', error);
        if (mounted) {
          Alert.alert(
            'Initialization Error',
            'Failed to initialize some features. Some functionality may be limited.'
          );
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
      // Cleanup subscriptions
      subscriptionsRef.current.forEach(async (sub) => {
        try {
          if (typeof sub === 'function') {
            sub();
          } else {
            const notificationService = await getNotificationService();
            notificationService.removeSubscription(sub);
          }
        } catch (error) {
          console.error('[GymBuddyAlertProvider] Error cleaning up subscription:', error);
        }
      });
      subscriptionsRef.current = [];
    };
  }, []);

  const sendCustomMessageAlert = useCallback(async (recipientId: string, message: string): Promise<CustomMessageAlert> => {
    if (!state.isAuthenticated) {
      Alert.alert('Authentication Required', 'Please sign in to send alerts');
      throw new Error('Not authenticated');
    }

    dispatch({ type: 'SEND_ALERT_START' });
    try {
      const newAlert = await gymBuddyAlertService.sendAlert(recipientId, message, 'CUSTOM_MESSAGE');
      dispatch({ type: 'SEND_ALERT_SUCCESS', payload: newAlert });
      return newAlert as CustomMessageAlert;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send alert';
      Alert.alert('Error', errorMessage);
      dispatch({ type: 'SEND_ALERT_ERROR', payload: errorMessage });
      throw error;
    }
  }, [state.isAuthenticated]);

  const sendGymInvite = useCallback(async (recipientId: string, gymName?: string, time?: string): Promise<GymInviteAlert> => {
    if (!state.isAuthenticated) {
      Alert.alert('Authentication Required', 'Please sign in to send gym invites');
      throw new Error('Not authenticated');
    }

    dispatch({ type: 'SEND_ALERT_START' });
    try {
      // Use the friendNotificationService for sending workout invitations
      const notificationId = await friendNotificationService.sendWorkoutInvite(
        firebaseCore.getCurrentUser()?.uid || '',
        recipientId,
        gymName,
        time
      );
      
      // Create a GymInviteAlert object for state management
      const newAlert: GymInviteAlert = {
        id: notificationId,
        senderId: firebaseCore.getCurrentUser()?.uid || '',
        senderName: firebaseCore.getCurrentUser()?.displayName || 'You',
        receiverId: recipientId,
        status: 'pending',
        createdAt: new Date().toISOString(),
        type: 'GYM_INVITE',
        message: `Let's hit the gym${gymName ? ` at ${gymName}` : ''}${time ? ` at ${time}` : ''}!`,
        gymName,
        time
      };
      
      dispatch({ type: 'SEND_ALERT_SUCCESS', payload: newAlert });
      return newAlert;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send gym invite';
      Alert.alert('Error', errorMessage);
      dispatch({ type: 'SEND_ALERT_ERROR', payload: errorMessage });
      throw error;
    }
  }, [state.isAuthenticated]);

  const respondToAlert = useCallback(async (alertId: string, accept: 'accept' | 'decline'): Promise<void> => {
    try {
      // Find the alert in received alerts
      const alert = state.receivedAlerts.find(a => a.id === alertId);
      if (!alert) {
        throw new Error('Alert not found');
      }

      // Call the appropriate service based on alert type
      if (alert.type === 'GYM_INVITE') {
        await friendNotificationService.respondToWorkoutInvite(
          alertId, 
          accept === 'accept' ? 'accepted' : 'declined'
        );
      } else {
        await gymBuddyAlertService.respondToAlert(alertId, accept);
      }

      // Update UI optimistically
      const updatedAlert = {
        ...alert,
        status: accept === 'accept' ? 'accepted' : 'declined'
      };

      dispatch({
        type: 'SEND_ALERT_SUCCESS',
        payload: updatedAlert
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to respond to alert';
      Alert.alert('Error', errorMessage);
    }
  }, [state.receivedAlerts]);

  const value: AlertContextValue = {
    ...state,
    sendCustomMessageAlert,
    sendGymInvite,
    respondToAlert,
  };

  return (
    <GymBuddyAlertContext.Provider value={value}>
      {children}
    </GymBuddyAlertContext.Provider>
  );
}

export const useGymBuddyAlerts = () => {
  const context = useContext(GymBuddyAlertContext);
  if (!context) {
    throw new Error('useGymBuddyAlerts must be used within a GymBuddyAlertProvider');
  }
  return context;
};
