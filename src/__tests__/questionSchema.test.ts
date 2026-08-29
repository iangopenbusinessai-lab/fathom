import { describe, it, expect } from 'vitest';
import {
  COLREGS_QUESTIONS,
  COLREGS_QUESTIONS_BY_CATEGORY,
  CATEGORY_LABELS,
  ColregsCategory,
} from '../drills/colregs/constants';
import { COMPASS_POINTS, RELATIVE_POINTS } from '../drills/compass/constants';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ColregsCategory[];

describe('colregs question bank: schema', () => {
  it('is not empty', () => {
    expect(COLREGS_QUESTIONS.length).toBeGreaterThan(0);
  });

  it('has no duplicate ids anywhere in the bank', () => {
    const ids = COLREGS_QUESTIONS.map((q) => q.id);
    const seen = new Set<string>();
    const dupes = ids.filter((id) => (seen.has(id) ? true : (seen.add(id), false)));
    expect(dupes).toEqual([]);
  });

  it.each(COLREGS_QUESTIONS.map((q) => [q.id, q] as const))('%s is well-formed', (_id, q) => {
    expect(q.id).toMatch(/^[a-z]{2}-\d{2}$/);
    expect(q.prompt.trim()).not.toBe('');
    expect(q.explanation.trim()).not.toBe('');

    // A complete options array: at least two, all non-empty, none repeated.
    expect(q.options.length).toBeGreaterThanOrEqual(2);
    expect(q.options.every((o) => o.trim() !== '')).toBe(true);
    expect(new Set(q.options).size).toBe(q.options.length);

    // The answer must be one of the options, matched exactly - a near-miss
    // would make the question unanswerable at runtime.
    expect(q.options).toContain(q.correctAnswer);

    expect(CATEGORIES).toContain(q.category);
  });

  it('never has an option that refers to other options by letter', () => {
    // "Both B and C" only works if options render in a fixed order, and they
    // are shuffled. This is the vh-02 bug, kept fixed.
    const offenders = COLREGS_QUESTIONS.filter((q) =>
      q.options.some((o) => /\b(?:both\s+)?[A-D]\s+and\s+[A-D]\b/.test(o))
    );
    expect(offenders.map((q) => q.id)).toEqual([]);
  });
});

describe('colregs question bank: category buckets', () => {
  it.each(CATEGORIES)('%s bucket contains only its own questions', (cat) => {
    const list = COLREGS_QUESTIONS_BY_CATEGORY[cat];
    expect(list.length).toBeGreaterThan(0);
    expect(list.filter((q) => q.category !== cat)).toEqual([]);
  });

  it('buckets partition the combined export exactly', () => {
    const fromBuckets = CATEGORIES.flatMap((c) => COLREGS_QUESTIONS_BY_CATEGORY[c]);
    expect(fromBuckets).toHaveLength(COLREGS_QUESTIONS.length);
    expect(new Set(fromBuckets.map((q) => q.id))).toEqual(
      new Set(COLREGS_QUESTIONS.map((q) => q.id))
    );
  });

  it('every category has a label', () => {
    for (const cat of CATEGORIES) {
      expect(CATEGORY_LABELS[cat].trim()).not.toBe('');
    }
  });
});

describe('compass point sets', () => {
  it.each([
    ['COMPASS_POINTS', COMPASS_POINTS],
    ['RELATIVE_POINTS', RELATIVE_POINTS],
  ] as const)('%s is a complete 32-point set with unique labels', (_name, points) => {
    expect(points).toHaveLength(32);
    expect(new Set(points.map((p) => p.index)).size).toBe(32);
    expect(new Set(points.map((p) => p.abbr)).size).toBe(32);
    expect(points.every((p) => p.full.trim() !== '')).toBe(true);
    expect(points.every((p) => p.angle >= 0 && p.angle < 360)).toBe(true);
  });

  it('point index matches array position, which the pickers assume', () => {
    COMPASS_POINTS.forEach((p, i) => expect(p.index).toBe(i));
    RELATIVE_POINTS.forEach((p, i) => expect(p.index).toBe(i));
  });
});
