import { WorkoutChallenge } from '../types/group';

class ChallengeService {
  private challenges: WorkoutChallenge[] = [];

  async createChallenge(challenge: WorkoutChallenge): Promise<WorkoutChallenge> {
    // TODO: Implement API call to create challenge
    const newChallenge = {
      ...challenge,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      participants: [],
      progress: {},
    };
    this.challenges.push(newChallenge);
    return newChallenge;
  }

  async getChallenges(): Promise<WorkoutChallenge[]> {
    // TODO: Implement API call to fetch challenges
    return this.challenges;
  }

  async joinChallenge(challengeId: string, userId: string): Promise<void> {
    // TODO: Implement API call to join challenge
    const challenge = this.challenges.find((c) => c.id === challengeId);
    if (challenge && !challenge.participants.includes(userId)) {
      challenge.participants.push(userId);
      challenge.progress[userId] = 0;
    }
  }

  async leaveChallenge(challengeId: string, userId: string): Promise<void> {
    // TODO: Implement API call to leave challenge
    const challenge = this.challenges.find((c) => c.id === challengeId);
    if (challenge) {
      challenge.participants = challenge.participants.filter((id) => id !== userId);
      delete challenge.progress[userId];
    }
  }

  async updateProgress(
    challengeId: string,
    userId: string,
    progress: number
  ): Promise<void> {
    // TODO: Implement API call to update progress
    const challenge = this.challenges.find((c) => c.id === challengeId);
    if (challenge) {
      challenge.progress[userId] = progress;
    }
  }

  async getParticipantProgress(
    challengeId: string,
    userId: string
  ): Promise<number> {
    // TODO: Implement API call to get participant progress
    const challenge = this.challenges.find((c) => c.id === challengeId);
    return challenge?.progress[userId] || 0;
  }

  async getChallengeLeaderboard(
    challengeId: string
  ): Promise<{ userId: string; progress: number }[]> {
    // TODO: Implement API call to get challenge leaderboard
    const challenge = this.challenges.find((c) => c.id === challengeId);
    if (!challenge) return [];

    return Object.entries(challenge.progress)
      .map(([userId, progress]) => ({
        userId,
        progress,
      }))
      .sort((a, b) => b.progress - a.progress);
  }

  async getActiveChallenges(userId: string): Promise<WorkoutChallenge[]> {
    // TODO: Implement API call to get active challenges for user
    const now = new Date();
    return this.challenges.filter(
      (challenge) =>
        challenge.participants.includes(userId) &&
        new Date(challenge.startDate) <= now &&
        new Date(challenge.endDate) >= now
    );
  }

  async getPastChallenges(userId: string): Promise<WorkoutChallenge[]> {
    // TODO: Implement API call to get past challenges for user
    const now = new Date();
    return this.challenges.filter(
      (challenge) =>
        challenge.participants.includes(userId) &&
        new Date(challenge.endDate) < now
    );
  }

  async getUpcomingChallenges(userId: string): Promise<WorkoutChallenge[]> {
    // TODO: Implement API call to get upcoming challenges for user
    const now = new Date();
    return this.challenges.filter(
      (challenge) =>
        challenge.participants.includes(userId) &&
        new Date(challenge.startDate) > now
    );
  }

  async deleteChallenge(challengeId: string): Promise<void> {
    // TODO: Implement API call to delete challenge
    this.challenges = this.challenges.filter((c) => c.id !== challengeId);
  }

  async updateChallenge(
    challengeId: string,
    updates: Partial<WorkoutChallenge>
  ): Promise<WorkoutChallenge> {
    // TODO: Implement API call to update challenge
    const challenge = this.challenges.find((c) => c.id === challengeId);
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    const updatedChallenge = {
      ...challenge,
      ...updates,
      id: challengeId,
    };

    this.challenges = this.challenges.map((c) =>
      c.id === challengeId ? updatedChallenge : c
    );

    return updatedChallenge;
  }
}

export const challengeService = new ChallengeService();
