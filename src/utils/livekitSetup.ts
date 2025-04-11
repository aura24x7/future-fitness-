import { registerGlobals } from '@livekit/react-native';

/**
 * Initializes LiveKit globals - should be called before the app is rendered
 * This is required for LiveKit to function properly
 */
export const initializeLiveKit = () => {
  console.log('[LiveKitSetup] Registering LiveKit globals');
  registerGlobals();
};

export default initializeLiveKit; 