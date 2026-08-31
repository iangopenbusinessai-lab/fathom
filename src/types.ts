import type { ComponentType } from 'react';

// What the hub hands a drill when a category card launches it: the id of the
// syllabus category the user picked, so the drill can open on that category
// rather than on its own top-level menu. Undefined means "opened cold" - the
// drill shows its own menu from the start.
export interface DrillProps {
  focus?: string;
}

export interface DrillConfig {
  id: string;
  title: string;
  description: string;
  component: ComponentType<DrillProps>;
}

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
