import React from 'react';
import { Check, X } from 'lucide-react';
import { MONO } from '../../../lib/theme';
import { ColregsQuestion } from '../constants';
import { citationOf } from '../../../lib/citation';

interface ScenarioCardProps {
  question: ColregsQuestion;
  // The order this draw presents the options in - see presentationOrder in
  // ../index. Correctness is decided on option TEXT throughout, so this can be
  // any permutation of question.options without touching the answer logic.
  options: string[];
  selectedAnswer: string | null;
  // Practice reveals the verdict and the explanation in place; exam mode holds
  // both back and moves on by itself.
  reveal: boolean;
  colorblind: boolean;
  showCitations: boolean;
  onSelect: (answer: string) => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  question,
  options,
  selectedAnswer,
  reveal,
  colorblind,
  showCitations,
  onSelect,
}) => {
  const isAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === question.correctAnswer;
  const cite = citationOf(question);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {options.map((option, i) => {
        const isPicked = selectedAnswer === option;
        const isAnswer = option === question.correctAnswer;

        let background = 'transparent';
        let border = 'var(--ct-line)';
        let color = 'var(--ct-ink)';
        // A drawn tick and cross rather than the ✓ / ✕ characters, which are
        // rendered by whatever font the platform substitutes and land anywhere
        // from a dingbat to an emoji. Colourblind mode still adds the word.
        let mark: React.ReactNode = null;

        if (reveal && isAnswer) {
          border = 'var(--ct-stbd)';
          color = 'var(--ct-stbd)';
          mark = (
            <>
              <Check size={14} strokeWidth={2.4} aria-hidden="true" />
              {colorblind && <span>ok</span>}
            </>
          );
        } else if (reveal && isPicked) {
          border = 'var(--ct-port)';
          color = 'var(--ct-port)';
          mark = (
            <>
              <X size={14} strokeWidth={2.4} aria-hidden="true" />
              {colorblind && <span>no</span>}
            </>
          );
        } else if (isPicked) {
          border = 'var(--ct-brass)';
          background = 'var(--ct-panel)';
        }

        return (
          <button
            key={option}
            className="ct-option"
            disabled={isAnswered}
            onClick={() => !isAnswered && onSelect(option)}
            style={{ background, border: `1px solid ${border}`, color }}
          >
            <span
              style={{
                fontFamily: MONO,
                fontSize: 12,
                letterSpacing: '0.1em',
                paddingTop: 2,
                opacity: 0.7,
              }}
            >
              {'ABCD'[i] ?? ''}
            </span>
            <span style={{ flex: 1 }}>{option}</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontFamily: MONO,
                fontSize: 12,
                paddingTop: 2,
              }}
            >
              {mark}
            </span>
          </button>
        );
      })}

      {reveal && (
        <div
          className="ct-fade"
          style={{
            marginTop: 12,
            borderLeft: `2px solid ${isCorrect ? 'var(--ct-stbd)' : 'var(--ct-port)'}`,
            padding: '2px 0 2px 16px',
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: isCorrect ? 'var(--ct-stbd)' : 'var(--ct-port)',
            }}
          >
            {isCorrect ? 'Correct' : 'Incorrect'}
            {/* The citation keeps its own case. COLREGS subparagraph letters
                are lowercase - "Rule 25(b)" - and the uppercase treatment of
                this line would print "RULE 25(B)", a shape the citation format
                test rejects as malformed. */}
            {showCitations && cite ? (
              <span style={{ textTransform: 'none' }}> · {cite}</span>
            ) : null}
          </div>
          <p
            style={{
              margin: '8px 0 0',
              fontSize: 15,
              lineHeight: 1.6,
              maxWidth: '58ch',
              color: 'var(--ct-ink)',
            }}
          >
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
};
