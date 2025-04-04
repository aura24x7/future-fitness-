// User type
export interface User {
  id: string;
  name: string;
  email?: string;
  image?: string;
  status?: string;
  goals?: string[];
  last_active?: string;
}

// Notification type
export interface Notification {
  id: string;
  userId: string;
  message: string;
  timestamp: string;
  status: 'sent' | 'received' | 'read';
}

// State slice for individuals
interface IndividualsState {
  data: User[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

// State slice for notifications
interface NotificationsState {
  sent: Notification[];
  received: Notification[];
}

// Combined state
export interface SocialState {
  individuals: IndividualsState;
  notifications: NotificationsState;
}

// Action types
export type SocialAction =
  | { type: 'FETCH_INDIVIDUALS_START' }
  | { type: 'FETCH_INDIVIDUALS_SUCCESS'; payload: User[] }
  | { type: 'FETCH_INDIVIDUALS_ERROR'; payload: string }
  | { type: 'ADD_INDIVIDUAL'; payload: User }
  | { type: 'REMOVE_INDIVIDUAL'; payload: string }
  | { type: 'NOTIFICATION_SENT'; payload: { userId: string; message: string; timestamp: string } }
  | { type: 'NOTIFICATION_RECEIVED'; payload: Notification }; 