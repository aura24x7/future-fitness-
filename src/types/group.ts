import { WorkoutPlan } from '../services/geminiService';

export type GroupRole = 'admin' | 'moderator' | 'member';

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupRole;
  joinedAt: Date;
  profilePicture?: string;
  displayName: string;
}

export interface GroupInvite {
  id: string;
  groupId: string;
  invitedBy: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined';
  expiresAt: Date;
  createdAt: Date;
}

export interface Group {
  id: string;
  name: string;
  adminId: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  memberCount: number;
  imageUrl?: string;
}

export interface SharedWorkout {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  workoutId: string;
  workoutName: string;
  description?: string;
  duration: number;
  calories: number;
  exercises: {
    name: string;
    sets: number;
    reps: number;
    weight?: number;
  }[];
  likes: string[]; // Array of user IDs who liked the workout
  comments: {
    id: string;
    userId: string;
    userName: string;
    content: string;
    createdAt: string;
  }[];
  metrics?: {
    difficulty: 'easy' | 'medium' | 'hard';
    intensity: number; // 1-10
    muscleGroups: string[];
  };
  sharedAt: string;
}

export interface WorkoutComment {
  id: string;
  workoutId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface WorkoutReaction {
  workoutId: string;
  userId: string;
  type: 'like' | 'celebrate' | 'fire';
  createdAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  profilePicture?: string;
  stats: {
    workoutsCompleted: number;
    caloriesBurned: number;
    minutesExercised: number;
    streakDays: number;
    points: number;
  };
  rank?: number;
  trend?: 'up' | 'down' | 'same';
}

export interface RolePermission {
  role: GroupRole;
  permissions: {
    canInviteMembers: boolean;
    canRemoveMembers: boolean;
    canUpdateRoles: boolean;
    canManageContent: boolean;
    canDeleteGroup: boolean;
    canUpdateSettings: boolean;
  };
}

export const DEFAULT_ROLE_PERMISSIONS: Record<GroupRole, RolePermission['permissions']> = {
  admin: {
    canInviteMembers: true,
    canRemoveMembers: true,
    canUpdateRoles: true,
    canManageContent: true,
    canDeleteGroup: true,
    canUpdateSettings: true,
  },
  moderator: {
    canInviteMembers: true,
    canRemoveMembers: true,
    canUpdateRoles: false,
    canManageContent: true,
    canDeleteGroup: false,
    canUpdateSettings: false,
  },
  member: {
    canInviteMembers: false,
    canRemoveMembers: false,
    canUpdateRoles: false,
    canManageContent: false,
    canDeleteGroup: false,
    canUpdateSettings: false,
  },
};

export interface WorkoutAnalytics {
  totalWorkouts: number;
  totalDuration: number; // in minutes
  totalCalories: number;
  averageIntensity: number;
  topMuscleGroups: Array<{ name: string; count: number }>;
  completionRate: number;
}

export interface UserEngagement {
  workoutsShared: number;
  likesReceived: number;
  commentsReceived: number;
  challengesParticipated: number;
  challengesWon: number;
  consistency: number;
  influenceScore: number;
}

export interface WorkoutChallenge {
  id: string;
  groupId: string;
  creatorId: string;
  title: string;
  description: string;
  type: 'duration' | 'frequency' | 'calories' | 'custom';
  goal: number;
  startDate: string;
  endDate: string;
  participants: string[];
  progress: Record<string, number>; // userId -> progress mapping
  createdAt: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  rules: string[];
  rewards: string[];
  metrics?: {
    participationRate: number;
    averageProgress: number;
    topPerformer: string;
  };
}

export interface ChallengeProgress {
  challengeId: string;
  userId: string;
  currentValue: number;
  lastUpdated: string;
  milestones: Array<{
    value: number;
    achievedAt: string;
  }>;
}

export interface ChallengeLeaderboard {
  challengeId: string;
  rankings: Array<{
    userId: string;
    displayName: string;
    profilePicture?: string;
    progress: number;
    rank: number;
    trend: 'up' | 'down' | 'same';
  }>;
  lastUpdated: string;
}
