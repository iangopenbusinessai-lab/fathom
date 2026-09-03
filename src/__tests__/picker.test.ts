import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  getPool,
  pickExcluding,
  CATEGORY_ORDER,
} from '../drills/colregs';
import {
  COLREGS_QUESTIONS,
  COLREGS_QUESTIONS_BY_CATEGORY,
  CATEGORY_LABELS,
  ColregsCategory,
} from '../drills/colregs/constants';
import { DEFAULT_PLAN, planQueue, SessionPlan } from '../lib/session';
import { Progress } from '../lib/progress';

const EMPTY_LEDGER: Progress = { cats: {}, items: {}, days: [] };

// An unplanned practice run draws WITH replacement and runs without end, so
// "no repeats" cannot mean what it means for a deck. What it does mean, and
// what pickExcluding exists to guarantee, is that the question just answered
// is never the question drawn next. The complaint that questions "feel like
// they repeat" is the reason this is pinned rather than assumed.

// A seeded generator, so a failure here is a real one and not a run of bad
// luck that vanishes on re-run.
function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

afterEach(() => vi.restoreAllMocks());

const CATEGORIES = Object.keys(COLREGS_QUESTIONS_BY_CATEGORY) as ColregsCategory[];

describe('every category draws through the shared picker', () => {
  it('has a pool, a label and a place in the drill menu', () => {
    for (const cat of CATEGORIES) {
      expect(getPool(cat).length).toBeGreaterThan(0);
      expect(CATEGORY_LABELS[cat]).toBeTruthy();
      expect(CATEGORY_ORDER).toContain(cat);
    }
    // 'all' plus one entry per category, and nothing else - a category added
    // to the bank but not to the menu would be undrillable, and one in the
    // menu with no pool would open an empty run.
    expect(CATEGORY_ORDER).toHaveLength(CATEGORIES.length + 1);
    expect(CATEGORY_ORDER[0]).toBe('all');
  });

  it('routes the whole bank through the category pools, with nothing orphaned', () => {
    const pooled = CATEGORIES.flatMap(cat => getPool(cat).map(q => q.id)).sort();
    const all = getPool('all').map(q => q.id).sort();
    expect(pooled).toEqual(all);
    expect(all).toEqual(COLREGS_QUESTIONS.map(q => q.id).sort());
    // Each question sits in the pool its own `category` field names, so no
    // category can be drawing from a bank that is not its own.
    for (const cat of CATEGORIES) {
      for (const q of getPool(cat)) expect(q.category).toBe(cat);
    }
  });
});

describe('unplanned practice never repeats a question back to back', () => {
  for (const filter of ['all', ...CATEGORIES] as const) {
    it(`${filter}: no immediate repeat, and an even spread`, () => {
      vi.spyOn(Math, 'random').mockImplementation(seeded(9001 + filter.length));
      const pool = getPool(filter);
      // Scaled to the pool so every question is expected ~100 times whatever
      // its size. A fixed draw count would give the 227-question 'all' pool an
      // expectation of a handful, where ordinary variance swamps any bias the
      // band is meant to catch.
      const draws = pool.length * 100;
      let last: string | null = null;
      const seen = new Map<string, number>();

      for (let i = 0; i < draws; i++) {
        const drawn = pickExcluding(pool, last);
        expect(drawn.id).not.toBe(last);
        seen.set(drawn.id, (seen.get(drawn.id) ?? 0) + 1);
        last = drawn.id;
      }

      // Every question in the pool must actually come up, and none may
      // dominate: with the previous question excluded each draw, the expected
      // share is 1/n, and a generous band around it catches a picker that has
      // regressed to favouring part of the bank without failing on variance.
      expect(seen.size).toBe(pool.length);
      const expected = draws / pool.length;
      for (const [id, n] of seen) {
        expect(n, `${filter}/${id} drawn ${n} times, expected ~${expected.toFixed(1)}`)
          .toBeGreaterThan(expected * 0.6);
        expect(n, `${filter}/${id} drawn ${n} times, expected ~${expected.toFixed(1)}`)
          .toBeLessThan(expected * 1.4);
      }
    });
  }
});

describe('deck runs draw without replacement', () => {
  const plans: Array<[string, SessionPlan]> = [
    ['default', DEFAULT_PLAN],
    ['count 10', { count: 10, perQuestionMs: null, weakSpotsOnly: false }],
    ['count 20 weak-spots', { count: 20, perQuestionMs: null, weakSpotsOnly: true }],
  ];

  for (const filter of ['all', ...CATEGORIES] as const) {
    it(`${filter}: no question appears twice in one deck`, () => {
      vi.spyOn(Math, 'random').mockImplementation(seeded(4242 + filter.length));
      const pool = getPool(filter);
      for (const [name, plan] of plans) {
        const queue = planQueue(pool, q => q.id, plan, EMPTY_LEDGER);
        const ids = queue.map(q => q.id);
        expect(new Set(ids).size, `${filter} / ${name}`).toBe(ids.length);
        expect(ids.length).toBeLessThanOrEqual(pool.length);
        expect(ids.length).toBeGreaterThan(0);
      }
    });
  }
});
