import { Progress, isWeakItem } from './progress';
import { shuffle } from './shuffle';

// How a run is to be built, chosen on the category screen before it starts.
//
// Every field has a "leave it alone" value, and DEFAULT_PLAN is all three of
// them. A drill handed the default plan - or no plan at all - must behave
// exactly as it did before this existed: that is the contract, and
// isDefaultPlan() is what lets a caller check it rather than assume it.
export interface SessionPlan {
  // How many questions to queue. null = every question in the category, which
  // for an untimed practice run means the drill's own endless draw.
  count: number | null;
  // Per-question clock in milliseconds. null = untimed. This is separate from
  // exam mode's fixed 15s, which it does not override.
  perQuestionMs: number | null;
  // Queue only the questions the ledger shows as missed more often than right.
  weakSpotsOnly: boolean;
}

export const DEFAULT_PLAN: SessionPlan = {
  count: null,
  perQuestionMs: null,
  weakSpotsOnly: false,
};

export function isDefaultPlan(plan: SessionPlan): boolean {
  return (
    plan.count === null && plan.perQuestionMs === null && plan.weakSpotsOnly === false
  );
}

// The choices the category screen cycles through. Counts larger than the
// category's pool are dropped at render time rather than here, so a six
// question category does not offer "20".
export const COUNT_CHOICES: (number | null)[] = [null, 10, 20];
export const TIMER_CHOICES: (number | null)[] = [null, 10000, 20000, 30000];

// A weak-spots run with no explicit count still wants to be worth sitting
// down for, so it is topped up to this many questions from the rest of the
// pool when there are fewer weak ones than this.
export const MIN_WEAK_SESSION = 5;

export function countLabel(count: number | null): string {
  return count === null ? 'All' : `${count}`;
}

export function timerLabel(ms: number | null): string {
  return ms === null ? 'Off' : `${Math.round(ms / 1000)}s`;
}

// Builds the queue for a run: which items, in what order, how many.
//
// The widening is the important part. Asking for 20 questions focused on weak
// spots when only 6 are weak must not hand back a 6 question run silently, and
// must not hand back an empty one when nothing is weak yet: the weak ones lead,
// the rest of the pool follows in random order, and the slice takes what it
// needs from the front. So the run is as weak-focused as the ledger can make
// it and no shorter than asked for.
export function planQueue<T>(
  pool: readonly T[],
  idOf: (item: T) => string,
  plan: SessionPlan,
  progress: Progress
): T[] {
  if (pool.length === 0) return [];

  let ordered: T[];
  let weakCount = 0;

  if (plan.weakSpotsOnly) {
    const weak = pool.filter((item) => isWeakItem(progress, idOf(item)));
    const rest = pool.filter((item) => !isWeakItem(progress, idOf(item)));
    weakCount = weak.length;
    ordered = [...shuffle(weak), ...shuffle(rest)];
  } else {
    ordered = shuffle(pool);
  }

  // With no count asked for, a plain run is the whole pool; a weak-spots run
  // is the weak ones, floored so it is not over in two questions.
  const target =
    plan.count ?? (plan.weakSpotsOnly ? Math.max(weakCount, MIN_WEAK_SESSION) : pool.length);

  return ordered.slice(0, Math.min(target, ordered.length));
}
