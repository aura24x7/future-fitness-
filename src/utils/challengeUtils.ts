import { WorkoutChallenge } from '../types/group';

export const CHALLENGE_TYPES = [
  {
    id: 'duration',
    name: 'Duration Challenge',
    description: 'Complete a target amount of workout minutes',
    icon: 'time',
    unitLabel: 'minutes',
    examples: ['Complete 500 minutes of workouts', 'Workout for 1000 minutes'],
  },
  {
    id: 'frequency',
    name: 'Frequency Challenge',
    description: 'Complete a specific number of workouts',
    icon: 'calendar',
    unitLabel: 'workouts',
    examples: ['Complete 20 workouts', 'Finish 30 workouts'],
  },
  {
    id: 'calories',
    name: 'Calorie Challenge',
    description: 'Burn a target amount of calories',
    icon: 'flame',
    unitLabel: 'calories',
    examples: ['Burn 5000 calories', 'Reach 10000 calories burned'],
  },
  {
    id: 'custom',
    name: 'Custom Challenge',
    description: 'Create a custom challenge with specific goals',
    icon: 'create',
    unitLabel: 'custom',
    examples: ['Complete 100 push-ups', 'Run 50 kilometers'],
  },
] as const;

export const CHALLENGE_DURATIONS = [
  {
    id: '7days',
    name: '1 Week',
    days: 7,
  },
  {
    id: '14days',
    name: '2 Weeks',
    days: 14,
  },
  {
    id: '30days',
    name: '30 Days',
    days: 30,
  },
  {
    id: 'custom',
    name: 'Custom Duration',
    days: 0,
  },
] as const;

export const DEFAULT_CHALLENGE_RULES = [
  'Workouts must be logged in the app',
  'Only completed workouts count towards progress',
  'Progress updates daily at midnight',
  'Participants must join before challenge starts',
];

export const SUGGESTED_REWARDS = [
  'Champion Badge',
  'Featured on Group Leaderboard',
  'Special Profile Achievement',
  'Group Recognition',
];

export function generateChallengeTitle(type: string, goal: number): string {
  switch (type) {
    case 'duration':
      return `${goal} Minutes Challenge`;
    case 'frequency':
      return `${goal} Workouts Challenge`;
    case 'calories':
      return `${goal} Calories Challenge`;
    default:
      return 'Custom Challenge';
  }
}

export function calculateChallengeProgress(
  challenge: WorkoutChallenge,
  currentValue: number
): number {
  return Math.min((currentValue / challenge.goal) * 100, 100);
}

export function getRecommendedGoal(type: string, days: number): number {
  switch (type) {
    case 'duration':
      return days * 30; // 30 minutes per day
    case 'frequency':
      return Math.ceil(days * 0.7); // 70% of days
    case 'calories':
      return days * 300; // 300 calories per day
    default:
      return 0;
  }
}

export function validateChallenge(challenge: Partial<WorkoutChallenge>): string[] {
  const errors: string[] = [];

  if (!challenge.title?.trim()) {
    errors.push('Challenge title is required');
  }

  if (!challenge.description?.trim()) {
    errors.push('Challenge description is required');
  }

  if (!challenge.type) {
    errors.push('Challenge type is required');
  }

  if (!challenge.goal || challenge.goal <= 0) {
    errors.push('Challenge goal must be greater than 0');
  }

  if (!challenge.startDate || !challenge.endDate) {
    errors.push('Challenge start and end dates are required');
  } else {
    const start = new Date(challenge.startDate);
    const end = new Date(challenge.endDate);
    if (end <= start) {
      errors.push('End date must be after start date');
    }
  }

  return errors;
}

export function formatChallengeValue(type: string, value: number): string {
  switch (type) {
    case 'duration':
      return `${value} min`;
    case 'frequency':
      return `${value} workouts`;
    case 'calories':
      return `${value} cal`;
    default:
      return value.toString();
  }
}

export function getChallengeTypeIcon(type: string): string {
  return CHALLENGE_TYPES.find(t => t.id === type)?.icon || 'trophy';
}

export function getDurationInDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
