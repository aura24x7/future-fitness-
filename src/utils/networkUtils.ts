import NetInfo, { 
  NetInfoState, 
  NetInfoStateType,
  NetInfoCellularState,
  NetInfoWifiState
} from '@react-native-community/netinfo';
import { AppError } from './errorHandling';
import { ErrorCodes } from './errorHandling';

interface NetworkStatus {
  isOnline: boolean;
  type: NetInfoStateType;
  strength?: number;
  isMetered?: boolean;
  details: any;
}

class NetworkManager {
  private static instance: NetworkManager;
  private isOnline: boolean = true;
  private networkStatus: NetworkStatus = {
    isOnline: true,
    type: NetInfoStateType.unknown,
    details: null
  };
  private listeners: Set<(isOnline: boolean) => void> = new Set();
  private statusListeners: Set<(status: NetworkStatus) => void> = new Set();
  private retryAttempts: number = 0;
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly BASE_RETRY_DELAY = 1000;

  private constructor() {
    this.setupNetworkListener();
  }

  static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  private setupNetworkListener(): void {
    NetInfo.addEventListener((state: NetInfoState) => {
      const newIsOnline = state.isConnected === true;
      const newStatus: NetworkStatus = {
        isOnline: newIsOnline,
        type: state.type,
        strength: this.calculateSignalStrength(state),
        isMetered: state.type === NetInfoStateType.cellular,
        details: state.details
      };

      // Update internal state
      if (this.isOnline !== newIsOnline || JSON.stringify(this.networkStatus) !== JSON.stringify(newStatus)) {
        this.isOnline = newIsOnline;
        this.networkStatus = newStatus;
        
        // Reset retry attempts on successful connection
        if (newIsOnline) {
          this.retryAttempts = 0;
        }

        // Notify listeners
        this.notifyListeners();
        this.notifyStatusListeners();
      }
    });
  }

  private calculateSignalStrength(state: NetInfoState): number | undefined {
    if (state.type === NetInfoStateType.cellular) {
      const cellularState = state as NetInfoCellularState;
      // For cellular, we'll use a default strength since actual signal strength
      // may not be available on all platforms
      return 100;
    } else if (state.type === NetInfoStateType.wifi) {
      // For WiFi, we'll return a default strength since actual signal strength
      // may not be available on all platforms
      return 100;
    }
    return undefined;
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.isOnline));
  }

  private notifyStatusListeners(): void {
    this.statusListeners.forEach(listener => listener(this.networkStatus));
  }

  addConnectivityListener(listener: (isOnline: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  addNetworkStatusListener(listener: (status: NetworkStatus) => void): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  isNetworkAvailable(): boolean {
    return this.isOnline;
  }

  getNetworkStatus(): NetworkStatus {
    return { ...this.networkStatus };
  }

  async waitForNetwork(timeoutMs: number = 10000): Promise<void> {
    if (this.isOnline) return;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        if (this.retryAttempts < this.MAX_RETRY_ATTEMPTS) {
          this.retryAttempts++;
          const backoffDelay = this.BASE_RETRY_DELAY * Math.pow(2, this.retryAttempts - 1);
          console.warn(`Network connection attempt ${this.retryAttempts} failed, retrying in ${backoffDelay}ms`);
          setTimeout(() => {
            this.waitForNetwork(timeoutMs).then(resolve).catch(reject);
          }, backoffDelay);
        } else {
          reject(new AppError(
            'Network connection timeout after multiple retries',
            ErrorCodes.NETWORK_ERROR,
            undefined,
            'waitForNetwork'
          ));
        }
      }, timeoutMs);

      const listener = (status: NetworkStatus) => {
        if (status.isOnline) {
          cleanup();
          resolve();
        }
      };

      const cleanup = () => {
        clearTimeout(timeout);
        this.statusListeners.delete(listener);
      };

      this.statusListeners.add(listener);
    });
  }

  async checkConnectivity(): Promise<NetworkStatus> {
    const state = await NetInfo.fetch();
    return {
      isOnline: state.isConnected === true,
      type: state.type,
      strength: this.calculateSignalStrength(state),
      isMetered: state.type === NetInfoStateType.cellular,
      details: state.details
    };
  }
}

export const networkManager = NetworkManager.getInstance();

export const isConnected = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
}; 