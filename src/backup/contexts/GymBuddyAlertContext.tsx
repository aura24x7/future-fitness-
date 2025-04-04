import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Vibration, Alert } from 'react-native';
import { gymBuddyAlertService } from '../services/gymBuddyAlertService';
import { 
  GymBuddyAlert,
  CustomMessageAlert,
  GymInviteAlert,
  AlertResponse,
  BaseAlert
} from '../types/gymBuddyAlert';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { notificationService } from '../services/notificationService';

// State interface
interface AlertContextState {
  sentAlerts: GymBuddyAlert[];
  receivedAlerts: GymBuddyAlert[];
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Action types
type AlertContextAction =
  | { type: 'SEND_ALERT_START' }
  | { type: 'SEND_ALERT_SUCCESS'; payload: GymBuddyAlert }
  | { type: 'SEND_ALERT_ERROR'; payload: string }
  | { type: 'RECEIVE_ALERT'; payload: GymBuddyAlert }
  | { type: 'UPDATE_ALERT_STATUS'; payload: AlertResponse }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

const initialState: AlertContextState = {
  sentAlerts: [],
  receivedAlerts: [],
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

function alertReducer(
  state: AlertContextState,
  action: AlertContextAction
): AlertContextState {
  switch (action.type) {
    case 'SEND_ALERT_START':
      return { ...state, isLoading: true, error: null };
    case 'SEND_ALERT_SUCCESS':
      return {
        ...state,
        sentAlerts: [...state.sentAlerts, action.payload],
        isLoading: false,
      };
    case 'SEND_ALERT_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'RECEIVE_ALERT':
      Vibration.vibrate(500);
      return {
        ...state,
        receivedAlerts: [...state.receivedAlerts, action.payload],
      };
    case 'UPDATE_ALERT_STATUS':
      const status = action.payload.response === 'accept' ? 'accepted' : 'declined';
      return {
        ...state,
        receivedAlerts: state.receivedAlerts.map(alert =>
          alert.id === action.payload.alertId
            ? { ...alert, status }
            : alert
        ),
        sentAlerts: state.sentAlerts.map(alert =>
          alert.id === action.payload.alertId
            ? { ...alert, status }
            : alert
        ),
      };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

interface AlertContextValue {
  state: AlertContextState;
  sendAlert: (recipientId: string, message: string) => Promise<CustomMessageAlert>;
  sendGymInvite: (recipientId: string) => Promise<GymInviteAlert>;
  respondToAlert: (alertId: string, accept: boolean) => Promise<void>;
}

const GymBuddyAlertContext = createContext<AlertContextValue | undefined>(undefined);

export function GymBuddyAlertProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(alertReducer, initialState);

  // Initialize notifications
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        await notificationService.initialize();
        
        // Add notification received listener
        const subscription = notificationService.addNotificationReceivedListener(
          (notification) => {
            const data = notification.request.content.data;
            if (data?.type === 'GYM_INVITE') {
              // For testing: Automatically add received alerts to state
              if (data.alertId && data.senderId) {
                dispatch({
                  type: 'RECEIVE_ALERT',
                  payload: {
                    id: data.alertId as string,
                    senderId: data.senderId as string,
                    senderName: data.senderName as string,
                    receiverId: auth.currentUser?.uid || '',
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    type: 'GYM_INVITE',
                    message: "Let's hit the gym!"
                  }
                });
              }
              Vibration.vibrate([0, 500, 200, 500]);
            }
          }
        );

        // Add notification response listener
        const responseSubscription = notificationService.addNotificationResponseReceivedListener(
          (response) => {
            const data = response.notification.request.content.data;
            if (data?.alertId) {
              // Handle notification response
              const accept = response.actionIdentifier === 'accept';
              respondToAlert(data.alertId as string, accept);
            }
          }
        );

        return () => {
          notificationService.removeSubscription(subscription);
          notificationService.removeSubscription(responseSubscription);
        };
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
        Alert.alert(
          'Notification Error',
          'Failed to initialize notifications. Some features may not work properly.'
        );
      }
    };

    initializeNotifications();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatch({ type: 'SET_AUTHENTICATED', payload: !!user });
    });

    return () => unsubscribe();
  }, []);

  const sendAlert = useCallback(async (recipientId: string, message: string): Promise<CustomMessageAlert> => {
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

  const sendGymInvite = useCallback(async (recipientId: string): Promise<GymInviteAlert> => {
    if (!state.isAuthenticated) {
      Alert.alert('Authentication Required', 'Please sign in to send gym invites');
      throw new Error('Not authenticated');
    }

    dispatch({ type: 'SEND_ALERT_START' });
    try {
      // For testing: Allow sending to self
      const currentUser = auth.currentUser;
      const newAlert = await gymBuddyAlertService.sendAlert(
        recipientId,
        "Let's hit the gym!",
        'GYM_INVITE'
      );

      // For testing: If sending to self, immediately add to received alerts
      if (currentUser && recipientId === currentUser.uid) {
        dispatch({
          type: 'RECEIVE_ALERT',
          payload: {
            ...newAlert,
            receiverId: currentUser.uid,
          }
        });
      }

      Alert.alert('Success', 'Gym invite sent successfully!');
      dispatch({ type: 'SEND_ALERT_SUCCESS', payload: newAlert });
      return newAlert as GymInviteAlert;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send gym invite';
      Alert.alert('Error', errorMessage);
      dispatch({ type: 'SEND_ALERT_ERROR', payload: errorMessage });
      throw error;
    }
  }, [state.isAuthenticated]);

  const respondToAlert = useCallback(async (alertId: string, accept: boolean) => {
    if (!state.isAuthenticated) {
      Alert.alert('Authentication Required', 'Please sign in to respond to alerts');
      return;
    }

    try {
      const response = accept ? 'accept' : 'decline';
      await gymBuddyAlertService.respondToAlert(alertId, response);
      
      // Update local state
      dispatch({
        type: 'UPDATE_ALERT_STATUS',
        payload: { 
          alertId, 
          response,
          respondedAt: new Date().toISOString()
        },
      });

      // Show response feedback
      Alert.alert(
        'Response Sent',
        accept ? 'You accepted the gym invite!' : 'You declined the gym invite.'
      );
    } catch (error) {
      console.error('Error responding to alert:', error);
      Alert.alert('Error', 'Failed to respond to the alert');
      throw error;
    }
  }, [state.isAuthenticated]);

  return (
    <GymBuddyAlertContext.Provider value={{ 
      state, 
      sendAlert, 
      sendGymInvite,
      respondToAlert 
    }}>
      {children}
    </GymBuddyAlertContext.Provider>
  );
}

export function useGymBuddyAlert() {
  const context = useContext(GymBuddyAlertContext);
  if (context === undefined) {
    throw new Error('useGymBuddyAlert must be used within a GymBuddyAlertProvider');
  }
  return context;
}
