import { readJSON, writeJSON } from './storage';

// The answer ledger.
//
// The design shows mastery percentages, a drilled total and a day streak on
// the hub. Those are real numbers here rather than decoration: every answered
// question is recorded, and the figures are derived from that record. A fresh
// install therefore reads 0% / 0 / 0 rather than showing invented progress.
//
// Storage goes through ../../lib/storage, so it inherits that module's
// swallow-everything behaviour: if localStorage is unavailable the drill still
// runs, it just forgets between sessions.

const STORAGE_KEY = 'charttable:progress';

export interface CategoryProgress {
  answered: number;
  correct: number;
  // Epoch ms of the last answer in this category, or 0 if never drilled.
  last: number;
}

// Per-question (or per-compass-point) tallies. This is the grain the weak-spot
// list needs: a category mastery of 62% says nothing about WHICH questions are
// costing it. Kept deliberately thin - two counters, no timestamps, no answer
// history - because the only question asked of it is "how often is this one
// wrong".
export interface ItemProgress {
  answered: number;
  correct: number;
}

export interface Progress {
  cats: Record<string, CategoryProgress>;
  // Keyed by question id for the written bank ('nl-01'), and by
  // '<type>:<abbr>' for compass points - see itemIdForPoint in ./syllabus.
  items: Record<string, ItemProgress>;
  // ISO yyyy-mm-dd for each day the user answered anything, most recent last.
  days: string[];
}

const EMPTY: Progress = { cats: {}, items: {}, days: [] };

function isCategoryProgress(v: unknown): v is CategoryProgress {
  if (typeof v !== 'object' || v === null) return false;
  const c = v as Record<string, unknown>;
  return (
    typeof c.answered === 'number' &&
    typeof c.correct === 'number' &&
    typeof c.last === 'number'
  );
}

function isItemProgress(v: unknown): v is ItemProgress {
  if (typeof v !== 'object' || v === null) return false;
  const c = v as Record<string, unknown>;
  return typeof c.answered === 'number' && typeof c.correct === 'number';
}

// Hand-edited or older-shaped storage reads as "no progress" rather than
// crashing a render deep in the hub. A ledger written before per-item tallies
// existed simply has no `items` key, and reads back with an empty one - the
// category figures it does carry survive untouched.
function coerce(raw: unknown): Progress {
  if (typeof raw !== 'object' || raw === null) return EMPTY;
  const r = raw as Record<string, unknown>;
  const cats: Record<string, CategoryProgress> = {};
  if (typeof r.cats === 'object' && r.cats !== null) {
    for (const [id, value] of Object.entries(r.cats as Record<string, unknown>)) {
      if (isCategoryProgress(value)) cats[id] = value;
    }
  }
  const items: Record<string, ItemProgress> = {};
  if (typeof r.items === 'object' && r.items !== null) {
    for (const [id, value] of Object.entries(r.items as Record<string, unknown>)) {
      if (isItemProgress(value)) items[id] = value;
    }
  }
  const days = Array.isArray(r.days) ? r.days.filter((d): d is string => typeof d === 'string') : [];
  return { cats, items, days };
}

export function readProgress(): Progress {
  return coerce(readJSON<unknown>(STORAGE_KEY, EMPTY));
}

export function clearProgress(): void {
  writeJSON(STORAGE_KEY, EMPTY);
}

function isoDay(ms: number): string {
  const d = new Date(ms);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

// Records one answered question and returns the updated progress, so a caller
// can hand the new value straight to setState without re-reading storage.
//
// `itemId` is optional: a caller that has no stable id for what it just asked
// still gets its category tally updated, it just contributes nothing to the
// weak-spot list.
export function recordAnswer(
  categoryId: string,
  correct: boolean,
  itemId: string | null = null,
  now = Date.now()
): Progress {
  const prev = readProgress();
  const cur = prev.cats[categoryId] ?? { answered: 0, correct: 0, last: 0 };
  const items = { ...prev.items };
  if (itemId) {
    const item = items[itemId] ?? { answered: 0, correct: 0 };
    items[itemId] = {
      answered: item.answered + 1,
      correct: item.correct + (correct ? 1 : 0),
    };
  }
  const next: Progress = {
    cats: {
      ...prev.cats,
      [categoryId]: {
        answered: cur.answered + 1,
        correct: cur.correct + (correct ? 1 : 0),
        last: now,
      },
    },
    items,
    days: prev.days,
  };

  const today = isoDay(now);
  if (next.days[next.days.length - 1] !== today) {
    // Keep the tail bounded - a streak only ever reads backwards from today,
    // so unbounded history earns nothing.
    next.days = [...next.days, today].slice(-400);
  }

  writeJSON(STORAGE_KEY, next);
  return next;
}

export function masteryPct(p: Progress, categoryId: string): number {
  const c = p.cats[categoryId];
  if (!c || c.answered === 0) return 0;
  return Math.round((c.correct / c.answered) * 100);
}

export function overallPct(p: Progress): number {
  let answered = 0;
  let correct = 0;
  for (const c of Object.values(p.cats)) {
    answered += c.answered;
    correct += c.correct;
  }
  if (answered === 0) return 0;
  return Math.round((correct / answered) * 100);
}

export function totalAnswered(p: Progress): number {
  return Object.values(p.cats).reduce((n, c) => n + c.answered, 0);
}

// Consecutive days ending today or yesterday. Counting yesterday as alive
// means the streak does not vanish at midnight before the day is used.
export function streakDays(p: Progress, now = Date.now()): number {
  if (p.days.length === 0) return 0;
  const seen = new Set(p.days);
  const dayMs = 86_400_000;

  let cursor = now;
  if (!seen.has(isoDay(cursor))) {
    cursor -= dayMs;
    if (!seen.has(isoDay(cursor))) return 0;
  }

  let n = 0;
  while (seen.has(isoDay(cursor))) {
    n += 1;
    cursor -= dayMs;
  }
  return n;
}

// "2 d", "today", or an em dash when the category has never been drilled.
export function lastDrilledLabel(p: Progress, categoryId: string, now = Date.now()): string {
  const c = p.cats[categoryId];
  if (!c || c.last === 0) return '—';
  const days = Math.floor((now - c.last) / 86_400_000);
  if (days <= 0) return 'today';
  return `${days} d`;
}

// ── Weak spots ───────────────────────────────────────────────────────────
//
// "What am I missing in this category", read straight off the per-item
// tallies. Two rules keep the list honest rather than merely noisy:
//
//   * an item needs at least WEAK_MIN_ATTEMPTS answers before it can appear,
//     so one unlucky first guess is not reported as a 0% weak spot; and
//   * an item answered right every time is never a weak spot, however few
//     times it has been seen.
//
// Everything below takes the category's item ids from the caller. The ledger
// does not know which questions belong to which category - ./syllabus does -
// and keeping it that way means the ledger never has to be migrated when the
// bank grows.

export const WEAK_MIN_ATTEMPTS = 2;

export interface WeakSpot {
  id: string;
  answered: number;
  correct: number;
  // Accuracy, 0-100, rounded.
  pct: number;
}

export function itemPct(item: ItemProgress): number {
  if (item.answered === 0) return 0;
  return Math.round((item.correct / item.answered) * 100);
}

// Total answers recorded against this set of items. What the "not enough
// history yet" state is decided on.
export function itemsAnswered(p: Progress, itemIds: readonly string[]): number {
  return itemIds.reduce((n, id) => n + (p.items[id]?.answered ?? 0), 0);
}

// The lowest-accuracy items in a category, worst first. Ties break towards the
// one answered most often, which is the one there is most evidence about.
export function weakSpots(
  p: Progress,
  itemIds: readonly string[],
  limit = 5
): WeakSpot[] {
  const spots: WeakSpot[] = [];
  for (const id of itemIds) {
    const item = p.items[id];
    if (!item || item.answered < WEAK_MIN_ATTEMPTS) continue;
    if (item.correct === item.answered) continue;
    spots.push({ id, answered: item.answered, correct: item.correct, pct: itemPct(item) });
  }
  spots.sort((a, b) => a.pct - b.pct || b.answered - a.answered);
  return spots.slice(0, limit);
}

// The queue filter behind "focus on weak spots": missed more often than got
// right. Deliberately stricter than `weakSpots` above, which is a report and
// so includes anything imperfect - this one decides what to re-drill, and a
// question answered 4 out of 5 does not need re-drilling.
export function isWeakItem(p: Progress, itemId: string): boolean {
  const item = p.items[itemId];
  if (!item || item.answered < WEAK_MIN_ATTEMPTS) return false;
  return item.correct * 2 < item.answered;
}
