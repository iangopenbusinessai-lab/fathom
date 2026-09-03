import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { VisualPanel, hasVisual } from '../components/VisualPanel';
import { COLREGS_QUESTIONS } from '../drills/colregs/constants';
import {
  QUESTION_ANCHORS,
  QUESTION_BUOYS,
  QUESTION_DISTRESS,
  QUESTION_PFDS,
  QUESTION_BOAT_PARTS,
} from '../drills/colregs';

// Several categories carry questions that must render with NO picture, and it
// matters: "which anchor suits this bottom?" beside a drawing of the right
// anchor is the answer given away for free, and the same is true of the buoyage
// questions about what the system MEANS rather than what a mark looks like.
//
// The drill draws the panel as `{hasVisual(current.id) && <VisualPanel …/>}`,
// so the two have to agree question by question: if hasVisual says yes and the
// panel draws nothing, the quiz grid reserves an empty diagram column; if it
// says no, a mapped question loses its picture. This walks the whole bank and
// pins both directions at once.

function markup(questionId: string, revealed = false): string {
  return renderToStaticMarkup(<VisualPanel questionId={questionId} revealed={revealed} />);
}

describe('the visual panel and the diagram maps agree', () => {
  it('never claims a visual it does not draw, or draws one it did not claim', () => {
    const disagreed = COLREGS_QUESTIONS.filter(
      q => hasVisual(q.id) !== (markup(q.id).length > 0)
    ).map(q => q.id);
    expect(disagreed).toEqual([]);
  });

  it('draws literally nothing for a question with no diagram entry', () => {
    const undiagrammed = COLREGS_QUESTIONS.filter(q => !hasVisual(q.id));
    // Guard against the whole bank quietly becoming diagrammed, which would
    // make the assertion below vacuous.
    expect(undiagrammed.length).toBeGreaterThan(50);
    for (const q of undiagrammed) {
      expect(markup(q.id)).toBe('');
      // Answering a question cannot conjure a picture either - only the
      // scenario diagram reads `revealed`, and it is behind a mapping too.
      expect(markup(q.id, true)).toBe('');
    }
  });
});

// The bottom-matching questions are the reason the anchor map stops at an-05.
// Written out by hand rather than derived, so deleting the map entries is not
// a way to make this pass.
describe('questions that must stay undiagrammed', () => {
  const cases: Array<[string, string[], Partial<Record<string, unknown>>]> = [
    // "Which anchor for this bottom?" - an-01..an-05 are the identification
    // questions and keep their silhouettes.
    ['anchor bottom-matching', ['an-06', 'an-07', 'an-08', 'an-09', 'an-10', 'an-11', 'an-12', 'an-13'], QUESTION_ANCHORS],
    // How the lateral and cardinal systems work, not what one mark looks like.
    ['buoyage system rules', ['by-03', 'by-08', 'by-10', 'by-13', 'by-16', 'by-17', 'by-18'], QUESTION_BUOYS],
    // Annex IV signals with no drawable form - a gun at intervals, a spoken
    // Mayday, an EPIRB alert.
    ['undrawable distress signals', ['di-09', 'di-10', 'di-11', 'di-12', 'di-13', 'di-14', 'di-15', 'di-16'], QUESTION_DISTRESS],
    // Carriage rules and servicing, not "identify this device".
    ['PFD regulation questions', ['pf-06', 'pf-07', 'pf-08', 'pf-09', 'pf-10', 'pf-11', 'pf-12', 'pf-13', 'pf-14', 'pf-15', 'pf-16'], QUESTION_PFDS],
    // Rope terms and helm orders - nothing on the hull to highlight.
    ['rope terms and helm orders', ['dk-14', 'dk-20', 'dk-27'], QUESTION_BOAT_PARTS],
  ];

  for (const [name, ids, map] of cases) {
    it(`${name} render no picture`, () => {
      for (const id of ids) {
        expect(map[id]).toBeUndefined();
        expect(hasVisual(id)).toBe(false);
        expect(markup(id)).toBe('');
      }
    });
  }
});
