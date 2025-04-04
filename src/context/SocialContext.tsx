import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { socialReducer, initialState } from '../reducers/socialReducer';
import { SocialState, SocialAction, User } from '../types/social';
import { userService } from '../services/userService';

interface SocialContextType {
  state: SocialState;
  dispatch: React.Dispatch<SocialAction>;
  fetchIndividuals: () => Promise<void>;
  addIndividual: (userId: string) => Promise<void>;
  removeIndividual: (userId: string) => Promise<void>;
  sendNotification: (userId: string, message: string) => Promise<void>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export function SocialProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(socialReducer, initialState);

  const isCacheValid = useCallback((lastFetched: number | null) => {
    if (!lastFetched) return false;
    return Date.now() - lastFetched < CACHE_DURATION;
  }, []);

  const fetchIndividuals = useCallback(async () => {
    // Return cached data if it's still valid
    if (isCacheValid(state.individuals.lastFetched)) {
      return;
    }

    dispatch({ type: 'FETCH_INDIVIDUALS_START' });
    try {
      const individuals = await userService.getConnections();
      dispatch({ type: 'FETCH_INDIVIDUALS_SUCCESS', payload: individuals });
    } catch (error) {
      dispatch({
        type: 'FETCH_INDIVIDUALS_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to fetch individuals',
      });
    }
  }, [state.individuals.lastFetched, isCacheValid]);

  const addIndividual = useCallback(async (userId: string) => {
    try {
      await userService.addConnection(userId);
      const user = await userService.findUserById(userId);
      if (user) {
        dispatch({ type: 'ADD_INDIVIDUAL', payload: user });
      }
    } catch (error) {
      console.error('Error adding individual:', error);
      throw error;
    }
  }, []);

  const removeIndividual = useCallback(async (userId: string) => {
    try {
      // TODO: Implement remove connection in userService
      // await userService.removeConnection(userId);
      dispatch({ type: 'REMOVE_INDIVIDUAL', payload: userId });
    } catch (error) {
      console.error('Error removing individual:', error);
      throw error;
    }
  }, []);

  const sendNotification = useCallback(async (userId: string, message: string) => {
    try {
      // TODO: Implement with a proper notification service
      console.log(`Sending notification to user ${userId}: ${message}`);
      // This would integrate with a push notification service in a real implementation
      
      dispatch({ 
        type: 'NOTIFICATION_SENT', 
        payload: { 
          userId, 
          message, 
          timestamp: new Date().toISOString() 
        } 
      });
      
      return;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }, []);

  return (
    <SocialContext.Provider
      value={{
        state,
        dispatch,
        fetchIndividuals,
        addIndividual,
        removeIndividual,
        sendNotification
      }}
    >
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
} 