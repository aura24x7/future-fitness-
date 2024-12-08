import { auth, firestore } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  doc,
  onSnapshot,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { GymBuddyAlert, AlertResponse } from '../types/gymBuddyAlert';

class GymBuddyAlertService {
  private alertsCollection = collection(firestore, 'gym_buddy_alerts');
  private usersCollection = collection(firestore, 'users');

  private async getUserName(userId: string): Promise<string> {
    try {
      const userDoc = await getDoc(doc(this.usersCollection, userId));
      if (userDoc.exists()) {
        return userDoc.data().name || 'Unknown User';
      }
      return 'Unknown User';
    } catch (error) {
      console.error('Error getting user name:', error);
      return 'Unknown User';
    }
  }

  async sendAlert(receiverId: string, message: string): Promise<GymBuddyAlert> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user');

      const [senderName, receiverName] = await Promise.all([
        this.getUserName(currentUser.uid),
        this.getUserName(receiverId)
      ]);

      const alert: Omit<GymBuddyAlert, 'id'> = {
        senderId: currentUser.uid,
        receiverId,
        message,
        status: 'pending',
        createdAt: new Date().toISOString(),
        senderName,
        receiverName
      };

      const docRef = await addDoc(this.alertsCollection, {
        ...alert,
        createdAt: Timestamp.now()
      });

      return { ...alert, id: docRef.id };
    } catch (error) {
      console.error('Error sending alert:', error);
      throw error;
    }
  }

  async respondToAlert(alertId: string, response: 'accept' | 'decline'): Promise<void> {
    try {
      const alertRef = doc(this.alertsCollection, alertId);
      await updateDoc(alertRef, {
        status: response === 'accept' ? 'accepted' : 'declined',
        responseAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error responding to alert:', error);
      throw error;
    }
  }

  subscribeToReceivedAlerts(callback: (alerts: GymBuddyAlert[]) => void) {
    const currentUser = auth.currentUser;
    if (!currentUser) return () => {};

    const q = query(
      this.alertsCollection,
      where('receiverId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const alerts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate().toISOString(),
        responseAt: doc.data().responseAt?.toDate().toISOString()
      } as GymBuddyAlert));
      callback(alerts);
    });
  }

  subscribeToPendingAlerts(callback: (alerts: GymBuddyAlert[]) => void) {
    const currentUser = auth.currentUser;
    if (!currentUser) return () => {};

    const q = query(
      this.alertsCollection,
      where('receiverId', '==', currentUser.uid),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const alerts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate().toISOString(),
        responseAt: doc.data().responseAt?.toDate().toISOString()
      } as GymBuddyAlert));
      callback(alerts);
    });
  }

  async getSentAlerts(): Promise<GymBuddyAlert[]> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user');

      const q = query(
        this.alertsCollection,
        where('senderId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate().toISOString(),
        responseAt: doc.data().responseAt?.toDate().toISOString()
      } as GymBuddyAlert));
    } catch (error) {
      console.error('Error getting sent alerts:', error);
      throw error;
    }
  }
}

export const gymBuddyAlertService = new GymBuddyAlertService();
