import { SocialState, SocialAction, User, Notification } from '../types/social';

export const initialState: SocialState = {
  individuals: {
    data: [],
    loading: false,
    error: null,
    lastFetched: null,
  },
  notifications: {
    sent: [],
    received: [],
  }
};

export function socialReducer(
  state: SocialState = initialState,
  action: SocialAction
): SocialState {
  switch (action.type) {
    case 'FETCH_INDIVIDUALS_START':
      return {
        ...state,
        individuals: {
          ...state.individuals,
          loading: true,
          error: null,
        },
      };

    case 'FETCH_INDIVIDUALS_SUCCESS':
      return {
        ...state,
        individuals: {
          data: action.payload,
          loading: false,
          error: null,
          lastFetched: Date.now(),
        },
      };

    case 'FETCH_INDIVIDUALS_ERROR':
      return {
        ...state,
        individuals: {
          ...state.individuals,
          loading: false,
          error: action.payload,
          lastFetched: null,
        },
      };

    case 'ADD_INDIVIDUAL':
      // Prevent duplicates
      if (state.individuals.data.some((user: User) => user.id === action.payload.id)) {
        return state;
      }
      
      return {
        ...state,
        individuals: {
          ...state.individuals,
          data: [...state.individuals.data, action.payload],
        },
      };

    case 'REMOVE_INDIVIDUAL':
      return {
        ...state,
        individuals: {
          ...state.individuals,
          data: state.individuals.data.filter((user: User) => user.id !== action.payload),
        },
      };

    case 'NOTIFICATION_SENT':
      const newNotification: Notification = {
        id: Date.now().toString(),
        userId: action.payload.userId,
        message: action.payload.message,
        timestamp: action.payload.timestamp,
        status: 'sent',
      };
      
      return {
        ...state,
        notifications: {
          ...state.notifications,
          sent: [...state.notifications.sent, newNotification],
        },
      };

    case 'NOTIFICATION_RECEIVED':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          received: [...state.notifications.received, action.payload],
        },
      };

    default:
      return state;
  }
} 