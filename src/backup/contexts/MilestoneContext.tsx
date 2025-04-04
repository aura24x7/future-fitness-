import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../config/firebase';
import { milestoneService } from '../services/milestoneService';
import { Milestone, MilestoneType, MilestoneProgress } from '../types/milestone';

interface MilestoneContextType {
  milestones: Milestone[];
  isLoading: boolean;
  error: string | null;
  checkMilestone: (type: MilestoneType, currentValue: number) => Promise<void>;
  refreshMilestones: () => Promise<void>;
}

const MilestoneContext = createContext<MilestoneContextType | undefined>(undefined);

export const useMilestones = () => {
  const context = useContext(MilestoneContext);
  if (!context) {
    throw new Error('useMilestones must be used within a MilestoneProvider');
  }
  return context;
};

export const MilestoneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshMilestones = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      const userMilestones = await milestoneService.getUserMilestones(user.uid);
      setMilestones(userMilestones);
    } catch (err) {
      console.error('Error refreshing milestones:', err);
      setError('Failed to load milestones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkMilestone = async (type: MilestoneType, currentValue: number) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setError(null);
      // Create new milestones if they don't exist
      await milestoneService.checkAndCreateMilestones(user.uid, type, currentValue);

      // Update progress for existing milestones
      const typeMilestones = milestones.filter(m => m.type === type);
      for (const milestone of typeMilestones) {
        const progress = await milestoneService.updateMilestoneProgress(
          milestone.id,
          currentValue
        );

        if (progress.isAchieved && !milestone.achieved) {
          // Show celebration notification
          // You can implement your own notification system here
          console.log(`🎉 Achievement unlocked: ${milestone.title}`);
        }
      }

      await refreshMilestones();
    } catch (err) {
      console.error('Error checking milestone:', err);
      setError('Failed to check milestone progress');
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        refreshMilestones();
      } else {
        setMilestones([]);
      }
    });

    return () => unsubscribe();
  }, [refreshMilestones]);

  return (
    <MilestoneContext.Provider
      value={{
        milestones,
        isLoading,
        error,
        checkMilestone,
        refreshMilestones,
      }}
    >
      {children}
    </MilestoneContext.Provider>
  );
}; 