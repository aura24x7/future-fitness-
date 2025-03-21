import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { mealStorageService } from './mealStorageService';
import { analyticsService } from './analyticsService';
import { sanitizeData } from '../utils/firebaseUtils';
import { handleFirebaseError } from '../utils/errorUtils';

class AuthService {
  private static instance: AuthService;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Auth methods
  async signIn(email: string, password: string) {
    try {
      return await auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
      throw handleFirebaseError(error);
    }
  }

  async signUp(email: string, password: string) {
    try {
      return await auth().createUserWithEmailAndPassword(email, password);
    } catch (error) {
      throw handleFirebaseError(error);
    }
  }

  async signOut() {
    try {
      await auth().signOut();
    } catch (error) {
      throw handleFirebaseError(error);
    }
  }

  async resetPassword(email: string) {
    try {
      return await auth().sendPasswordResetEmail(email);
    } catch (error) {
      throw handleFirebaseError(error);
    }
  }

  getCurrentUser() {
    return auth().currentUser;
  }

  async onUserAuthenticated(): Promise<void> {
    try {
      const user = auth().currentUser;
      console.log(`[Auth] User authenticated: ${user?.uid}`);
      
      // Verify Firestore access
      const userDocRef = firestore().collection('users').doc(user!.uid);
      console.log(`[Auth] Verifying Firestore access to user document: ${userDocRef.path}`);
      await userDocRef.set({
        lastAccess: firestore.Timestamp.now(),
        email: user!.email,
      }, { merge: true });
      console.log('[Auth] Successfully verified Firestore access');

      // Load user's meals from Firestore
      await mealStorageService.loadUserMeals();
      
      // Get all meals to calculate storage usage
      const now = new Date();
      const startOfTime = new Date(0);
      const meals = await mealStorageService.getMealsInRange(startOfTime, now);
      
      // Log analytics event
      await analyticsService.logStorageUsage({
        totalDocuments: meals.length,
        totalSize: 0,
        collectionName: 'meals',
      });
      
      console.log('[Auth] Successfully completed onUserAuthenticated flow');
    } catch (error: any) {
      console.error('[Auth] Error in onUserAuthenticated:', error);
      throw handleFirebaseError(error);
    }
  }
}

export const authService = AuthService.getInstance();