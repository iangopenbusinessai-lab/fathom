import type { ComponentType } from 'react';
import type { SessionPlan } from './lib/session';

// A run the category screen has already configured: which of the drill's own
// modes to enter, and how its queue is to be built. Present means the drill
// starts straight into that run instead of showing its menu.
export interface DrillStart {
  mode: GameMode;
  plan: SessionPlan;
}

// What the hub hands a drill when a category card launches it: the id of the
// syllabus category the user picked, so the drill can open on that category
// rather than on its own top-level menu. Undefined means "opened cold" - the
// drill shows its own menu from the start, unplanned, exactly as it always
// has.
export interface DrillProps {
  focus?: string;
  start?: DrillStart;
  // Where "back" goes when the drill was launched from a category screen. A
  // drill opened cold has none and falls back to its own menu.
  onExit?: () => void;
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
