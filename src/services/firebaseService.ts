import { auth, firestore } from '../config/firebase';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { UserProfile } from './userProfileService';

class FirebaseService {
  private static instance: FirebaseService;
  private usersCollection = 'users';

  private constructor() {}

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  private sanitizeData(data: any): any {
    // Remove undefined values
    const sanitized = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    return sanitized;
  }

  async createOrUpdateUserProfile(profile: UserProfile): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const userRef = doc(firestore, this.usersCollection, user.uid);
      const userDoc = await getDoc(userRef);

      const userData = this.sanitizeData({
        id: user.uid,
        email: user.email,
        name: profile.name || '',
        birthday: profile.birthday ? Timestamp.fromDate(new Date(profile.birthday)) : null,
        gender: profile.gender || null,
        fitnessGoal: profile.fitnessGoal || null,
        activityLevel: profile.activityLevel || null,
        dietaryPreference: profile.dietaryPreference || null,
        workoutPreference: profile.workoutPreference || null,
        country: profile.country || null,
        state: profile.state || null,
        height: profile.height ? {
          value: profile.height.value || 0,
          unit: profile.height.unit || 'cm'
        } : null,
        weight: profile.weight ? {
          value: profile.weight.value || 0,
          unit: profile.weight.unit || 'kg'
        } : null,
        targetWeight: profile.targetWeight ? {
          value: profile.targetWeight.value || 0,
          unit: profile.targetWeight.unit || 'kg'
        } : null,
        weightGoal: profile.weightGoal || null,
        metrics: profile.metrics || null,
        preferences: profile.preferences || {
          notifications: true,
          measurementSystem: 'metric',
          language: 'en'
        },
        updatedAt: serverTimestamp()
      });

      if (!userDoc.exists()) {
        // Create new profile
        await setDoc(userRef, {
          ...userData,
          createdAt: serverTimestamp()
        });
      } else {
        // Update existing profile
        await updateDoc(userRef, userData);
      }
    } catch (error) {
      console.error('Error saving user profile to Firebase:', error);
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(firestore, this.usersCollection, userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return null;
      }

      const data = userDoc.data();
      
      // Convert Firestore Timestamps to Dates
      const createdAt = data.createdAt?.toDate?.() || new Date();
      const updatedAt = data.updatedAt?.toDate?.() || new Date();
      const birthday = data.birthday?.toDate?.() || null;

      return {
        ...data,
        createdAt,
        updatedAt,
        birthday,
      } as UserProfile;
    } catch (error) {
      console.error('Error getting user profile from Firebase:', error);
      throw error;
    }
  }

  async deleteUserProfile(userId: string): Promise<void> {
    try {
      const userRef = doc(firestore, this.usersCollection, userId);
      await setDoc(userRef, {
        deleted: true,
        deletedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error deleting user profile:', error);
      throw error;
    }
  }
}

export const firebaseService = FirebaseService.getInstance();
