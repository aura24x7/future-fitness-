import {
  Badge,
  UserBadge,
  BadgeProgress,
  BadgeCategory,
  BadgeRarity,
} from '../types/achievements';

class AchievementService {
  private readonly badges: Badge[] = [
    // Workout Badges
    {
      id: 'workout-beginner',
      name: 'Workout Rookie',
      description: 'Complete your first workout',
      category: 'workout',
      rarity: 'common',
      iconName: 'barbell',
      criteria: {
        type: 'workoutCount',
        value: 1,
      },
      colorScheme: {
        primary: '#10B981',
        secondary: '#D1FAE5',
        text: '#065F46',
      },
    },
    {
      id: 'workout-intermediate',
      name: 'Fitness Enthusiast',
      description: 'Complete 50 workouts',
      category: 'workout',
      rarity: 'rare',
      iconName: 'fitness',
      criteria: {
        type: 'workoutCount',
        value: 50,
      },
      colorScheme: {
        primary: '#6366F1',
        secondary: '#E0E7FF',
        text: '#3730A3',
      },
    },
    // Challenge Badges
    {
      id: 'challenge-winner',
      name: 'Challenge Champion',
      description: 'Win your first challenge',
      category: 'challenge',
      rarity: 'rare',
      iconName: 'trophy',
      criteria: {
        type: 'challengesWon',
        value: 1,
      },
      colorScheme: {
        primary: '#F59E0B',
        secondary: '#FEF3C7',
        text: '#92400E',
      },
    },
    // Consistency Badges
    {
      id: 'consistency-streak',
      name: 'Consistency King',
      description: 'Maintain a 7-day workout streak',
      category: 'consistency',
      rarity: 'epic',
      iconName: 'flame',
      criteria: {
        type: 'workoutStreak',
        value: 7,
      },
      colorScheme: {
        primary: '#EF4444',
        secondary: '#FEE2E2',
        text: '#991B1B',
      },
    },
    // Social Badges
    {
      id: 'social-influencer',
      name: 'Fitness Influencer',
      description: 'Receive 100 likes on your shared workouts',
      category: 'social',
      rarity: 'legendary',
      iconName: 'star',
      criteria: {
        type: 'likesReceived',
        value: 100,
      },
      colorScheme: {
        primary: '#8B5CF6',
        secondary: '#EDE9FE',
        text: '#5B21B6',
      },
    },
  ];

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    try {
      // TODO: Replace with actual API call
      // For now, return mock data
      const mockUserBadges: UserBadge[] = this.badges.map(badge => ({
        ...badge,
        earnedAt: Math.random() > 0.5 ? new Date().toISOString() : '',
        progress: Math.floor(Math.random() * badge.criteria.value),
        isComplete: Math.random() > 0.7,
      }));

      return mockUserBadges;
    } catch (error) {
      console.error('Error fetching user badges:', error);
      throw error;
    }
  }

  async getBadgeProgress(userId: string, badgeId: string): Promise<BadgeProgress> {
    try {
      // TODO: Replace with actual API call
      const badge = this.badges.find(b => b.id === badgeId);
      if (!badge) {
        throw new Error('Badge not found');
      }

      const progress: BadgeProgress = {
        badgeId,
        currentValue: Math.floor(Math.random() * badge.criteria.value),
        targetValue: badge.criteria.value,
        isComplete: false,
      };

      progress.isComplete = progress.currentValue >= progress.targetValue;

      return progress;
    } catch (error) {
      console.error('Error fetching badge progress:', error);
      throw error;
    }
  }

  async checkBadgeEligibility(
    userId: string,
    category: BadgeCategory,
    metricType: string,
    value: number
  ): Promise<Badge[]> {
    try {
      const eligibleBadges = this.badges.filter(
        badge =>
          badge.category === category &&
          badge.criteria.type === metricType &&
          value >= badge.criteria.value
      );

      return eligibleBadges;
    } catch (error) {
      console.error('Error checking badge eligibility:', error);
      throw error;
    }
  }

  async awardBadge(userId: string, badgeId: string): Promise<void> {
    try {
      // TODO: Replace with actual API call
      console.log(`Awarding badge ${badgeId} to user ${userId}`);
    } catch (error) {
      console.error('Error awarding badge:', error);
      throw error;
    }
  }

  async getRecentAchievements(userId: string): Promise<UserBadge[]> {
    try {
      // TODO: Replace with actual API call
      const allBadges = await this.getUserBadges(userId);
      return allBadges
        .filter(badge => badge.isComplete)
        .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
        .slice(0, 5);
    } catch (error) {
      console.error('Error fetching recent achievements:', error);
      throw error;
    }
  }

  getBadgesByCategory(category: BadgeCategory): Badge[] {
    return this.badges.filter(badge => badge.category === category);
  }

  getBadgesByRarity(rarity: BadgeRarity): Badge[] {
    return this.badges.filter(badge => badge.rarity === rarity);
  }

  async updateBadgeProgress(
    userId: string,
    category: BadgeCategory,
    metricType: string,
    value: number
  ): Promise<Badge[]> {
    try {
      const eligibleBadges = await this.checkBadgeEligibility(
        userId,
        category,
        metricType,
        value
      );

      for (const badge of eligibleBadges) {
        await this.awardBadge(userId, badge.id);
      }

      return eligibleBadges;
    } catch (error) {
      console.error('Error updating badge progress:', error);
      throw error;
    }
  }
}

export const achievementService = new AchievementService();
