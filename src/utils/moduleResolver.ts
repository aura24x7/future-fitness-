import Constants from 'expo-constants';

// Check if running in Expo Go
export const isExpoGo = Constants.executionEnvironment === 'storeClient';

// Create inline mocks (simpler version of what's in initializeMocks.js)
const createInlineMocks = () => {
  // WebRTC mock
  const webrtcMock = {
    registerGlobals: () => {
      console.log('[WebRTC Mock] Using mock registerGlobals from moduleResolver');
    },
    RTCPeerConnection: class {
      localDescription = null;
      createOffer() { return Promise.resolve({}); }
      close() {}
    },
    MediaStream: class {
      getTracks() { return []; }
    }
  };
  
  // LiveKit mock
  const livekitMock = {
    LiveKitRoom: ({ children }: { children: React.ReactNode }) => children,
    AudioSession: ({ children }: { children: React.ReactNode }) => children,
    useRoom: () => ({
      localParticipant: {
        enableAudio: () => Promise.resolve(),
        disableAudio: () => Promise.resolve()
      },
      name: 'mock-room',
      state: 'connected',
      on: (event: string, callback: Function) => {},
      off: (event: string, callback: Function) => {},
      disconnect: () => {},
      participants: new Map()
    }),
    useParticipant: () => ({
      isSpeaking: false,
      metadata: '',
      audioTracks: [],
      videoTracks: []
    }),
    Room: { 
      State: {
        CONNECTING: 'connecting',
        CONNECTED: 'connected',
        DISCONNECTED: 'disconnected'
      } 
    },
    registerGlobals: () => {
      console.log('[LiveKit Mock] Using mock registerGlobals from moduleResolver');
    }
  };
  
  return { webrtcMock, livekitMock };
};

// Create mocks once
const { webrtcMock, livekitMock } = createInlineMocks();

// Export pre-resolved modules using inline mocks
export const preResolvedModules = {
  // For WebRTC, use mock in Expo Go
  webrtc: isExpoGo 
    ? webrtcMock 
    : (() => {
        try {
          // Try to load the real module
          return require('@livekit/react-native-webrtc');
        } catch (error) {
          console.warn('[ModuleResolver] Failed to load WebRTC, using mock');
          return webrtcMock;
        }
      })(),
  
  // For LiveKit, use mock in Expo Go
  livekit: isExpoGo 
    ? livekitMock 
    : (() => {
        try {
          // Try to load the real module
          return require('@livekit/react-native');
        } catch (error) {
          console.warn('[ModuleResolver] Failed to load LiveKit, using mock');
          return livekitMock;
        }
      })(),
};

export default {
  preResolvedModules,
  isExpoGo,
}; 