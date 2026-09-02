import { describe, it, expect } from 'vitest';
import { citationOf } from '../lib/citation';
import {
  COLREGS_QUESTIONS,
  SEAMANSHIP_LABELS,
  isColregsGoverned,
} from '../drills/colregs/constants';

// SCOPE NOTE - this file checks the SHAPE of citation strings only.
//
// It cannot and does not verify that a citation is legally accurate: that
// "Rule 27(a)(ii)" is really the two black balls rather than the two red
// lights. That was a one-time manual audit against the USCG Navigation Rules
// and 33 CFR 83, and it stays manual. What is automated here is that no
// citation drifts into a malformed shape - "Rule 27(a)(iv)(b)", "Rule 27(A)",
// "Rule 27(a)(1)" - which is the kind of typo a later edit can introduce.
//
// SCOPE NOTE 2 - not every category in the bank is governed by the COLREGS.
// Anchor types are seamanship: no rule number applies, so demanding "Rule N"
// of them would be demanding a citation that does not exist. Rather than let
// those questions break the suite, or exempt them by listing their ids here,
// the rule-citation checks below run over isColregsGoverned() questions only,
// and a second describe block holds the non-COLREGS ones to the equivalent
// standard for their own form: a topic label from the closed SEAMANSHIP_LABELS
// set. Both lists come from constants, so adding the next seamanship category
// needs no edit in this file.

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

const GOVERNED = COLREGS_QUESTIONS.filter(isColregsGoverned);
const SEAMANSHIP = COLREGS_QUESTIONS.filter((q) => !isColregsGoverned(q));

const ALL_TEXT = GOVERNED.map((q) => ({
  id: q.id,
  text: `${q.prompt} ${q.options.join(' ')} ${q.explanation}`,
}));

// A non-COLREGS explanation opens with its topic label, the way a rule
// citation opens a governed one: "Ground tackle: The fluke anchor ...".
const SEAMANSHIP_OPENER = new RegExp(`^(?:${SEAMANSHIP_LABELS.join('|')}): \\S`);

describe('citation format', () => {
  it('finds citations to check (guards against a dead regex)', () => {
    const total = ALL_TEXT.reduce((n, q) => n + citationsIn(q.text).length, 0);
    expect(total).toBeGreaterThan(GOVERNED.length);
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
    const uncited = GOVERNED.filter(
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

describe('non-COLREGS categories are labelled, not cited', () => {
  it('has some to check (guards against the filter going empty)', () => {
    expect(SEAMANSHIP.length).toBeGreaterThan(0);
  });

  it.each(SEAMANSHIP.map((q) => [q.id, q] as const))(
    '%s opens its explanation with a known topic label',
    (_id, q) => {
      expect(q.explanation).toMatch(SEAMANSHIP_OPENER);
    }
  );

  it.each(SEAMANSHIP.map((q) => [q.id, q] as const))(
    '%s cites no rule number, which would not exist for it',
    (_id, q) => {
      const text = `${q.prompt} ${q.options.join(' ')} ${q.explanation}`;
      expect(citationsIn(text)).toEqual([]);
      expect(ANNEX_TOKEN.test(text)).toBe(false);
    }
  );

  it('reads the label back as the badge the verdict shows', () => {
    // citationOf is what ScenarioCard renders beside the verdict. If it
    // returned '' here the answer screen would lose its source line entirely.
    for (const q of SEAMANSHIP) {
      expect(SEAMANSHIP_LABELS).toContain(citationOf(q) as (typeof SEAMANSHIP_LABELS)[number]);
    }
  });
});
