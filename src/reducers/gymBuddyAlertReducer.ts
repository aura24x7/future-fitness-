import { GymBuddyAlertState, GymBuddyAlertAction } from '../types/gymBuddyAlert';

export const initialState: GymBuddyAlertState = {
  sentAlerts: [],
  receivedAlerts: [],
  loading: false,
  error: null,
};

export function gymBuddyAlertReducer(
  state: GymBuddyAlertState = initialState,
  action: GymBuddyAlertAction
): GymBuddyAlertState {
  switch (action.type) {
    case 'SEND_ALERT_START':
      return {
        ...state,
        loading: true,
        error: null,
      };

    case 'SEND_ALERT_SUCCESS':
      return {
        ...state,
        loading: false,
        sentAlerts: [action.payload, ...state.sentAlerts],
      };

    case 'SEND_ALERT_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case 'RECEIVE_ALERT':
      // Only add if not already present
      if (!state.receivedAlerts.some(alert => alert.id === action.payload.id)) {
        return {
          ...state,
          receivedAlerts: [action.payload, ...state.receivedAlerts],
        };
      }
      return state;

    case 'UPDATE_ALERT_STATUS':
      return {
        ...state,
        receivedAlerts: state.receivedAlerts.map(alert =>
          alert.id === action.payload.alertId
            ? {
                ...alert,
                status: action.payload.response === 'accept' ? 'accepted' : 'declined',
                responseAt: action.payload.respondedAt,
              }
            : alert
        ),
        sentAlerts: state.sentAlerts.map(alert =>
          alert.id === action.payload.alertId
            ? {
                ...alert,
                status: action.payload.response === 'accept' ? 'accepted' : 'declined',
                responseAt: action.payload.respondedAt,
              }
            : alert
        ),
      };

    case 'CLEAR_ALERT':
      return {
        ...state,
        receivedAlerts: state.receivedAlerts.filter(
          alert => alert.id !== action.payload
        ),
        sentAlerts: state.sentAlerts.filter(
          alert => alert.id !== action.payload
        ),
      };

    case 'SET_RECEIVED_ALERTS':
      return {
        ...state,
        receivedAlerts: action.payload,
      };

    case 'SET_SENT_ALERTS':
      return {
        ...state,
        sentAlerts: action.payload,
      };

    default:
      return state;
  }
}
