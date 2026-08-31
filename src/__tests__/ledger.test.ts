import { describe, it, expect, beforeEach } from 'vitest';

// src/lib/storage reads window.localStorage behind a try/catch and treats its
// absence as "nothing was persisted", which is right in the browser and
// useless in a test. A stub gives the ledger somewhere to write so the round
// trip - and the read of a ledger written before per-item tallies existed -
// can actually be checked.
const store = new Map<string, string>();

const localStorageStub = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: (i: number) => [...store.keys()][i] ?? null,
  get length() {
    return store.size;
  },
} as unknown as Storage;

(globalThis as { window?: unknown }).window = { localStorage: localStorageStub };

const KEY = 'nauticalmaster:charttable:progress';

const { readProgress, recordAnswer, masteryPct, weakSpots, isWeakItem } = await import(
  '../lib/progress'
);

describe('the answer ledger', () => {
  beforeEach(() => store.clear());

  it('tallies a category and the question inside it from one call', () => {
    recordAnswer('lights', true, 'nl-01');
    recordAnswer('lights', false, 'nl-01');
    recordAnswer('lights', false, 'nl-02');

    const p = readProgress();
    expect(p.cats.lights).toMatchObject({ answered: 3, correct: 1 });
    expect(p.items['nl-01']).toEqual({ answered: 2, correct: 1 });
    expect(p.items['nl-02']).toEqual({ answered: 1, correct: 0 });
    expect(masteryPct(p, 'lights')).toBe(33);
  });

  it('still records the category when the caller has no item id', () => {
    recordAnswer('lights', true);
    const p = readProgress();
    expect(p.cats.lights.answered).toBe(1);
    expect(p.items).toEqual({});
  });

  it('reads a ledger written before per-item tallies existed', () => {
    // The old shape: cats and days, no items key at all.
    store.set(
      KEY,
      JSON.stringify({
        cats: { lights: { answered: 12, correct: 9, last: 1_700_000_000_000 } },
        days: ['2026-08-29'],
      })
    );

    const p = readProgress();
    // The figures it does carry survive untouched...
    expect(p.cats.lights).toMatchObject({ answered: 12, correct: 9 });
    expect(p.days).toEqual(['2026-08-29']);
    // ...and the new grain simply starts empty rather than throwing.
    expect(p.items).toEqual({});
    expect(weakSpots(p, ['nl-01'])).toEqual([]);
    expect(isWeakItem(p, 'nl-01')).toBe(false);

    // Writing on top of it upgrades the shape without losing the old totals.
    recordAnswer('lights', false, 'nl-01');
    const after = readProgress();
    expect(after.cats.lights.answered).toBe(13);
    expect(after.items['nl-01']).toEqual({ answered: 1, correct: 0 });
  });

  it('discards a malformed item rather than crashing a render', () => {
    store.set(
      KEY,
      JSON.stringify({ cats: {}, items: { 'nl-01': 'nonsense', 'nl-02': { answered: 2, correct: 1 } }, days: [] })
    );
    expect(readProgress().items).toEqual({ 'nl-02': { answered: 2, correct: 1 } });
  });
});
