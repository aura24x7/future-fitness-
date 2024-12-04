import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Vibration } from 'react-native';
import { gymBuddyAlertService } from '../services/gymBuddyAlertService';
import { GymBuddyAlertState, GymBuddyAlert } from '../types/gymBuddyAlert';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface GymBuddyAlert {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: number;
}

interface GymBuddyAlertState {
  sentAlerts: GymBuddyAlert[];
  receivedAlerts: GymBuddyAlert[];
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

type GymBuddyAlertAction =
  | { type: 'SEND_ALERT_START' }
  | { type: 'SEND_ALERT_SUCCESS'; payload: GymBuddyAlert }
  | { type: 'SEND_ALERT_ERROR'; payload: string }
  | { type: 'RECEIVE_ALERT'; payload: GymBuddyAlert }
  | { type: 'UPDATE_ALERT_STATUS'; payload: { alertId: string; status: 'accepted' | 'rejected' } }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

const initialState: GymBuddyAlertState = {
  sentAlerts: [],
  receivedAlerts: [],
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

function gymBuddyAlertReducer(
  state: GymBuddyAlertState,
  action: GymBuddyAlertAction
): GymBuddyAlertState {
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
      return {
        ...state,
        receivedAlerts: state.receivedAlerts.map(alert =>
          alert.id === action.payload.alertId
            ? { ...alert, status: action.payload.status }
            : alert
        ),
        sentAlerts: state.sentAlerts.map(alert =>
          alert.id === action.payload.alertId
            ? { ...alert, status: action.payload.status }
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

const GymBuddyAlertContext = createContext<{
  state: GymBuddyAlertState;
  sendAlert: (recipientId: string, message: string) => Promise<void>;
  respondToAlert: (alertId: string, accept: boolean) => Promise<void>;
} | undefined>(undefined);

export function GymBuddyAlertProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gymBuddyAlertReducer, initialState);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatch({ type: 'SET_AUTHENTICATED', payload: !!user });
    });

    return () => unsubscribe();
  }, []);

  const sendAlert = useCallback(async (recipientId: string, message: string) => {
    if (!state.isAuthenticated) {
      dispatch({ type: 'SEND_ALERT_ERROR', payload: 'Please sign in to send alerts' });
      return;
    }

    dispatch({ type: 'SEND_ALERT_START' });
    try {
      const newAlert = await gymBuddyAlertService.sendAlert(recipientId, message);
      dispatch({ type: 'SEND_ALERT_SUCCESS', payload: newAlert });
    } catch (error) {
      dispatch({ 
        type: 'SEND_ALERT_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to send alert' 
      });
    }
  }, [state.isAuthenticated]);

  const respondToAlert = useCallback(async (alertId: string, accept: boolean) => {
    if (!state.isAuthenticated) {
      dispatch({ type: 'SEND_ALERT_ERROR', payload: 'Please sign in to respond to alerts' });
      return;
    }

    const status = accept ? 'accepted' : 'rejected';
    try {
      await gymBuddyAlertService.respondToAlert(alertId, status);
      dispatch({
        type: 'UPDATE_ALERT_STATUS',
        payload: { alertId, status },
      });
    } catch (error) {
      console.error('Error responding to alert:', error);
    }
  }, [state.isAuthenticated]);

  return (
    <GymBuddyAlertContext.Provider value={{ state, sendAlert, respondToAlert }}>
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
