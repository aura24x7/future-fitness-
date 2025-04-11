import React, { createContext, useContext, useState, useEffect } from 'react';
import { isExpoGo, preResolvedModules } from '../utils/moduleResolver';

type LiveKitContextType = {
  isLiveKitAvailable: boolean;
  isExpoGo: boolean;
};

const LiveKitContext = createContext<LiveKitContextType>({
  isLiveKitAvailable: false,
  isExpoGo: true,
});

export const useLiveKit = () => useContext(LiveKitContext);

export const LiveKitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLiveKitAvailable, setIsLiveKitAvailable] = useState(false);

  useEffect(() => {
    // LiveKit available if we're not in Expo Go and we have access to the real module
    const available = !isExpoGo && !!preResolvedModules.livekit;
    setIsLiveKitAvailable(available);
    
    console.log(`LiveKit availability: ${available ? 'AVAILABLE' : 'NOT AVAILABLE'}`);
    
    if (isExpoGo) {
      console.log('Running in Expo Go - LiveKit real functionality not available');
    }
  }, []);

  return (
    <LiveKitContext.Provider value={{ isLiveKitAvailable, isExpoGo }}>
      {children}
    </LiveKitContext.Provider>
  );
}; 