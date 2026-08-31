import { readJSON, writeJSON } from './storage';

// Per-category progress for the chart table.
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

export interface Progress {
  cats: Record<string, CategoryProgress>;
  // ISO yyyy-mm-dd for each day the user answered anything, most recent last.
  days: string[];
}

const EMPTY: Progress = { cats: {}, days: [] };

function isCategoryProgress(v: unknown): v is CategoryProgress {
  if (typeof v !== 'object' || v === null) return false;
  const c = v as Record<string, unknown>;
  return (
    typeof c.answered === 'number' &&
    typeof c.correct === 'number' &&
    typeof c.last === 'number'
  );
}

// Hand-edited or older-shaped storage reads as "no progress" rather than
// crashing a render deep in the hub.
function coerce(raw: unknown): Progress {
  if (typeof raw !== 'object' || raw === null) return EMPTY;
  const r = raw as Record<string, unknown>;
  const cats: Record<string, CategoryProgress> = {};
  if (typeof r.cats === 'object' && r.cats !== null) {
    for (const [id, value] of Object.entries(r.cats as Record<string, unknown>)) {
      if (isCategoryProgress(value)) cats[id] = value;
    }
  }
  const days = Array.isArray(r.days) ? r.days.filter((d): d is string => typeof d === 'string') : [];
  return { cats, days };
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
export function recordAnswer(categoryId: string, correct: boolean, now = Date.now()): Progress {
  const prev = readProgress();
  const cur = prev.cats[categoryId] ?? { answered: 0, correct: 0, last: 0 };
  const next: Progress = {
    cats: {
      ...prev.cats,
      [categoryId]: {
        answered: cur.answered + 1,
        correct: cur.correct + (correct ? 1 : 0),
        last: now,
      },
    },
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
