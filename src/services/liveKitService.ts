import { getFunctions, httpsCallable } from 'firebase/functions';
import { isExpoGo, preResolvedModules } from '../utils/moduleResolver';

// Define the expected response type
interface LiveKitTokenResponse {
  token: string;
}

/**
 * Service to handle LiveKit interactions with proper fallbacks for Expo Go
 */
const LiveKitService = {
  /**
   * Get LiveKit token from Firebase function
   * Returns a mock token when in Expo Go
   */
  getToken: async (userId: string): Promise<string> => {
    if (isExpoGo) {
      console.log('Running in Expo Go - returning mock LiveKit token');
      // Return a mock token when in Expo Go
      return 'expo-go-mock-token';
    }
    
    try {
      const functions = getFunctions();
      const createLiveKitToken = httpsCallable<{ userId: string }, LiveKitTokenResponse>(
        functions, 
        'createLiveKitToken'
      );
      const result = await createLiveKitToken({ userId });
      
      // Extract token from result
      return result.data.token;
    } catch (error) {
      console.error('Error getting LiveKit token:', error);
      throw new Error('Failed to get LiveKit token');
    }
  },
  
  /**
   * Check if LiveKit functionality is available
   */
  isAvailable: (): boolean => {
    if (isExpoGo) {
      return false;
    }
    
    // Use our pre-resolved module check
    return !!preResolvedModules.livekit;
  },
  
  /**
   * Get LiveKit connection URL
   */
  getLiveKitUrl: (): string => {
    // In a real app, you would get this from environment variables
    const liveKitUrl = process.env.EXPO_PUBLIC_LIVEKIT_URL;
    return liveKitUrl || 'https://your-livekit-server.livekit.cloud';
  }
};

export default LiveKitService; 