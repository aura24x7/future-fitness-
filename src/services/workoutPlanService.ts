import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutPlan, SharedWorkoutPlanView, WorkoutPlanShare } from '../types/workout';

// Import from the centralized Firebase initialization
import { initializeFirebase } from '../services/firebase/firebaseInit';

// Use dynamically imported Firebase instead of direct imports
let firestore: any = null;
let auth: any = null;

// Function to get Firebase modules safely
const getFirebaseModules = async () => {
  try {
    // Try to initialize Firebase first
    await initializeFirebase();
    
    // Try to import React Native Firebase modules
    try {
      const firestoreModule = require('@react-native-firebase/firestore').default;
      firestore = firestoreModule();
      const authModule = require('@react-native-firebase/auth').default;
      auth = authModule();
      console.log('[WorkoutPlanService] Using React Native Firebase modules');
      return true;
    } catch (nativeError) {
      // If React Native modules fail, try web Firebase modules
      try {
        // Import from the centralized functions in firebaseInit.ts
        const { getFirebaseFirestore, getFirebaseAuth } = require('../services/firebase/firebaseInit');
        firestore = getFirebaseFirestore();
        auth = getFirebaseAuth();
        console.log('[WorkoutPlanService] Using Web Firebase modules through compatibility layer');
        return true;
      } catch (webError) {
        console.error('[WorkoutPlanService] Failed to load Firebase modules:', webError);
        return false;
      }
    }
  } catch (error) {
    console.error('[WorkoutPlanService] Firebase initialization failed:', error);
    return false;
  }
};

// Mock data for development when Firestore isn't available
const MOCK_PLANS_STORAGE_KEY = '@mock_workout_plans';
const MOCK_SHARES_STORAGE_KEY = '@mock_workout_shares';

class WorkoutPlanService {
  private static instance: WorkoutPlanService;
  private plansCollection: any = null;
  private sharesCollection: any = null;
  private initialized = false;
  private useLocalStorage = false;

  private constructor() {
    // Add a one-time diagnostic call to list all plans in Firestore
    // This will help debug issues with plan loading
    setTimeout(() => {
      this.debugListAllFirestorePlans().catch(err => {
        console.warn("[WorkoutPlanService] Debug listing failed:", err);
      });

      // Try to ensure Firebase is properly initialized
      this.initialize().then(() => {
        console.log('[WorkoutPlanService] Initialization completed in constructor');
        
        // Double-check that collections are properly set up
        if (!this.useLocalStorage) {
          this.verifyFirestoreSetup().catch(err => {
            console.warn('[WorkoutPlanService] Firestore verification failed:', err);
          });
          
          // Migrate existing data from old structure to new structure
          this.migrateWorkoutPlansToUserSubcollections().catch(err => {
            console.warn('[WorkoutPlanService] Migration failed:', err);
          });
        }
      }).catch(err => {
        console.error('[WorkoutPlanService] Initialization in constructor failed:', err);
      });
    }, 3000); // Give Firebase auth time to initialize first
  }

  public static getInstance(): WorkoutPlanService {
    if (!WorkoutPlanService.instance) {
      WorkoutPlanService.instance = new WorkoutPlanService();
    }
    return WorkoutPlanService.instance;
  }

  private async initialize() {
    if (this.initialized) return;

    try {
      console.log('[WorkoutPlanService] Initializing...');
      
      // Load Firebase modules first
      const firebaseModulesLoaded = await getFirebaseModules();
      
      if (firebaseModulesLoaded) {
        try {
          // Check if Firebase auth is available
          try {
            const currentUser = auth?.currentUser;
            console.log(`[WorkoutPlanService] Firebase Auth status: ${currentUser ? 'Authenticated' : 'Not authenticated'}`);
          } catch (authError) {
            console.warn('[WorkoutPlanService] Firebase Auth check failed:', authError);
          }
          
          // Check if Firestore is available
          if (firestore) {
            // Store the firestore instance itself rather than collections
            // This allows us to use proper collection access methods for both web and native
            this.plansCollection = firestore;
            this.sharesCollection = firestore;
            this.useLocalStorage = false;
            console.log('[WorkoutPlanService] Firebase Firestore initialized successfully');
          } else {
            throw new Error('Firestore instance not available');
          }
        } catch (firestoreError) {
          console.warn('[WorkoutPlanService] Firestore initialization failed:', firestoreError);
          this.useLocalStorage = true;
        }
      } else {
        console.warn('[WorkoutPlanService] Firebase modules not loaded, using AsyncStorage fallback');
        this.useLocalStorage = true;
      }
      
      this.initialized = true;
      console.log('[WorkoutPlanService] Initialized successfully. Using local storage:', this.useLocalStorage);
    } catch (error) {
      console.error('[WorkoutPlanService] Initialization failed:', error);
      // Even if initialization fails, set initialized to true with local storage fallback
      this.initialized = true;
      this.useLocalStorage = true;
      console.log('[WorkoutPlanService] Falling back to local storage after initialization error');
    }
  }

  // Helper methods to get collections with proper handling for web/native
  private getPlansCollection() {
    if (!this.initialized) {
      throw new Error('[WorkoutPlanService] Service not initialized');
    }
    
    const userId = this.getCurrentUserId();
    if (userId === 'mock-user-id') {
      // For local storage mode, continue using the normal collection
      if (typeof this.plansCollection.collection === 'function') {
        return this.plansCollection.collection('workoutPlans');
      } else {
        const { collection } = require('firebase/firestore');
        return collection(this.plansCollection, 'workoutPlans');
      }
    }
    
    // Create a subcollection under the user document
    if (typeof this.plansCollection.collection === 'function') {
      // Native Firebase - subcollection approach
      return this.plansCollection.collection('users').doc(userId).collection('workoutPlans');
    } else {
      // Web Firebase - subcollection approach
      const { collection, doc } = require('firebase/firestore');
      const userDocRef = doc(this.plansCollection, 'users', userId);
      return collection(userDocRef, 'workoutPlans');
    }
  }

  private getSharesCollection() {
    if (!this.initialized) {
      throw new Error('[WorkoutPlanService] Service not initialized');
    }
    
    const userId = this.getCurrentUserId();
    if (userId === 'mock-user-id') {
      // For local storage mode, continue using the normal collection
      if (typeof this.sharesCollection.collection === 'function') {
        return this.sharesCollection.collection('workoutPlanShares');
      } else {
        const { collection } = require('firebase/firestore');
        return collection(this.sharesCollection, 'workoutPlanShares');
      }
    }
    
    // Create a subcollection under the user document
    if (typeof this.sharesCollection.collection === 'function') {
      // Native Firebase - subcollection approach
      return this.sharesCollection.collection('users').doc(userId).collection('workoutPlanShares');
    } else {
      // Web Firebase - subcollection approach
      const { collection, doc } = require('firebase/firestore');
      const userDocRef = doc(this.sharesCollection, 'users', userId);
      return collection(userDocRef, 'workoutPlanShares');
    }
  }

  private getCurrentUserId(): string {
    if (this.useLocalStorage) {
      return 'mock-user-id';
    }
    
    try {
      const user = auth?.currentUser;
    if (!user) {
        console.warn('[WorkoutPlanService] User not authenticated, falling back to mock user');
        return 'mock-user-id';
    }
    return user.uid;
    } catch (error) {
      console.warn('[WorkoutPlanService] Auth error, falling back to mock user:', error);
      return 'mock-user-id';
    }
  }

  // CRUD Operations
  async createWorkoutPlan(plan: Omit<WorkoutPlan, 'id' | 'ownerId' | 'createdAt'>): Promise<string> {
    await this.initialize();
    
    const userId = this.getCurrentUserId();
    const newPlan: WorkoutPlan = {
      ...plan,
      id: '',
      ownerId: userId,
      createdAt: new Date(),
      lastModified: new Date(),
      isShared: false,
      sharedWith: [],
    };

    let planId = '';
    
    console.log(`[WorkoutPlanService] Creating workout plan "${plan.name}" for user ${userId}`);
    console.log(`[WorkoutPlanService] Using local storage: ${this.useLocalStorage}`);
    
    // Always try Firebase first if the user is authenticated
    try {
      if (!this.useLocalStorage && userId !== 'mock-user-id') {
        console.log('[WorkoutPlanService] Attempting to save plan to Firebase...');
        const plansCollection = this.getPlansCollection();
        
        if (typeof firestore.collection === 'function') {
          // Native Firebase
          console.log('[WorkoutPlanService] Using native Firebase API to create plan');
          const docRef = await plansCollection.add(newPlan);
          await plansCollection.doc(docRef.id).update({ id: docRef.id });
          planId = docRef.id;
        } else {
          // Web Firebase
          console.log('[WorkoutPlanService] Using web Firebase API to create plan');
          const { addDoc, doc, updateDoc } = require('firebase/firestore');
          const docRef = await addDoc(plansCollection, newPlan);
          const docId = docRef.id;
          
          // Log the document reference for debugging
          console.log(`[WorkoutPlanService] Plan document created with ID: ${docId}`);
          console.log(`[WorkoutPlanService] Updating plan with its own ID...`);
          
          try {
            await updateDoc(doc(this.plansCollection, 'workoutPlans', docId), { id: docId });
            console.log(`[WorkoutPlanService] Plan ID updated successfully`);
          } catch (updateError) {
            console.error(`[WorkoutPlanService] Error updating plan with its ID:`, updateError);
            // Even if the update fails, we still have the plan created
          }
          
          planId = docId;
        }
        
        console.log(`[WorkoutPlanService] Successfully saved workout plan to Firebase with ID: ${planId}`);
        
        // Double check that the plan was properly saved
        try {
          const savedPlan = await this.getWorkoutPlan(planId);
          if (savedPlan) {
            console.log(`[WorkoutPlanService] Verified plan ${planId} was properly saved`);
          } else {
            console.warn(`[WorkoutPlanService] Could not verify plan ${planId} was saved, may need to retry`);
          }
        } catch (verifyError) {
          console.warn(`[WorkoutPlanService] Error verifying plan was saved:`, verifyError);
        }
      } else {
        // Fall back to local storage if Firebase isn't available
        console.log('[WorkoutPlanService] Using local storage fallback to create plan');
        planId = await this.createWorkoutPlanLocal(newPlan);
      }
    } catch (error) {
      console.warn('[WorkoutPlanService] Error saving to Firebase, falling back to local storage:', error);
      planId = await this.createWorkoutPlanLocal(newPlan);
    }
    
    // Also save to local storage as a backup
    if (!planId.startsWith('local-')) {
      try {
        const localPlans = await this.getLocalPlans();
        // Check if we already have this plan locally
        const existingIndex = localPlans.findIndex(p => p.id === planId);
        
        if (existingIndex >= 0) {
          // Update the existing plan
          localPlans[existingIndex] = { ...newPlan, id: planId };
        } else {
          // Add the plan to local storage
          localPlans.push({ ...newPlan, id: planId });
        }
        
        await AsyncStorage.setItem(MOCK_PLANS_STORAGE_KEY, JSON.stringify(localPlans));
        console.log(`[WorkoutPlanService] Also saved plan to local storage as backup`);
      } catch (localError) {
        console.warn('[WorkoutPlanService] Error saving plan to local storage backup:', localError);
      }
    }
    
    return planId;
  }

  private async createWorkoutPlanLocal(plan: WorkoutPlan): Promise<string> {
    const plans = await this.getLocalPlans();
    const id = `local-plan-${Date.now()}`;
    const newPlan = { ...plan, id };
    plans.push(newPlan);
    await AsyncStorage.setItem(MOCK_PLANS_STORAGE_KEY, JSON.stringify(plans));
    return id;
  }

  private async getLocalPlans(): Promise<WorkoutPlan[]> {
    const data = await AsyncStorage.getItem(MOCK_PLANS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private async getLocalShares(): Promise<WorkoutPlanShare[]> {
    const data = await AsyncStorage.getItem(MOCK_SHARES_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  async getWorkoutPlan(planId: string): Promise<WorkoutPlan | null> {
    await this.initialize();
    
    const userId = this.getCurrentUserId();
    
    // First check Firebase if authenticated and not using local storage
    if (!this.useLocalStorage && userId !== 'mock-user-id' && !planId.startsWith('local-')) {
      try {
        if (typeof firestore.collection === 'function') {
          // Native Firebase
          const doc = await this.getPlansCollection().doc(planId).get();
          if (doc.exists) {
            const plan = doc.data() as WorkoutPlan;
            console.log(`[WorkoutPlanService] Successfully fetched plan ${planId} from Firebase`);
            return plan;
          }
        } else {
          // Web Firebase
          const { doc, getDoc } = require('firebase/firestore');
          const docRef = doc(this.plansCollection, 'workoutPlans', planId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const plan = docSnap.data() as WorkoutPlan;
            console.log(`[WorkoutPlanService] Successfully fetched plan ${planId} from Firebase (web)`);
            return plan;
          }
        }
        console.log(`[WorkoutPlanService] Plan ${planId} not found in Firebase`);
      } catch (error) {
        console.warn(`[WorkoutPlanService] Error fetching plan ${planId} from Firebase, falling back to local storage:`, error);
      }
    }
    
    // Fallback to local storage
    const plans = await this.getLocalPlans();
    const plan = plans.find(p => p.id === planId);
    
    if (plan) {
      console.log(`[WorkoutPlanService] Successfully fetched plan ${planId} from local storage`);
    } else {
      console.log(`[WorkoutPlanService] Plan ${planId} not found in local storage`);
    }
    
    return plan || null;
  }

  async updateWorkoutPlan(planId: string, updates: Partial<WorkoutPlan>): Promise<void> {
    await this.initialize();
    
    const userId = this.getCurrentUserId();
    const plan = await this.getWorkoutPlan(planId);
    
    if (!plan) {
      throw new Error('Workout plan not found');
    }
    
    if (plan.ownerId !== userId && userId !== 'mock-user-id') {
      throw new Error('Not authorized to update this plan');
    }

    // Try Firebase first if authenticated and plan was created in Firebase
    if (!this.useLocalStorage && userId !== 'mock-user-id' && !planId.startsWith('local-')) {
      try {
        if (typeof firestore.collection === 'function') {
          // Native Firebase
          await this.getPlansCollection().doc(planId).update({
            ...updates,
            lastModified: new Date(),
          });
          console.log(`[WorkoutPlanService] Successfully updated plan ${planId} in Firebase`);
          return;
        } else {
          // Web Firebase
          const { doc, updateDoc } = require('firebase/firestore');
          const docRef = doc(this.plansCollection, 'workoutPlans', planId);
          
          await updateDoc(docRef, {
            ...updates,
            lastModified: new Date()
          });
          
          console.log(`[WorkoutPlanService] Successfully updated plan ${planId} in Firebase (web)`);
          return;
        }
      } catch (error) {
        console.warn(`[WorkoutPlanService] Error updating plan ${planId} in Firebase, falling back to local storage:`, error);
      }
    }
    
    // Fallback to local storage
    const plans = await this.getLocalPlans();
    const index = plans.findIndex(p => p.id === planId);
  
    if (index >= 0) {
      plans[index] = { ...plans[index], ...updates, lastModified: new Date() };
      await AsyncStorage.setItem(MOCK_PLANS_STORAGE_KEY, JSON.stringify(plans));
      console.log(`[WorkoutPlanService] Successfully updated plan ${planId} in local storage`);
    } else {
      console.warn(`[WorkoutPlanService] Plan ${planId} not found in local storage`);
    }
  }

  async deleteWorkoutPlan(planId: string): Promise<void> {
    await this.initialize();
    
    const userId = this.getCurrentUserId();
    const plan = await this.getWorkoutPlan(planId);
    
    if (!plan) {
      throw new Error('Plan not found');
    }
    
    if (plan.ownerId !== userId && userId !== 'mock-user-id') {
      throw new Error('Not authorized to delete this plan');
    }

    // Delete from Firebase if authenticated and plan was created in Firebase
    if (!this.useLocalStorage && userId !== 'mock-user-id' && !planId.startsWith('local-')) {
      try {
        if (typeof firestore.collection === 'function') {
          // Native Firebase
          // Delete all shares first
          const shares = await this.getSharesCollection()
            .where('planId', '==', planId)
            .get();
          
          const batch = firestore.batch();
          shares.docs.forEach((doc: any) => batch.delete(doc.ref));
          batch.delete(this.getPlansCollection().doc(planId));
          
          await batch.commit();
          console.log(`[WorkoutPlanService] Successfully deleted plan ${planId} from Firebase`);
        } else {
          // Web Firebase
          const { query, where, getDocs, doc, writeBatch } = require('firebase/firestore');
          
          // Find all shares for this plan
          const sharesCollection = this.getSharesCollection();
          const sharesQuery = query(sharesCollection, where('planId', '==', planId));
          const shares = await getDocs(sharesQuery);
          
          // Create a batch for deleting multiple documents
          const batch = writeBatch(this.sharesCollection);
          
          // Delete all shares
          shares.forEach((docSnapshot: any) => {
            const shareDocRef = doc(this.sharesCollection, 'workoutPlanShares', docSnapshot.id);
            batch.delete(shareDocRef);
          });
          
          // Delete the plan
          const planDocRef = doc(this.plansCollection, 'workoutPlans', planId);
          batch.delete(planDocRef);
          
          // Commit the batch
          await batch.commit();
          console.log(`[WorkoutPlanService] Successfully deleted plan ${planId} from Firebase (web)`);
        }
      } catch (error) {
        console.warn(`[WorkoutPlanService] Error deleting plan ${planId} from Firebase, falling back to local storage:`, error);
      }
    }
    
    // Also delete from local storage (in all cases to ensure sync)
    const plans = await this.getLocalPlans();
    const filteredPlans = plans.filter(p => p.id !== planId);
    await AsyncStorage.setItem(MOCK_PLANS_STORAGE_KEY, JSON.stringify(filteredPlans));
    
    const shares = await this.getLocalShares();
    const filteredShares = shares.filter(s => s.planId !== planId);
    await AsyncStorage.setItem(MOCK_SHARES_STORAGE_KEY, JSON.stringify(filteredShares));
    
    console.log(`[WorkoutPlanService] Successfully deleted plan ${planId} from local storage`);
  }

  // Sharing Operations
  async shareWorkoutPlan(planId: string, targetUserId: string): Promise<void> {
    await this.initialize();
    
    const userId = this.getCurrentUserId();
    const plan = await this.getWorkoutPlan(planId);
    
    if (!plan) {
      throw new Error('Workout plan not found');
    }
    
    if (plan.ownerId !== userId) {
      throw new Error('Not authorized to share this plan');
    }

    const share: WorkoutPlanShare = {
      planId,
      sharedBy: userId,
      sharedWith: targetUserId,
      sharedAt: new Date(),
      status: 'pending',
    };

    if (this.useLocalStorage) {
      const shares = await this.getLocalShares();
      shares.push(share);
      await AsyncStorage.setItem(MOCK_SHARES_STORAGE_KEY, JSON.stringify(shares));
      
      const plans = await this.getLocalPlans();
      const index = plans.findIndex(p => p.id === planId);
      if (index >= 0) {
        const sharedWith = plans[index].sharedWith || [];
        plans[index] = { 
          ...plans[index], 
          isShared: true, 
          sharedWith: [...sharedWith, targetUserId]
        };
        await AsyncStorage.setItem(MOCK_PLANS_STORAGE_KEY, JSON.stringify(plans));
      }
      return;
    }

    try {
      if (typeof firestore.collection === 'function') {
        // Native Firebase
        
        // 1. Create the share in the user's own collection
        await this.getSharesCollection().add(share);
        
        // 2. Update the global mapping collection to help find shares
        await firestore.collection('sharedWithUsers').add({
          userId: targetUserId,
          sharerUserId: userId,
          planId: planId,
          sharedAt: new Date()
        });
        
        // 3. Update the plan in the user's subcollection
        await this.getPlansCollection().doc(planId).update({
          isShared: true,
          sharedWith: firestore.FieldValue.arrayUnion(targetUserId),
        });
      } else {
        // Web Firebase
        const { addDoc, doc, updateDoc, arrayUnion, collection } = require('firebase/firestore');
        
        // 1. Add the share document to the user's own subcollection
        const sharesCollection = this.getSharesCollection();
        await addDoc(sharesCollection, share);
        
        // 2. Add to the global mapping collection
        const sharedWithUsersCollection = collection(this.plansCollection, 'sharedWithUsers');
        await addDoc(sharedWithUsersCollection, {
          userId: targetUserId,
          sharerUserId: userId,
          planId: planId,
          sharedAt: new Date()
        });
        
        // 3. Update the plan document
        const planDocRef = doc(this.plansCollection, 'users', userId, 'workoutPlans', planId);
        await updateDoc(planDocRef, {
          isShared: true,
          sharedWith: arrayUnion(targetUserId)
        });
      }
      
      console.log(`[WorkoutPlanService] Successfully shared plan ${planId} with user ${targetUserId}`);
    } catch (error) {
      console.error('[WorkoutPlanService] Error sharing workout plan:', error);
      throw error;
    }
  }

  async getSharedWorkoutPlans(): Promise<SharedWorkoutPlanView[]> {
    await this.initialize();
    
    const userId = this.getCurrentUserId();
    
    if (this.useLocalStorage) {
      const shares = await this.getLocalShares();
      const userShares = shares.filter(s => s.sharedWith === userId);
      const plans = await this.getLocalPlans();
      
      return userShares.map(share => {
        const plan = plans.find(p => p.id === share.planId);
        if (!plan) return null;
        
        return {
          ...plan,
          sharedBy: {
            id: share.sharedBy,
            name: 'Mock User',
          },
          sharedAt: share.sharedAt,
          status: share.status,
        };
      }).filter(Boolean) as SharedWorkoutPlanView[];
    }

    // Get shares based on whether we're using native or web Firebase
    let shares: any[] = [];
    
    try {
      if (typeof firestore.collection === 'function') {
        // Native Firebase - Use the global mapping table approach
        const globalSharesQuery = firestore.collection('sharedWithUsers')
          .where('userId', '==', userId)
          .get();
          
        const globalSharesResult = await globalSharesQuery;
        
        // Collect all shares from different users
        const allShares: any[] = [];
        for (const shareMapping of globalSharesResult.docs) {
          const sharerUserId = shareMapping.data().sharerUserId;
          
          // Now get the actual share from the sharer's collection
          const sharesSnapshot = await firestore
            .collection('users')
            .doc(sharerUserId)
            .collection('workoutPlanShares')
            .where('sharedWith', '==', userId)
            .get();
            
          allShares.push(...sharesSnapshot.docs);
        }
        
        shares = allShares;
      } else {
        // Web Firebase - Avoid using collectionGroup, use the mapping table instead
        const { query, where, getDocs, collection, doc } = require('firebase/firestore');
        
        // First, find all share mappings for this user
        const sharedWithUsersCollection = collection(this.plansCollection, 'sharedWithUsers');
        const mappingQuery = query(sharedWithUsersCollection, where('userId', '==', userId));
        const mappingSnapshot = await getDocs(mappingQuery);
        
        // Now find all actual shares based on these mappings
        const allShares: any[] = [];
        
        const promises: Promise<void>[] = [];
        mappingSnapshot.forEach((mappingDoc: any) => {
          const sharerUserId = mappingDoc.data().sharerUserId;
          const planId = mappingDoc.data().planId;
          
          // Get the collection reference for this sharer's shares
          const sharerSharesCollection = collection(
            this.plansCollection, 
            'users', 
            sharerUserId, 
            'workoutPlanShares'
          );
          
          // Query this sharer's shares for ones shared with the current user
          const sharesQuery = query(
            sharerSharesCollection, 
            where('sharedWith', '==', userId),
            where('planId', '==', planId)
          );
          
          // Add the promise to our list to execute in parallel
          promises.push(
            getDocs(sharesQuery).then((shareSnapshot: any) => {
              shareSnapshot.forEach((shareDoc: any) => {
                allShares.push({
                  data: () => shareDoc.data(),
                  id: shareDoc.id,
                  sharerUserId: sharerUserId // Add sharer ID for plan lookup
                });
              });
            })
          );
        });
        
        // Wait for all share queries to complete
        await Promise.all(promises);
        shares = allShares;
      }
    } catch (error) {
      console.error('[WorkoutPlanService] Error fetching shared plans:', error);
      return [];
    }

    const plans: SharedWorkoutPlanView[] = [];
    
    for (const shareDoc of shares) {
      const share = shareDoc.data() as WorkoutPlanShare;
      
      try {
        // In the new structure, need to get the plan from the owner's subcollection
        let plan: WorkoutPlan | null = null;
        
        // For web Firebase, we added the sharerUserId to the share document
        const sharerUserId = shareDoc.sharerUserId || share.sharedBy;
        
        if (typeof firestore.collection === 'function') {
          // Native Firebase
          const planDoc = await firestore
            .collection('users')
            .doc(sharerUserId)
            .collection('workoutPlans')
            .doc(share.planId)
            .get();
            
          if (planDoc.exists) {
            plan = planDoc.data() as WorkoutPlan;
          }
        } else {
          // Web Firebase
          const { doc, getDoc } = require('firebase/firestore');
          const planDocRef = doc(
            this.plansCollection, 
            'users', 
            sharerUserId, 
            'workoutPlans', 
            share.planId
          );
          const planSnap = await getDoc(planDocRef);
          
          if (planSnap.exists()) {
            plan = planSnap.data() as WorkoutPlan;
          }
        }
        
        if (plan) {
          // In a real scenario, we would fetch user data
          // Since we might have issues with auth, provide a fallback
          let sharedByUser = { uid: sharerUserId, displayName: 'User', email: 'user@example.com' };
          
          try {
            // Instead of using auth().getUser which doesn't exist in the web SDK,
            // we'll use a simplified approach that works with our fallback mechanism
            sharedByUser = {
              uid: sharerUserId,
              displayName: 'User ' + sharerUserId.substring(0, 5),
              email: `user-${sharerUserId.substring(0, 5)}@example.com`
            };
          } catch (error) {
            console.warn('[WorkoutPlanService] Error fetching user data:', error);
          }
          
          plans.push({
            ...plan,
            sharedBy: {
              id: sharedByUser.uid,
              name: sharedByUser.displayName || sharedByUser.email || 'Unknown User',
            },
            sharedAt: share.sharedAt,
            status: share.status,
          });
        }
      } catch (planError) {
        console.error('[WorkoutPlanService] Error fetching shared plan:', planError);
      }
    }

    return plans;
  }

  async acceptSharedPlan(planId: string): Promise<void> {
    await this.initialize();
    
    const userId = this.getCurrentUserId();
    
    if (this.useLocalStorage) {
      const shares = await this.getLocalShares();
      const index = shares.findIndex(s => 
        s.planId === planId && 
        s.sharedWith === userId && 
        s.status === 'pending'
      );
      
      if (index === -1) {
        throw new Error('Share not found or already processed');
      }
      
      shares[index].status = 'accepted';
      await AsyncStorage.setItem(MOCK_SHARES_STORAGE_KEY, JSON.stringify(shares));
      return;
    }

    try {
      if (typeof firestore.collection === 'function') {
        // Native Firebase
        
        // First, find the share mapping
        const mappingSnapshot = await firestore.collection('sharedWithUsers')
          .where('userId', '==', userId)
          .where('planId', '==', planId)
          .get();
          
        if (mappingSnapshot.empty) {
          throw new Error('Share not found or already processed');
        }
        
        // Get the sharer's user ID
        const sharerUserId = mappingSnapshot.docs[0].data().sharerUserId;
        
        // Now find the actual share document
        const shareDoc = await firestore
          .collection('users')
          .doc(sharerUserId)
          .collection('workoutPlanShares')
          .where('planId', '==', planId)
          .where('sharedWith', '==', userId)
          .where('status', '==', 'pending')
          .get();

        if (shareDoc.empty) {
          throw new Error('Share not found or already processed');
        }

        // Update the share status
        await shareDoc.docs[0].ref.update({ status: 'accepted' });
      } else {
        // Web Firebase
        const { query, where, getDocs, doc, updateDoc, collection, collectionGroup } = require('firebase/firestore');
        
        // First, find the share mapping
        const sharedWithUsersCollection = collection(this.plansCollection, 'sharedWithUsers');
        const mappingQuery = query(
          sharedWithUsersCollection,
          where('userId', '==', userId),
          where('planId', '==', planId)
        );
        
        const mappingSnapshot = await getDocs(mappingQuery);
        
        // Check if we found any mappings
        let sharerUserId = '';
        mappingSnapshot.forEach((docSnapshot: any) => {
          sharerUserId = docSnapshot.data().sharerUserId;
          return; // Exit after first result
        });
        
        if (!sharerUserId) {
          throw new Error('Share mapping not found');
        }
        
        // Now find the actual share in the sharer's subcollection
        const sharesCollection = collection(
          this.plansCollection,
          'users',
          sharerUserId,
          'workoutPlanShares'
        );
        
        const shareQuery = query(
          sharesCollection,
          where('planId', '==', planId),
          where('sharedWith', '==', userId),
          where('status', '==', 'pending')
        );
        
        const shareDoc = await getDocs(shareQuery);
        
        // Check if the query returned any results
        if (shareDoc.empty) {
          throw new Error('Share not found or already processed');
        }
        
        // Get the first matching document
        let docId = '';
        shareDoc.forEach((docSnapshot: any) => {
          docId = docSnapshot.id;
          return; // Exit the forEach after the first document
        });
        
        if (!docId) {
          throw new Error('Share document ID not found');
        }
        
        // Update the document
        const docRef = doc(
          this.plansCollection, 
          'users', 
          sharerUserId, 
          'workoutPlanShares', 
          docId
        );
        await updateDoc(docRef, { status: 'accepted' });
      }
    } catch (error) {
      console.error('[WorkoutPlanService] Error accepting shared plan:', error);
      throw error;
    }
  }

  async rejectSharedPlan(planId: string): Promise<void> {
    await this.initialize();
    
    const userId = this.getCurrentUserId();
    
    if (this.useLocalStorage) {
      const shares = await this.getLocalShares();
      const index = shares.findIndex(s => 
        s.planId === planId && 
        s.sharedWith === userId && 
        s.status === 'pending'
      );
      
      if (index === -1) {
        throw new Error('Share not found or already processed');
      }
      
      shares[index].status = 'rejected';
      await AsyncStorage.setItem(MOCK_SHARES_STORAGE_KEY, JSON.stringify(shares));
      
      const plans = await this.getLocalPlans();
      const planIndex = plans.findIndex(p => p.id === planId);
      if (planIndex >= 0) {
        const sharedWith = plans[planIndex].sharedWith || [];
        plans[planIndex].sharedWith = sharedWith.filter(id => id !== userId);
        await AsyncStorage.setItem(MOCK_PLANS_STORAGE_KEY, JSON.stringify(plans));
      }
      return;
    }

    try {
      if (typeof firestore.collection === 'function') {
        // Native Firebase
        
        // First, find the share mapping
        const mappingSnapshot = await firestore.collection('sharedWithUsers')
          .where('userId', '==', userId)
          .where('planId', '==', planId)
          .get();
          
        if (mappingSnapshot.empty) {
          throw new Error('Share not found or already processed');
        }
        
        // Get the sharer's user ID
        const sharerUserId = mappingSnapshot.docs[0].data().sharerUserId;
        const mappingDoc = mappingSnapshot.docs[0];
        
        // Now find the actual share document
        const shareDoc = await firestore
          .collection('users')
          .doc(sharerUserId)
          .collection('workoutPlanShares')
          .where('planId', '==', planId)
          .where('sharedWith', '==', userId)
          .where('status', '==', 'pending')
          .get();

        if (shareDoc.empty) {
          throw new Error('Share not found or already processed');
        }

        // Create a batch for multiple operations
        const batch = firestore.batch();
        
        // Update the share status
        batch.update(shareDoc.docs[0].ref, { status: 'rejected' });
        
        // Remove the user from the shared list in the plan
        batch.update(
          firestore.collection('users').doc(sharerUserId).collection('workoutPlans').doc(planId), 
          {
            sharedWith: firestore.FieldValue.arrayRemove(userId),
          }
        );
        
        // Delete the mapping document
        batch.delete(mappingDoc.ref);

        await batch.commit();
        
        // Check if there are any other users this plan is shared with
        const remainingMappings = await firestore.collection('sharedWithUsers')
          .where('sharerUserId', '==', sharerUserId)
          .where('planId', '==', planId)
          .get();
          
        if (remainingMappings.empty) {
          // No more shares for this plan, update isShared to false
          await firestore
            .collection('users')
            .doc(sharerUserId)
            .collection('workoutPlans')
            .doc(planId)
            .update({
              isShared: false,
            });
        }
      } else {
        // Web Firebase
        const { query, where, getDocs, doc, updateDoc, arrayRemove, writeBatch, collection, deleteDoc } = require('firebase/firestore');
        
        // First, find the share mapping
        const sharedWithUsersCollection = collection(this.plansCollection, 'sharedWithUsers');
        const mappingQuery = query(
          sharedWithUsersCollection,
          where('userId', '==', userId),
          where('planId', '==', planId)
        );
        
        const mappingSnapshot = await getDocs(mappingQuery);
        
        // Check if we found any mappings
        let sharerUserId = '';
        let mappingDocId = '';
        
        mappingSnapshot.forEach((docSnapshot: any) => {
          sharerUserId = docSnapshot.data().sharerUserId;
          mappingDocId = docSnapshot.id;
          return; // Exit after first result
        });
        
        if (!sharerUserId) {
          throw new Error('Share mapping not found');
        }
        
        // Now find the actual share in the sharer's subcollection
        const sharesCollection = collection(
          this.plansCollection,
          'users',
          sharerUserId,
          'workoutPlanShares'
        );
        
        const shareQuery = query(
          sharesCollection,
          where('planId', '==', planId),
          where('sharedWith', '==', userId),
          where('status', '==', 'pending')
        );
        
        const shareDoc = await getDocs(shareQuery);
        
        // Check if the query returned any results
        if (shareDoc.empty) {
          throw new Error('Share not found or already processed');
        }
        
        // Get the first matching document
        let shareDocId = '';
        shareDoc.forEach((docSnapshot: any) => {
          shareDocId = docSnapshot.id;
          return; // Exit the forEach after the first document
        });
        
        if (!shareDocId) {
          throw new Error('Share document ID not found');
        }
        
        // Create a batch for multiple operations
        const batch = writeBatch(this.plansCollection);
        
        // Update the share document
        const shareDocRef = doc(
          this.plansCollection, 
          'users', 
          sharerUserId, 
          'workoutPlanShares', 
          shareDocId
        );
        batch.update(shareDocRef, { status: 'rejected' });
        
        // Update the plan document
        const planDocRef = doc(
          this.plansCollection, 
          'users', 
          sharerUserId, 
          'workoutPlans', 
          planId
        );
        batch.update(planDocRef, {
          sharedWith: arrayRemove(userId)
        });
        
        // Delete the mapping document
        const mappingDocRef = doc(sharedWithUsersCollection, mappingDocId);
        batch.delete(mappingDocRef);
        
        // Commit the batch
        await batch.commit();
        
        // Check if there are any other users this plan is shared with
        const remainingMappingsQuery = query(
          sharedWithUsersCollection,
          where('sharerUserId', '==', sharerUserId),
          where('planId', '==', planId)
        );
        
        const remainingMappings = await getDocs(remainingMappingsQuery);
        
        // If no shares left, update isShared to false
        let hasRemainingMappings = false;
        remainingMappings.forEach(() => {
          hasRemainingMappings = true;
        });
        
        if (!hasRemainingMappings) {
          await updateDoc(planDocRef, {
            isShared: false
          });
        }
      }
    } catch (error) {
      console.error('[WorkoutPlanService] Error rejecting shared plan:', error);
      throw error;
    }
  }

  async unshareWorkoutPlan(planId: string, targetUserId: string): Promise<void> {
    await this.initialize();
    
    const userId = this.getCurrentUserId();
    const plan = await this.getWorkoutPlan(planId);
    
    if (!plan) {
      throw new Error('Workout plan not found');
    }
    
    if (plan.ownerId !== userId) {
      throw new Error('Not authorized to unshare this plan');
    }

    if (this.useLocalStorage) {
      // Update shares
      const shares = await this.getLocalShares();
      const filteredShares = shares.filter(s => 
        !(s.planId === planId && s.sharedWith === targetUserId)
      );
      await AsyncStorage.setItem(MOCK_SHARES_STORAGE_KEY, JSON.stringify(filteredShares));
      
      // Update plan
      const plans = await this.getLocalPlans();
      const planIndex = plans.findIndex(p => p.id === planId);
      if (planIndex >= 0) {
        const sharedWith = plans[planIndex].sharedWith || [];
        plans[planIndex].sharedWith = sharedWith.filter(id => id !== targetUserId);
        plans[planIndex].isShared = plans[planIndex].sharedWith?.length > 0;
        await AsyncStorage.setItem(MOCK_PLANS_STORAGE_KEY, JSON.stringify(plans));
      }
      return;
    }

    try {
      if (typeof firestore.collection === 'function') {
        // Native Firebase
        const batch = firestore.batch();
        
        // Find and delete mapping entry
        const mappingSnapshot = await firestore.collection('sharedWithUsers')
          .where('userId', '==', targetUserId)
          .where('sharerUserId', '==', userId)
          .where('planId', '==', planId)
          .get();
          
        if (!mappingSnapshot.empty) {
          mappingSnapshot.docs.forEach((doc: any) => batch.delete(doc.ref));
        }
        
        // Find and update any shares
        const shares = await this.getSharesCollection()
          .where('planId', '==', planId)
          .where('sharedWith', '==', targetUserId)
          .get();
        
        shares.docs.forEach((doc: any) => batch.delete(doc.ref));
        
        // Update the plan
        batch.update(this.getPlansCollection().doc(planId), {
          sharedWith: firestore.FieldValue.arrayRemove(targetUserId),
        });
        
        await batch.commit();
        
        // Check if there are any shares left
        const remainingMappings = await firestore.collection('sharedWithUsers')
          .where('sharerUserId', '==', userId)
          .where('planId', '==', planId)
          .get();
        
        if (remainingMappings.empty) {
          // No shares left, update isShared to false
          await this.getPlansCollection().doc(planId).update({
            isShared: false,
          });
        }
      } else {
        // Web Firebase
        const { query, where, getDocs, doc, updateDoc, arrayRemove, writeBatch, collection } = require('firebase/firestore');
        
        // Create a batch for multiple operations
        const batch = writeBatch(this.plansCollection);
        
        // Find and delete mapping entry
        const sharedWithUsersCollection = collection(this.plansCollection, 'sharedWithUsers');
        const mappingQuery = query(
          sharedWithUsersCollection,
          where('userId', '==', targetUserId),
          where('sharerUserId', '==', userId),
          where('planId', '==', planId)
        );
        
        const mappingSnapshot = await getDocs(mappingQuery);
        
        // Delete all matching mapping entries
        mappingSnapshot.forEach((docSnapshot: any) => {
          const mappingDocRef = doc(sharedWithUsersCollection, docSnapshot.id);
          batch.delete(mappingDocRef);
        });
        
        // Find and delete shares
        const sharesCollection = this.getSharesCollection();
        const sharesQuery = query(
          sharesCollection,
          where('planId', '==', planId),
          where('sharedWith', '==', targetUserId)
        );
        
        const shares = await getDocs(sharesQuery);
        
        // Delete all matching shares
        shares.forEach((docSnapshot: any) => {
          const shareDocRef = doc(
            this.plansCollection, 
            'users', 
            userId, 
            'workoutPlanShares', 
            docSnapshot.id
          );
          batch.delete(shareDocRef);
        });
        
        // Update the plan
        const planDocRef = doc(
          this.plansCollection,
          'users',
          userId,
          'workoutPlans',
          planId
        );
        batch.update(planDocRef, {
          sharedWith: arrayRemove(targetUserId)
        });
        
        // Commit the batch
        await batch.commit();
        
        // Check if there are any shares left
        const remainingSharesQuery = query(
          sharedWithUsersCollection,
          where('sharerUserId', '==', userId),
          where('planId', '==', planId)
        );
        
        const remainingShares = await getDocs(remainingSharesQuery);
        
        // If no shares left, update isShared to false
        let hasRemainingShares = false;
        remainingShares.forEach(() => {
          hasRemainingShares = true;
        });
        
        if (!hasRemainingShares) {
          await updateDoc(planDocRef, {
            isShared: false
          });
        }
      }
    } catch (error) {
      console.error('[WorkoutPlanService] Error unsharing workout plan:', error);
      throw error;
    }
  }

  async getUserWorkoutPlans(): Promise<WorkoutPlan[]> {
    await this.initialize();
    
    const userId = this.getCurrentUserId();
    let plans: WorkoutPlan[] = [];
    
    // Try to fetch from Firebase first if authenticated
    if (!this.useLocalStorage && userId !== 'mock-user-id') {
      try {
        const firebasePlans = await this.getUserWorkoutPlansFromFirebase();
        if (firebasePlans.length > 0) {
          console.log(`[WorkoutPlanService] Successfully fetched ${firebasePlans.length} plans from Firebase`);
          plans = firebasePlans;
          
          // Also try to sync any local plans to Firebase
          await this.syncLocalPlansToFirebase();
          
          return plans;
        }
      } catch (error) {
        console.warn('[WorkoutPlanService] Error fetching from Firebase, falling back to local storage:', error);
      }
    }
    
    // Fallback to local storage
    try {
      const localPlans = await this.getLocalPlans();
      plans = localPlans.filter(plan => plan.ownerId === userId || plan.ownerId === 'mock-user-id');
      console.log(`[WorkoutPlanService] Fetched ${plans.length} plans from local storage`);
    } catch (localError) {
      console.error('[WorkoutPlanService] Error fetching from local storage:', localError);
    }
    
    return plans;
  }

  // Function to sync local plans to Firebase when user authenticates
  async syncLocalPlansToFirebase(): Promise<void> {
    if (this.useLocalStorage) return;
    
    try {
      const userId = this.getCurrentUserId();
      if (userId === 'mock-user-id') {
        console.log('[WorkoutPlanService] User not authenticated, skipping sync');
        return;
      }
      
      console.log('[WorkoutPlanService] Syncing local plans to Firebase...');
      const localPlans = await this.getLocalPlans();
      const userLocalPlans = localPlans.filter(plan => plan.ownerId === 'mock-user-id' || plan.ownerId === userId);
      
      if (userLocalPlans.length === 0) {
        console.log('[WorkoutPlanService] No local plans to sync');
        return;
      }
      
      // Get existing Firebase plans to avoid duplicates
      const existingPlans = await this.getUserWorkoutPlansFromFirebase();
      const existingPlanNames = existingPlans.map(plan => plan.name);
      
      // For each local plan that doesn't exist in Firebase, create it
      let syncCount = 0;
      
      if (typeof firestore.collection === 'function') {
        // Native Firebase
        const batch = firestore.batch();
        
        for (const plan of userLocalPlans) {
          // Skip if a plan with the same name already exists in Firebase
          if (existingPlanNames.includes(plan.name)) {
            console.log(`[WorkoutPlanService] Skipping sync for plan "${plan.name}" as it already exists in Firebase`);
            continue;
          }
          
          const planWithUserId = {
            ...plan,
            ownerId: userId, // Ensure correct user ID
            id: '' // ID will be set after document creation
          };
          
          const docRef = this.getPlansCollection().doc();
          batch.set(docRef, { ...planWithUserId, id: docRef.id });
          syncCount++;
        }
        
        if (syncCount > 0) {
          await batch.commit();
          console.log(`[WorkoutPlanService] Successfully synced ${syncCount} plans to Firebase`);
        } else {
          console.log('[WorkoutPlanService] No new plans to sync');
        }
      } else {
        // Web Firebase
        const { doc, setDoc, collection } = require('firebase/firestore');
        
        for (const plan of userLocalPlans) {
          // Skip if a plan with the same name already exists in Firebase
          if (existingPlanNames.includes(plan.name)) {
            console.log(`[WorkoutPlanService] Skipping sync for plan "${plan.name}" as it already exists in Firebase`);
            continue;
          }
          
          const planWithUserId = {
            ...plan,
            ownerId: userId, // Ensure correct user ID
          };
          
          // Create a new document with auto-generated ID
          const plansCollectionRef = this.getPlansCollection();
          const newDocRef = doc(plansCollectionRef);
          const docId = newDocRef.id;
          
          // Add the ID to the plan data
          planWithUserId.id = docId;
          
          // Set the document
          await setDoc(newDocRef, planWithUserId);
          syncCount++;
        }
        
        if (syncCount > 0) {
          console.log(`[WorkoutPlanService] Successfully synced ${syncCount} plans to Firebase (web)`);
        } else {
          console.log('[WorkoutPlanService] No new plans to sync');
        }
      }
    } catch (error) {
      console.error('[WorkoutPlanService] Error syncing plans to Firebase:', error);
    }
  }

  // Helper function to get plans directly from Firebase
  private async getUserWorkoutPlansFromFirebase(): Promise<WorkoutPlan[]> {
    try {
      const userId = this.getCurrentUserId();
      if (userId === 'mock-user-id') {
        return [];
      }
      
      const plansCollection = this.getPlansCollection();
      
      // Check if we're using web or native Firebase
      if (typeof firestore.collection === 'function') {
        // Native Firebase
        const snapshot = await plansCollection
          .where('ownerId', '==', userId)
          .get();
        
        return snapshot.docs.map((doc: any) => doc.data() as WorkoutPlan);
      } else {
        // Web Firebase
        const { query, where, getDocs } = require('firebase/firestore');
        const q = query(plansCollection, where('ownerId', '==', userId));
        const snapshot = await getDocs(q);
        
        const plans: WorkoutPlan[] = [];
        snapshot.forEach((doc: any) => {
          plans.push(doc.data() as WorkoutPlan);
        });
        
        return plans;
      }
    } catch (error) {
      console.warn('[WorkoutPlanService] Error fetching user data from Firebase:', error);
      return [];
    }
  }

  /**
   * Get workout plans for a specific day of the week
   * @param dayName The name of the day (e.g., 'Monday', 'Tuesday', etc.)
   * @returns Array of workout plans that have exercises for the specified day
   */
  async getWorkoutPlansForDay(dayName: string): Promise<WorkoutPlan[]> {
    await this.initialize();
    
    const userId = this.getCurrentUserId();
    const userPlans = await this.getUserWorkoutPlans();
    
    console.log(`[WorkoutPlanService] Getting workout plans for ${dayName}, found ${userPlans.length} total plans`);
    
    if (userPlans.length > 0) {
      // Log the structure of the first plan for debugging
      const samplePlan = userPlans[0];
      console.log(`[WorkoutPlanService] Sample plan structure: 
        id: ${samplePlan.id},
        name: ${samplePlan.name},
        days: ${samplePlan.days ? 'exists' : 'undefined'},
        days.length: ${samplePlan.days?.length || 0}
      `);
      
      // If days exist, log the structure of the first day
      if (samplePlan.days && samplePlan.days.length > 0) {
        const sampleDay = samplePlan.days[0];
        console.log(`[WorkoutPlanService] Sample day structure:
          dayName: ${sampleDay.dayName},
          isRestDay: ${sampleDay.isRestDay},
          exercises: ${sampleDay.exercises ? 'exists' : 'undefined'},
          exercises.length: ${sampleDay.exercises?.length || 0}
        `);
      }
    }
    
    // Normalize the day name for comparison (lowercase)
    const normalizedDayName = dayName.toLowerCase();
    
    // Filter plans that have exercises for the specified day
    const plansForDay = userPlans.filter(plan => {
      if (!plan.days || !Array.isArray(plan.days)) {
        console.log(`[WorkoutPlanService] Plan ${plan.name || 'unnamed'} has no days array`);
        return false;
      }
      
      const hasDayMatch = plan.days.some(day => {
        // Skip days without a dayName property
        if (!day || !day.dayName) return false;
        
        // Case insensitive comparison
        const dayMatches = day.dayName.toLowerCase() === normalizedDayName;
        const hasExercises = !day.isRestDay && day.exercises && day.exercises.length > 0;
        
        if (dayMatches) {
          console.log(`[WorkoutPlanService] Found matching day in plan "${plan.name}": 
            day: ${day.dayName}, 
            isRestDay: ${day.isRestDay}, 
            exercises: ${day.exercises?.length || 0}`);
        }
        
        return dayMatches && hasExercises;
      });
      
      return hasDayMatch;
    });
    
    console.log(`[WorkoutPlanService] Found ${plansForDay.length} plans for ${dayName}`);
    
    // If we didn't find any plans, let's log all days from all plans for debugging
    if (plansForDay.length === 0) {
      console.log(`[WorkoutPlanService] No plans found for ${dayName}, logging all days:`);
      userPlans.forEach(plan => {
        console.log(`[WorkoutPlanService] Plan: ${plan.name || 'untitled'} (ID: ${plan.id})`);
        if (plan.days && Array.isArray(plan.days)) {
          plan.days.forEach(day => {
            console.log(`[WorkoutPlanService]   - Day: ${day.dayName || 'unnamed'}, isRestDay: ${day.isRestDay}, exercises: ${day.exercises?.length || 0}`);
          });
        } else {
          console.log(`[WorkoutPlanService]   - No days array`);
        }
      });
    }
    
    return plansForDay;
  }

  /**
   * Get workout plans for today
   * @returns Array of workout plans that have exercises for today
   */
  async getTodayWorkoutPlans(): Promise<WorkoutPlan[]> {
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    console.log(`[WorkoutPlanService] Getting workout plans for ${dayName}`);
    return this.getWorkoutPlansForDay(dayName);
  }

  // Debug method to list all plans in Firestore
  private async debugListAllFirestorePlans(): Promise<void> {
    try {
      await this.initialize();
      
      if (this.useLocalStorage) {
        console.log("[WorkoutPlanService][DEBUG] Using local storage, can't list Firestore plans");
        return;
      }
      
      console.log("[WorkoutPlanService][DEBUG] Attempting to list all Firestore plans...");
      
      if (typeof firestore.collection === 'function') {
        // Native Firebase
        const snapshot = await this.plansCollection.collection('workoutPlans').get();
        console.log(`[WorkoutPlanService][DEBUG] Found ${snapshot.docs.length} plans in Firestore (native)`);
        snapshot.docs.forEach((doc: any, index: number) => {
          const plan = doc.data();
          console.log(`[WorkoutPlanService][DEBUG] Plan ${index+1}: ${plan.name} (ID: ${plan.id}, owner: ${plan.ownerId})`);
        });
      } else {
        // Web Firebase
        const { collection, getDocs } = require('firebase/firestore');
        const plansCollection = collection(this.plansCollection, 'workoutPlans');
        const snapshot = await getDocs(plansCollection);
        
        let count = 0;
        snapshot.forEach((doc: any) => {
          count++;
          const plan = doc.data();
          console.log(`[WorkoutPlanService][DEBUG] Plan ${count}: ${plan.name} (ID: ${plan.id}, owner: ${plan.ownerId})`);
        });
        
        console.log(`[WorkoutPlanService][DEBUG] Found ${count} plans in Firestore (web)`);
      }
    } catch (error) {
      console.error("[WorkoutPlanService][DEBUG] Error listing Firestore plans:", error);
    }
  }

  // Add a method to verify Firestore is set up correctly
  private async verifyFirestoreSetup(): Promise<void> {
    console.log('[WorkoutPlanService] Verifying Firestore setup...');
    
    try {
      // Check if we're using web or native Firebase
      if (typeof firestore.collection === 'function') {
        // Native Firebase
        console.log('[WorkoutPlanService] Using native Firebase, testing collections...');
        
        // Test plans collection
        const plansCollection = this.getPlansCollection();
        const plansTest = await plansCollection.limit(1).get();
        console.log(`[WorkoutPlanService] Plans collection test: ${plansTest.empty ? 'Empty' : 'Has data'}`);
        
        // Test shares collection
        const sharesCollection = this.getSharesCollection();
        const sharesTest = await sharesCollection.limit(1).get();
        console.log(`[WorkoutPlanService] Shares collection test: ${sharesTest.empty ? 'Empty' : 'Has data'}`);
      } else {
        // Web Firebase
        console.log('[WorkoutPlanService] Using web Firebase, testing collections...');
        const { collection, query, limit, getDocs } = require('firebase/firestore');
        
        // Test plans collection
        const plansCollection = this.getPlansCollection();
        const plansQuery = query(plansCollection, limit(1));
        const plansSnapshot = await getDocs(plansQuery);
        console.log(`[WorkoutPlanService] Plans collection test: ${plansSnapshot.empty ? 'Empty' : 'Has data'}`);
        
        // Test shares collection
        const sharesCollection = this.getSharesCollection();
        const sharesQuery = query(sharesCollection, limit(1));
        const sharesSnapshot = await getDocs(sharesQuery);
        console.log(`[WorkoutPlanService] Shares collection test: ${sharesSnapshot.empty ? 'Empty' : 'Has data'}`);
      }
      
      console.log('[WorkoutPlanService] Firestore verification completed successfully');
    } catch (error) {
      console.error('[WorkoutPlanService] Firestore verification failed:', error);
      throw error;
    }
  }

  // Migration function to move workout plans from top-level collection to user sub-collections
  private async migrateWorkoutPlansToUserSubcollections(): Promise<void> {
    try {
      console.log('[WorkoutPlanService] Checking if migration is needed...');
      
      if (this.useLocalStorage) {
        console.log('[WorkoutPlanService] Using local storage, no migration needed');
        return;
      }
      
      // Check if the old top-level collection exists and has documents
      let hasOldData = false;
      
      if (typeof firestore.collection === 'function') {
        // Native Firebase
        const oldCollectionSnapshot = await firestore.collection('workoutPlans').limit(1).get();
        hasOldData = !oldCollectionSnapshot.empty;
      } else {
        // Web Firebase
        const { collection, query, limit, getDocs } = require('firebase/firestore');
        const oldCollection = collection(this.plansCollection, 'workoutPlans');
        const limitQuery = query(oldCollection, limit(1));
        const snapshot = await getDocs(limitQuery);
        hasOldData = !snapshot.empty;
      }
      
      if (!hasOldData) {
        console.log('[WorkoutPlanService] No data to migrate, all plans are already in user sub-collections');
        return;
      }
      
      console.log('[WorkoutPlanService] Starting migration of workout plans to user sub-collections...');
      
      // Fetch all plans from the old structure
      let oldPlans: any[] = [];
      
      if (typeof firestore.collection === 'function') {
        // Native Firebase
        const oldPlansSnapshot = await firestore.collection('workoutPlans').get();
        oldPlans = oldPlansSnapshot.docs;
      } else {
        // Web Firebase
        const { collection, getDocs } = require('firebase/firestore');
        const oldCollection = collection(this.plansCollection, 'workoutPlans');
        const oldPlansSnapshot = await getDocs(oldCollection);
        
        oldPlansSnapshot.forEach((doc: any) => {
          oldPlans.push({
            id: doc.id,
            data: () => doc.data(),
            ref: doc.ref
          });
        });
      }
      
      console.log(`[WorkoutPlanService] Found ${oldPlans.length} plans to migrate`);
      
      // Group plans by owner
      const plansByOwner: { [ownerId: string]: any[] } = {};
      
      for (const planDoc of oldPlans) {
        const planData = planDoc.data();
        const ownerId = planData.ownerId || 'unknown';
        
        if (!plansByOwner[ownerId]) {
          plansByOwner[ownerId] = [];
        }
        
        plansByOwner[ownerId].push({
          id: planDoc.id,
          data: planData,
          ref: planDoc.ref
        });
      }
      
      // Migrate each owner's plans
      for (const ownerId of Object.keys(plansByOwner)) {
        const ownerPlans = plansByOwner[ownerId];
        console.log(`[WorkoutPlanService] Migrating ${ownerPlans.length} plans for user ${ownerId}`);
        
        if (ownerId === 'unknown') {
          console.log('[WorkoutPlanService] Skipping plans with unknown owner');
          continue;
        }
        
        for (const plan of ownerPlans) {
          try {
            // Create the plan in the user's sub-collection
            if (typeof firestore.collection === 'function') {
              // Native Firebase
              await firestore
                .collection('users')
                .doc(ownerId)
                .collection('workoutPlans')
                .doc(plan.id)
                .set(plan.data);
                
              console.log(`[WorkoutPlanService] Migrated plan ${plan.id} for user ${ownerId}`);
            } else {
              // Web Firebase
              const { doc, setDoc } = require('firebase/firestore');
              const userPlanDocRef = doc(
                this.plansCollection,
                'users',
                ownerId,
                'workoutPlans',
                plan.id
              );
              
              await setDoc(userPlanDocRef, plan.data);
              console.log(`[WorkoutPlanService] Migrated plan ${plan.id} for user ${ownerId} (web)`);
            }
          } catch (planError) {
            console.error(`[WorkoutPlanService] Error migrating plan ${plan.id}:`, planError);
          }
        }
      }
      
      console.log('[WorkoutPlanService] Migration completed successfully');
      
      // Note: We're not deleting the old data for safety reasons
      // You can manually delete the old collection after verifying the migration was successful
      
    } catch (error) {
      console.error('[WorkoutPlanService] Migration failed:', error);
      throw error;
    }
  }
}

export const workoutPlanService = WorkoutPlanService.getInstance();