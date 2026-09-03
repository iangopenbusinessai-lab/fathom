import { ColregsQuestion, TOPIC_LABELS } from '../drills/colregs/constants';

// The design shows a rule citation beside every verdict and in the results
// review. The bank does not carry a separate citation field - the citation is
// written into the explanation prose, e.g. "Rule 27(a): two all-round reds...".
// So it is read back out rather than duplicated, which keeps one source of
// truth and means a corrected explanation corrects the badge too.
//
// The accepted shape matches the one enforced by src/__tests__/citationFormat
// .test.ts: Rule N, Rule N(x), or Rule N(x)(y), x a single lowercase letter
// and y a lowercase roman numeral. Annexes are cited as prose instead.
const CITATION = /\bRules?\s\d{1,2}(?:\([a-z]\)(?:\((?:i|ii|iii|iv|v|vi|vii|viii|ix|x)\))?)?/;
const ANNEX = /\bAnnex\s[IVX]+/;

// Not every category is governed by the COLREGS. Anchor types and buoyage -
// and the rest of the content earmarked behind them - have no rule number to
// point at, so those explanations open with a topic label from the closed set
// in constants instead, and the badge shows that. Built from the exported list
// rather than restated here, so a new label cannot be added in one place only.
const TOPIC = new RegExp(`\\b(?:${TOPIC_LABELS.join('|')})\\b`);

function firstMatch(text: string): string {
  const hit = CITATION.exec(text) ?? ANNEX.exec(text) ?? TOPIC.exec(text);
  return hit ? hit[0] : '';
}

// Falls back to the empty string rather than inventing a citation, so a
// question whose explanation carries none simply shows no badge.
export function citationOf(question: ColregsQuestion): string {
  return firstMatch(question.explanation) || firstMatch(question.prompt);
}
