export interface ProgressState {
  progress: number;
  displayValue: number;
  exceeded: boolean;
}

export interface MacroProgress extends ProgressState {
  target: number;
  current: number;
}

export interface CalorieProgress extends ProgressState {
  remaining: number;
  total: number;
} 