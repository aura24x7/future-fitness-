import { firebaseCore } from './firebase/firebaseCore';
import { getNotificationService } from './notificationService';
import { unlockAllNavigation } from '../utils/navigationUtils';
import { isFirebaseInitialized } from '../firebase/firebaseInit';

// We'll get the NotificationService instance during initialization
let notificationService: any = null;

class AppInitializer {
  private static instance: AppInitializer;
  private initialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): AppInitializer {
    if (!AppInitializer.instance) {
      AppInitializer.instance = new AppInitializer();
    }
    return AppInitializer.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('[AppInitializer] Already initialized, skipping...');
      return;
    }

    if (!this.initializationPromise) {
      console.log('[AppInitializer] Starting initialization...');
      this.initializationPromise = (async () => {
        try {
          // Clear any navigation locks from previous sessions
          console.log('[AppInitializer] Clearing any existing navigation locks...');
          await unlockAllNavigation();
          
          // Initialize Firebase first
          console.log('[AppInitializer] Initializing Firebase...');
          await firebaseCore.ensureInitialized();
          
          // Extra check for Firebase initialization
          if (!isFirebaseInitialized()) {
            console.warn('[AppInitializer] Firebase initialization check failed, retrying...');
            // Force a small delay and retry
            await new Promise(resolve => setTimeout(resolve, 300));
            await firebaseCore.ensureInitialized();
            
            if (!isFirebaseInitialized()) {
              console.error('[AppInitializer] Firebase still not initialized properly');
            } else {
              console.log('[AppInitializer] Firebase initialized successfully on retry');
            }
          } else {
            console.log('[AppInitializer] Firebase initialized successfully');
          }

          // Initialize NotificationService
          console.log('[AppInitializer] Initializing NotificationService...');
          const notificationService = await getNotificationService();
          await notificationService.initialize();
          console.log('[AppInitializer] NotificationService initialized');

          this.initialized = true;
          console.log('[AppInitializer] All services initialized successfully');
        } catch (error) {
          console.error('[AppInitializer] Initialization error:', error);
          this.initialized = false;
          this.initializationPromise = null;
          throw error;
        }
      })();
    } else {
      console.log('[AppInitializer] Initialization already in progress, waiting...');
    }

    return this.initializationPromise;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const appInitializer = AppInitializer.getInstance();
