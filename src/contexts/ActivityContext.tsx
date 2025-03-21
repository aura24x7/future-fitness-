import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  ActivityLog, 
  ActivityStats, 
  ActivitySettings, 
  ActivityType,
  ActivityLevel 
} from '../types/activity';
import { activityService } from '../services/activityService';

interface ActivityContextType {
  activityLogs: ActivityLog[];
  activityStats: ActivityStats | null;
  activitySettings: ActivitySettings;
  activityTypes: ActivityType[];
  isLoading: boolean;
  error: string | null;
  addActivityLog: (level: ActivityLevel, duration: number, type: ActivityType, notes?: string) => Promise<void>;
  updateActivitySettings: (settings: Partial<ActivitySettings>) => Promise<void>;
  refreshActivityData: () => Promise<void>;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
};

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);
  const [activitySettings, setActivitySettings] = useState<ActivitySettings>({
    defaultDuration: 30,
    reminderEnabled: false,
    weeklyGoal: {
      minutes: 150,
      calories: 2000,
    },
  });
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshActivityData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [logs, stats, settings, types] = await Promise.all([
        activityService.getActivityLogs(),
        activityService.getActivityStats(),
        activityService.getActivitySettings(),
        activityService.getActivityTypes(),
      ]);

      setActivityLogs(logs);
      setActivityStats(stats);
      setActivitySettings(settings);
      setActivityTypes(types);
    } catch (err) {
      setError('Failed to load activity data');
      console.error('Error loading activity data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshActivityData();
  }, [refreshActivityData]);

  const addActivityLog = async (
    level: ActivityLevel,
    duration: number,
    type: ActivityType,
    notes?: string
  ) => {
    try {
      setError(null);
      await activityService.addActivityLog(level, duration, type, notes);
      await refreshActivityData();
    } catch (err) {
      setError('Failed to add activity log');
      console.error('Error adding activity log:', err);
    }
  };

  const updateActivitySettings = async (settings: Partial<ActivitySettings>) => {
    try {
      setError(null);
      await activityService.updateActivitySettings(settings);
      await refreshActivityData();
    } catch (err) {
      setError('Failed to update activity settings');
      console.error('Error updating activity settings:', err);
    }
  };

  return (
    <ActivityContext.Provider
      value={{
        activityLogs,
        activityStats,
        activitySettings,
        activityTypes,
        isLoading,
        error,
        addActivityLog,
        updateActivitySettings,
        refreshActivityData,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
}; 