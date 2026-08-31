import { describe, it, expect } from 'vitest';
import { COLREGS_QUESTIONS } from '../drills/colregs/constants';
import { presentationOrder } from '../drills/colregs';

// The bug this guards: the bank is written answer-first, so a drill that
// renders options in source order can be beaten by always pressing the top
// button. These are distribution tests, so they are seeded only by Math.random
// and use loose bounds - the point is to catch a reintroduced bias, not to
// re-test Fisher-Yates at four decimal places.

const DRAWS_PER_QUESTION = 400;

describe('colregs option presentation order', () => {
  it('is a permutation of the question options, every draw', () => {
    for (const q of COLREGS_QUESTIONS) {
      for (let i = 0; i < 20; i++) {
        const shown = presentationOrder(q);
        expect(shown).toHaveLength(q.options.length);
        expect([...shown].sort()).toEqual([...q.options].sort());
        // Matching on content is what keeps the reorder safe - the answer must
        // still be findable by text.
        expect(shown).toContain(q.correctAnswer);
      }
    }
  });

  it('does not leave the source order in place', () => {
    // A no-op "shuffle" would return source order every time. Over the whole
    // bank at least some draw must differ.
    const moved = COLREGS_QUESTIONS.some((q) =>
      presentationOrder(q).some((o, i) => o !== q.options[i])
    );
    expect(moved).toBe(true);
  });

  it('spreads the correct answer evenly across the four slots', () => {
    const slots = [0, 0, 0, 0];
    let total = 0;

    for (const q of COLREGS_QUESTIONS) {
      // Only the 4-option questions share a slot count, so the even-spread
      // claim is made over those.
      if (q.options.length !== 4) continue;
      for (let i = 0; i < DRAWS_PER_QUESTION; i++) {
        slots[presentationOrder(q).indexOf(q.correctAnswer)] += 1;
        total += 1;
      }
    }

    expect(total).toBeGreaterThan(1000);
    const expected = total / 4;
    for (const count of slots) {
      // Source order put 73% in slot A and 1% in slot D. +/-15% of the
      // expected share is far tighter than that and far looser than sampling
      // noise at this sample size.
      expect(count).toBeGreaterThan(expected * 0.85);
      expect(count).toBeLessThan(expected * 1.15);
    }
  });
});
