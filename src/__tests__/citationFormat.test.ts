import { describe, it, expect } from 'vitest';
import { COLREGS_QUESTIONS } from '../drills/colregs/constants';

// SCOPE NOTE - this file checks the SHAPE of citation strings only.
//
// It cannot and does not verify that a citation is legally accurate: that
// "Rule 27(a)(ii)" is really the two black balls rather than the two red
// lights. That was a one-time manual audit against the USCG Navigation Rules
// and 33 CFR 83, and it stays manual. What is automated here is that no
// citation drifts into a malformed shape - "Rule 27(a)(iv)(b)", "Rule 27(A)",
// "Rule 27(a)(1)" - which is the kind of typo a later edit can introduce.

// A citation is: Rule N, Rule N(x), or Rule N(x)(y).
// x is a single lowercase letter; y is a lowercase roman numeral.
//
// The roman group is nested INSIDE the letter group rather than sitting beside
// it as a second optional group. Side by side, both being optional made the
// letter skippable, so "Rule 27(ii)" matched on the roman group alone - a
// citation that has dropped its required letter subparagraph.
const WELL_FORMED =
  /^Rules?\s\d{1,2}(\([a-z]\)(\((?:i|ii|iii|iv|v|vi|vii|viii|ix|x)\))?)?$/;

// Grab anything that starts like a citation, including malformed tails, so a
// bad suffix is captured rather than silently trimmed off.
const CITATION_TOKEN = /\bRules?\s\d{1,2}[^\s,.;:"']*/g;

// Annex citations are prose rather than numbered subparagraphs.
const ANNEX_TOKEN = /\bAnnex\s[IVX]+/;

function citationsIn(text: string): string[] {
  return text.match(CITATION_TOKEN) ?? [];
}

const ALL_TEXT = COLREGS_QUESTIONS.map((q) => ({
  id: q.id,
  text: `${q.prompt} ${q.options.join(' ')} ${q.explanation}`,
}));

describe('citation format', () => {
  it('finds citations to check (guards against a dead regex)', () => {
    const total = ALL_TEXT.reduce((n, q) => n + citationsIn(q.text).length, 0);
    expect(total).toBeGreaterThan(COLREGS_QUESTIONS.length);
  });

  it.each(ALL_TEXT.map((q) => [q.id, q.text] as const))(
    '%s uses only well-formed citations',
    (_id, text) => {
      const malformed = citationsIn(text).filter((c) => !WELL_FORMED.test(c));
      expect(malformed).toEqual([]);
    }
  );

  it('cites rule numbers that exist in the COLREGS (1-38)', () => {
    const bad: string[] = [];
    for (const { id, text } of ALL_TEXT) {
      for (const c of citationsIn(text)) {
        const n = Number(c.match(/\d{1,2}/)![0]);
        if (n < 1 || n > 38) bad.push(`${id}: ${c}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('gives every question at least one citation', () => {
    const uncited = ALL_TEXT.filter(
      ({ text }) => citationsIn(text).length === 0 && !ANNEX_TOKEN.test(text)
    );
    expect(uncited.map((q) => q.id)).toEqual([]);
  });

  it('puts a citation in every explanation, not just the prompt', () => {
    const uncited = COLREGS_QUESTIONS.filter(
      (q) => citationsIn(q.explanation).length === 0 && !ANNEX_TOKEN.test(q.explanation)
    );
    expect(uncited.map((q) => q.id)).toEqual([]);
  });
});

describe('citation format: the regex itself', () => {
  it.each(['Rule 5', 'Rule 18', 'Rule 9(b)', 'Rule 27(a)(ii)', 'Rule 24(e)(iii)', 'Rules 13'])(
    'accepts %s',
    (c) => expect(WELL_FORMED.test(c)).toBe(true)
  );

  it.each([
    'Rule 27(A)',        // uppercase subparagraph
    'Rule 27(a)(1)',     // arabic instead of roman
    'Rule 27(a)(ii)(b)', // too many levels
    'Rule 27a',          // missing parens
    'Rule 100',          // not a rule number shape
    'Rule 27(ii)',       // roman in the letter slot
  ])('rejects %s', (c) => expect(WELL_FORMED.test(c)).toBe(false));
});
