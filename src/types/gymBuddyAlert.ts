export interface GymBuddyAlert {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  responseAt?: string;
  senderName?: string;
  receiverName?: string;
}

export interface AlertResponse {
  alertId: string;
  response: 'accept' | 'decline';
  respondedAt: string;
}

export interface GymBuddyAlertState {
  sentAlerts: GymBuddyAlert[];
  receivedAlerts: GymBuddyAlert[];
  loading: boolean;
  error: string | null;
}

export type GymBuddyAlertAction =
  | { type: 'SEND_ALERT_START' }
  | { type: 'SEND_ALERT_SUCCESS'; payload: GymBuddyAlert }
  | { type: 'SEND_ALERT_ERROR'; payload: string }
  | { type: 'RECEIVE_ALERT'; payload: GymBuddyAlert }
  | { type: 'UPDATE_ALERT_STATUS'; payload: AlertResponse }
  | { type: 'CLEAR_ALERT'; payload: string }
  | { type: 'SET_RECEIVED_ALERTS'; payload: GymBuddyAlert[] }
  | { type: 'SET_SENT_ALERTS'; payload: GymBuddyAlert[] };
