/**
 * This file sets up module mocking as early as possible in the app bootstrap process
 * to prevent errors related to native modules in Expo Go.
 * 
 * NOTE: This file MUST use CommonJS format (not ES modules) for early loading
 */

// Use CommonJS require to ensure synchronous execution
const Constants = require('expo-constants');

// Check if running in Expo Go
const isExpoGo = Constants.default.executionEnvironment === 'storeClient';

console.log(`[InitializeMocks] Running in ${isExpoGo ? 'Expo Go' : 'development build'}`);

// Only attempt mocking if we're in Expo Go
if (isExpoGo) {
  console.log('[InitializeMocks] Setting up module mocks for Expo Go');
  
  /**
   * Simple mock for WebRTC's registerGlobals
   */
  const mockRegisterGlobals = () => {
    console.log('[WebRTC Mock] Using mock registerGlobals');
  };
  
  /**
   * Create minimal mocks that prevent crashes
   */
  const createMinimalMocks = () => {
    // Create WebRTC mock
    const webrtcMock = {
      registerGlobals: mockRegisterGlobals,
      RTCPeerConnection: function() { 
        this.close = () => {}; 
        this.addTrack = () => {};
        this.createOffer = () => Promise.resolve({});
      },
      MediaStream: function() { 
        this.getTracks = () => []; 
      }
    };
    
    // Create LiveKit mock
    const livekitMock = {
      LiveKitRoom: (props) => props.children,
      AudioSession: (props) => props.children,
      useRoom: () => ({
        localParticipant: {
          enableAudio: () => Promise.resolve(),
          disableAudio: () => Promise.resolve()
        }
      }),
      Room: { State: {} }
    };
    
    return { webrtcMock, livekitMock };
  };
  
  try {
    // Create minimal mocks
    const { webrtcMock, livekitMock } = createMinimalMocks();
    
    // Patch the require cache for known problematic modules
    require.cache['@livekit/react-native-webrtc'] = {
      id: '@livekit/react-native-webrtc',
      filename: '@livekit/react-native-webrtc',
      loaded: true,
      exports: webrtcMock
    };
    
    require.cache['@livekit/react-native'] = {
      id: '@livekit/react-native',
      filename: '@livekit/react-native',
      loaded: true,
      exports: livekitMock
    };
    
    console.log('[InitializeMocks] Successfully set up module mocks');
  } catch (error) {
    console.warn('[InitializeMocks] Failed to mock modules:', 
                typeof error === 'object' ? error.message : error);
  }
} else {
  console.log('[InitializeMocks] Using real modules (not in Expo Go)');
}

// This export isn't used but is required to make this a valid module
module.exports = {
  isExpoGo
}; 