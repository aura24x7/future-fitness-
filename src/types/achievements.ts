export type BadgeCategory = 
  | 'workout'
  | 'challenge'
  | 'social'
  | 'consistency'
  | 'milestone';

export type BadgeRarity = 
  | 'common'
  | 'rare'
  | 'epic'
  | 'legendary';

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  iconName: string; // Name of the Ionicons icon
  criteria: {
    type: string;
    value: number;
  };
  colorScheme: {
    primary: string;
    secondary: string;
    text: string;
  };
}

export interface UserBadge extends Badge {
  earnedAt: string;
  progress: number;
  isComplete: boolean;
}

export interface BadgeProgress {
  badgeId: string;
  currentValue: number;
  targetValue: number;
  isComplete: boolean;
}

// Badge unlock criteria types
export type WorkoutCriteria = {
  type: 'workoutCount' | 'totalDuration' | 'totalCalories';
  value: number;
};

export type ChallengeCriteria = {
  type: 'challengesWon' | 'challengesParticipated' | 'challengeStreak';
  value: number;
};

export type SocialCriteria = {
  type: 'workoutsShared' | 'likesReceived' | 'commentsReceived' | 'influenceScore';
  value: number;
};

export type ConsistencyCriteria = {
  type: 'workoutStreak' | 'weeklyGoals' | 'monthlyGoals';
  value: number;
};

export type MilestoneCriteria = {
  type: 'daysActive' | 'totalWorkouts' | 'totalChallenges';
  value: number;
};
