import React from 'react';
import { useLiveKit } from '../contexts/LiveKitContext';
import LiveKitFallback from './LiveKitFallback';

interface WithLiveKitCheckProps {
  featureName?: string;
  alternateScreen?: string;
}

/**
 * Higher-order component to conditionally render a component only if LiveKit is available,
 * otherwise show a fallback component with appropriate messaging.
 * 
 * @param WrappedComponent The component requiring LiveKit functionality
 * @param options Configuration options
 * @returns A new component that handles LiveKit availability
 */
const withLiveKitCheck = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithLiveKitCheckProps = {}
) => {
  // Return a new component
  const WithLiveKitCheck: React.FC<P> = (props) => {
    const { isLiveKitAvailable, isExpoGo } = useLiveKit();
    
    // If LiveKit is available, render the wrapped component
    if (isLiveKitAvailable) {
      return <WrappedComponent {...props} />;
    }
    
    // Otherwise show the fallback
    return (
      <LiveKitFallback 
        featureName={options.featureName} 
        alternateScreen={options.alternateScreen}
      />
    );
  };
  
  // Set display name for easier debugging
  WithLiveKitCheck.displayName = `WithLiveKitCheck(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;
  
  return WithLiveKitCheck;
};

export default withLiveKitCheck; 