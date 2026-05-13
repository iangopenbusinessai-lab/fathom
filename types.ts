export interface CompassPoint {
  index: number;
  abbr: string; // e.g., NxE or "Stbd Bow"
  full: string; // e.g., North by East or "Broad on Starboard Bow"
  angle: number; // Degrees from North/Dead Ahead (0)
  type: 'cardinal' | 'intercardinal' | 'secondary-intercardinal' | 'tertiary-intercardinal';
}

export type GameState = 'idle' | 'playing' | 'finished';

export type GameMode = 'practice' | 'timed' | 'exam';

export type GameType = 'compass' | 'relative';

export interface GameStats {
  score: number;
  bestScore: number;
  totalAttempts: number;
}