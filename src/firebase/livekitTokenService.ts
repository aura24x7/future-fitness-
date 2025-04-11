import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * Service for handling LiveKit token generation
 * Currently provides a mock/stub implementation that will be replaced
 * with an actual Firebase function call in production
 */
export const livekitTokenService = {
  /**
   * Generates a LiveKit token for the specified user
   * @param userId The user ID to generate a token for
   * @returns A Promise that resolves to the LiveKit token
   */
  generateToken: async (userId: string): Promise<string> => {
    console.log(`[livekitTokenService] Generating token for user: ${userId}`);
    
    // MOCK IMPLEMENTATION - In production, this will call the createLiveKitToken Firebase function
    // const functions = getFunctions();
    // const createLiveKitToken = httpsCallable(functions, 'createLiveKitToken');
    // const result = await createLiveKitToken({ userId });
    // return result.data.token;
    
    // For development - return a mock token
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('mock-token-for-development');
      }, 1000);
    });
  }
};

export default livekitTokenService; 