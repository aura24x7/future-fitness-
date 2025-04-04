import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { profileGroupsReducer, initialState } from '../reducers/profileGroupsReducer';
import { ProfileGroupsState, ProfileGroupsAction, User, Group } from '../types/profileGroups';
import { userService } from '../services/userService';
import { groupService } from '../services/groupService';

interface ProfileGroupsContextType {
  state: ProfileGroupsState;
  dispatch: React.Dispatch<ProfileGroupsAction>;
  fetchIndividuals: () => Promise<void>;
  fetchGroups: () => Promise<void>;
  addIndividual: (userId: string) => Promise<void>;
  removeIndividual: (userId: string) => Promise<void>;
  createGroup: (name: string, description?: string) => Promise<void>;
  updateGroup: (groupId: string, updates: Partial<Group>) => Promise<void>;
  removeGroup: (groupId: string) => Promise<void>;
}

const ProfileGroupsContext = createContext<ProfileGroupsContextType | undefined>(undefined);

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export function ProfileGroupsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(profileGroupsReducer, initialState);

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

  const fetchGroups = useCallback(async () => {
    // Return cached data if it's still valid
    if (isCacheValid(state.groups.lastFetched)) {
      return;
    }

    dispatch({ type: 'FETCH_GROUPS_START' });
    try {
      const groups = await groupService.getAllGroups();
      dispatch({ type: 'FETCH_GROUPS_SUCCESS', payload: groups });
    } catch (error) {
      dispatch({
        type: 'FETCH_GROUPS_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to fetch groups',
      });
    }
  }, [state.groups.lastFetched, isCacheValid]);

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

  const createGroup = useCallback(async (name: string, description?: string) => {
    try {
      const newGroup = await groupService.createGroup({ name, description });
      dispatch({ type: 'ADD_GROUP', payload: newGroup });
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }, []);

  const updateGroup = useCallback(async (groupId: string, updates: Partial<Group>) => {
    try {
      const updatedGroup = await groupService.updateGroup(groupId, updates);
      dispatch({ type: 'UPDATE_GROUP', payload: updatedGroup });
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }, []);

  const removeGroup = useCallback(async (groupId: string) => {
    try {
      await groupService.deleteGroup(groupId);
      dispatch({ type: 'REMOVE_GROUP', payload: groupId });
    } catch (error) {
      console.error('Error removing group:', error);
      throw error;
    }
  }, []);

  return (
    <ProfileGroupsContext.Provider
      value={{
        state,
        dispatch,
        fetchIndividuals,
        fetchGroups,
        addIndividual,
        removeIndividual,
        createGroup,
        updateGroup,
        removeGroup,
      }}
    >
      {children}
    </ProfileGroupsContext.Provider>
  );
}

export function useProfileGroups() {
  const context = useContext(ProfileGroupsContext);
  if (context === undefined) {
    throw new Error('useProfileGroups must be used within a ProfileGroupsProvider');
  }
  return context;
} 