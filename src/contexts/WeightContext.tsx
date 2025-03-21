import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WeightLog, WeightGoal, WeightStats, WeightSettings } from '../types/weight';
import { weightService } from '../services/weightService';

interface WeightContextType {
  weightLogs: WeightLog[];
  weightGoal: WeightGoal | null;
  weightStats: WeightStats | null;
  weightSettings: WeightSettings;
  isLoading: boolean;
  error: string | null;
  addWeightLog: (weight: number, notes?: string) => Promise<void>;
  setWeightGoal: (goal: Omit<WeightGoal, 'id' | 'userId'>) => Promise<void>;
  updateWeightSettings: (settings: Partial<WeightSettings>) => Promise<void>;
  refreshWeightData: () => Promise<void>;
}

const WeightContext = createContext<WeightContextType | undefined>(undefined);

export const useWeight = () => {
  const context = useContext(WeightContext);
  if (!context) {
    throw new Error('useWeight must be used within a WeightProvider');
  }
  return context;
};

export const WeightProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [weightGoal, setWeightGoalState] = useState<WeightGoal | null>(null);
  const [weightStats, setWeightStats] = useState<WeightStats | null>(null);
  const [weightSettings, setWeightSettings] = useState<WeightSettings>({
    unit: 'kg',
    weeklyGoal: 0.5,
    reminderEnabled: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshWeightData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load weight logs
      const logs = await weightService.getWeightLogs();
      setWeightLogs(logs);

      // Load weight goal
      const goal = await weightService.getWeightGoal();
      setWeightGoalState(goal);

      // Load weight stats
      const stats = await weightService.getWeightStats();
      setWeightStats(stats);

      // Load settings
      const settings = await weightService.getWeightSettings();
      setWeightSettings(settings);
    } catch (err) {
      setError('Failed to load weight data');
      console.error('Error loading weight data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWeightData();
  }, [refreshWeightData]);

  const addWeightLog = async (weight: number, notes?: string) => {
    try {
      setError(null);
      await weightService.addWeightLog(weight, notes);
      await refreshWeightData();
    } catch (err) {
      setError('Failed to add weight log');
      console.error('Error adding weight log:', err);
    }
  };

  const setWeightGoal = async (goal: Omit<WeightGoal, 'id' | 'userId'>) => {
    try {
      setError(null);
      await weightService.setWeightGoal(goal);
      await refreshWeightData();
    } catch (err) {
      setError('Failed to set weight goal');
      console.error('Error setting weight goal:', err);
    }
  };

  const updateWeightSettings = async (settings: Partial<WeightSettings>) => {
    try {
      setError(null);
      await weightService.updateWeightSettings(settings);
      await refreshWeightData();
    } catch (err) {
      setError('Failed to update weight settings');
      console.error('Error updating weight settings:', err);
    }
  };

  return (
    <WeightContext.Provider
      value={{
        weightLogs,
        weightGoal,
        weightStats,
        weightSettings,
        isLoading,
        error,
        addWeightLog,
        setWeightGoal,
        updateWeightSettings,
        refreshWeightData
      }}
    >
      {children}
    </WeightContext.Provider>
  );
}; 