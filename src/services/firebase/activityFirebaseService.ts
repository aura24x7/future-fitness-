import { Timestamp } from '@react-native-firebase/firestore';
import { ActivityLog, ActivitySettings, ActivityType } from '../../types/activity';
import firebaseService from '../../config/firebase';

const COLLECTION = {
  ACTIVITY_LOGS: 'activity_logs',
  ACTIVITY_SETTINGS: 'activity_settings',
  CUSTOM_ACTIVITY_TYPES: 'activity_types',
};

export const activityFirebaseService = {
  // Activity Logs
  async syncActivityLogs(userId: string, logs: ActivityLog[]): Promise<void> {
    try {
      const db = firebaseService.getFirestore();
      const batch = db.batch();
      const logsRef = db.collection(COLLECTION.ACTIVITY_LOGS);

      logs.forEach(log => {
        const docRef = logsRef.doc(log.id);
        batch.set(docRef, {
          ...log,
          userId,
          timestamp: Timestamp.fromDate(new Date(log.timestamp)),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error syncing activity logs:', error);
      throw error;
    }
  },

  async getActivityLogs(userId: string, startDate?: Date, endDate?: Date): Promise<ActivityLog[]> {
    try {
      const db = firebaseService.getFirestore();
      let query = db.collection(COLLECTION.ACTIVITY_LOGS)
        .where('userId', '==', userId);

      if (startDate) {
        query = query.where('timestamp', '>=', Timestamp.fromDate(startDate));
      }
      if (endDate) {
        query = query.where('timestamp', '<=', Timestamp.fromDate(endDate));
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        timestamp: doc.data().timestamp.toDate().toISOString(),
      })) as ActivityLog[];
    } catch (error) {
      console.error('Error getting activity logs:', error);
      throw error;
    }
  },

  // Activity Settings
  async syncActivitySettings(userId: string, settings: ActivitySettings): Promise<void> {
    try {
      const db = firebaseService.getFirestore();
      await db.collection(COLLECTION.ACTIVITY_SETTINGS)
        .doc(userId)
        .set(settings, { merge: true });
    } catch (error) {
      console.error('Error syncing activity settings:', error);
      throw error;
    }
  },

  async getActivitySettings(userId: string): Promise<ActivitySettings | null> {
    try {
      const db = firebaseService.getFirestore();
      const doc = await db.collection(COLLECTION.ACTIVITY_SETTINGS)
        .doc(userId)
        .get();

      return doc.exists ? (doc.data() as ActivitySettings) : null;
    } catch (error) {
      console.error('Error getting activity settings:', error);
      throw error;
    }
  },

  // Custom Activity Types
  async syncCustomActivityTypes(userId: string, types: ActivityType[]): Promise<void> {
    try {
      const db = firebaseService.getFirestore();
      const batch = db.batch();
      const typesRef = db.collection(COLLECTION.CUSTOM_ACTIVITY_TYPES);

      types.forEach(type => {
        const docRef = typesRef.doc(`${userId}_${type.id}`);
        batch.set(docRef, { ...type, userId });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error syncing custom activity types:', error);
      throw error;
    }
  },

  async getCustomActivityTypes(userId: string): Promise<ActivityType[]> {
    try {
      const db = firebaseService.getFirestore();
      const snapshot = await db.collection(COLLECTION.CUSTOM_ACTIVITY_TYPES)
        .where('userId', '==', userId)
        .get();

      return snapshot.docs.map(doc => doc.data() as ActivityType);
    } catch (error) {
      console.error('Error getting custom activity types:', error);
      throw error;
    }
  },
};