import { describe, it, expect } from 'vitest';
import {
  DEFAULT_PLAN,
  MIN_WEAK_SESSION,
  SessionPlan,
  isDefaultPlan,
  planQueue,
} from '../lib/session';
import { Progress, isWeakItem, itemsAnswered, weakSpots } from '../lib/progress';

// A pool of plain ids stands in for a question bank - planQueue is generic
// over whatever the drill queues, and the ids are all it looks at.
const POOL = Array.from({ length: 24 }, (_, i) => `q${i}`);
const idOf = (id: string) => id;

function ledger(items: Record<string, [correct: number, answered: number]>): Progress {
  const out: Progress = { cats: {}, items: {}, days: [] };
  for (const [id, [correct, answered]] of Object.entries(items)) {
    out.items[id] = { correct, answered };
  }
  return out;
}

const EMPTY_LEDGER = ledger({});

describe('the default plan leaves a run exactly as it was', () => {
  it('is the do-nothing plan', () => {
    expect(isDefaultPlan(DEFAULT_PLAN)).toBe(true);
    expect(DEFAULT_PLAN).toEqual({ count: null, perQuestionMs: null, weakSpotsOnly: false });
  });

  it('queues the whole pool, which is what a plain shuffle did', () => {
    for (let i = 0; i < 50; i++) {
      const queue = planQueue(POOL, idOf, DEFAULT_PLAN, EMPTY_LEDGER);
      expect(queue).toHaveLength(POOL.length);
      expect([...queue].sort()).toEqual([...POOL].sort());
    }
  });

  it('shuffles - a default run is not the pool in source order', () => {
    const moved = Array.from({ length: 20 }, () =>
      planQueue(POOL, idOf, DEFAULT_PLAN, EMPTY_LEDGER)
    ).some((queue) => queue.some((id, i) => id !== POOL[i]));
    expect(moved).toBe(true);
  });

  it('ignores the ledger entirely when weak spots are off', () => {
    const heavilyMissed = ledger(Object.fromEntries(POOL.map((id) => [id, [0, 9]])));
    const queue = planQueue(POOL, idOf, DEFAULT_PLAN, heavilyMissed);
    expect([...queue].sort()).toEqual([...POOL].sort());
  });
});

describe('question count', () => {
  const plan = (count: number | null): SessionPlan => ({ ...DEFAULT_PLAN, count });

  it('cuts the queue to the count asked for', () => {
    expect(planQueue(POOL, idOf, plan(10), EMPTY_LEDGER)).toHaveLength(10);
    expect(planQueue(POOL, idOf, plan(20), EMPTY_LEDGER)).toHaveLength(20);
  });

  it('never asks for more than the pool holds', () => {
    expect(planQueue(POOL.slice(0, 6), idOf, plan(20), EMPTY_LEDGER)).toHaveLength(6);
  });

  it('queues no question twice', () => {
    const queue = planQueue(POOL, idOf, plan(10), EMPTY_LEDGER);
    expect(new Set(queue).size).toBe(queue.length);
  });
});

describe('focus on weak spots', () => {
  // q0-q5 are missed more often than not; the rest are solid.
  const WEAK = ['q0', 'q1', 'q2', 'q3', 'q4', 'q5'];
  const progress = ledger({
    ...Object.fromEntries(WEAK.map((id) => [id, [1, 4]] as const)),
    q6: [4, 4],
    q7: [3, 4],
    // Seen once and missed: too little evidence to count as weak.
    q8: [0, 1],
  });
  const weakPlan = (count: number | null): SessionPlan => ({
    ...DEFAULT_PLAN,
    weakSpotsOnly: true,
    count,
  });

  it('agrees with isWeakItem about what is weak', () => {
    for (const id of WEAK) expect(isWeakItem(progress, id)).toBe(true);
    expect(isWeakItem(progress, 'q6')).toBe(false);
    expect(isWeakItem(progress, 'q7')).toBe(false);
    // One attempt is not enough evidence, however badly it went.
    expect(isWeakItem(progress, 'q8')).toBe(false);
    // Never answered at all is not weak, it is unknown.
    expect(isWeakItem(progress, 'q9')).toBe(false);
  });

  it('puts every weak question ahead of the rest', () => {
    const queue = planQueue(POOL, idOf, weakPlan(null), progress);
    expect([...queue].sort()).toEqual([...WEAK].sort());
  });

  it('widens into the rest of the pool to fill a bigger count', () => {
    const queue = planQueue(POOL, idOf, weakPlan(10), progress);
    expect(queue).toHaveLength(10);
    // All six weak ones are in, and the four fillers are not weak.
    for (const id of WEAK) expect(queue).toContain(id);
    expect(queue.slice(0, 6).sort()).toEqual([...WEAK].sort());
  });

  it('still yields a usable run when nothing is weak yet', () => {
    const queue = planQueue(POOL, idOf, weakPlan(null), EMPTY_LEDGER);
    expect(queue).toHaveLength(MIN_WEAK_SESSION);
    expect(new Set(queue).size).toBe(queue.length);
  });

  it('honours an explicit count even with no weak questions at all', () => {
    expect(planQueue(POOL, idOf, weakPlan(20), EMPTY_LEDGER)).toHaveLength(20);
  });

  it('never returns more than the pool, however small', () => {
    const tiny = POOL.slice(0, 3);
    expect(planQueue(tiny, idOf, weakPlan(null), EMPTY_LEDGER)).toHaveLength(3);
  });
});

describe('the weak-spot report', () => {
  const progress = ledger({
    a: [0, 4], // 0%
    b: [1, 4], // 25%
    c: [3, 4], // 75%
    d: [4, 4], // perfect - never a weak spot
    e: [0, 1], // one attempt - not enough evidence
    f: [1, 8], // 13%, and the most evidence
  });
  const ids = ['a', 'b', 'c', 'd', 'e', 'f'];

  it('lists the lowest accuracy first', () => {
    expect(weakSpots(progress, ids).map((s) => s.id)).toEqual(['a', 'f', 'b', 'c']);
  });

  it('leaves out anything answered right every time', () => {
    expect(weakSpots(progress, ids).map((s) => s.id)).not.toContain('d');
  });

  it('leaves out anything with too little history to judge', () => {
    expect(weakSpots(progress, ids).map((s) => s.id)).not.toContain('e');
  });

  it('reports the tally behind each one', () => {
    const worst = weakSpots(progress, ids)[0];
    expect(worst).toMatchObject({ id: 'a', correct: 0, answered: 4, pct: 0 });
  });

  it('caps the list', () => {
    expect(weakSpots(progress, ids, 2)).toHaveLength(2);
  });

  it('says nothing about a category that has never been drilled', () => {
    expect(weakSpots(progress, ['x', 'y'])).toEqual([]);
    expect(itemsAnswered(progress, ['x', 'y'])).toBe(0);
  });

  it('counts the answers behind a category', () => {
    expect(itemsAnswered(progress, ids)).toBe(4 + 4 + 4 + 4 + 1 + 8);
  });
});
