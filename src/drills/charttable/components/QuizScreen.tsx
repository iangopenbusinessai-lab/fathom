import React from 'react';
import { MONO } from '../../../lib/theme';
import { ColregsQuestion } from '../../colregs/constants';
import { citationOf } from '../../../lib/citation';
import { VisualPanel, hasVisual } from '../../../components/VisualPanel';

export interface AnswerRecord {
  questionId: string;
  categoryId: string;
  prompt: string;
  cite: string;
  right: boolean;
}

interface QuizScreenProps {
  question: ColregsQuestion;
  // Presentation order for this run - see QueuedQuestion in ../index.
  options: string[];
  categoryName: string;
  index: number;
  total: number;
  results: AnswerRecord[];
  picked: string | null;
  mode: 'practice' | 'exam';
  clock: string;
  colorblind: boolean;
  showCitations: boolean;
  onPick: (option: string) => void;
  onNext: () => void;
  onQuit: () => void;
}

const metaRow: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 10.5,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--ct-muted)',
};

export const QuizScreen: React.FC<QuizScreenProps> = ({
  question,
  options,
  categoryName,
  index,
  total,
  results,
  picked,
  mode,
  clock,
  colorblind,
  showCitations,
  onPick,
  onNext,
  onQuit,
}) => {
  const answered = picked !== null;
  const practice = mode === 'practice';
  // The design reveals the explanation in practice only; exam mode advances
  // on its own and holds everything back for the results review.
  const reveal = answered && practice;
  const correct = picked === question.correctAnswer;
  const cite = citationOf(question);
  const showPanel = hasVisual(question.id);

  const pips = Array.from({ length: total }, (_, i) => {
    if (i < results.length) {
      return results[i].right ? 'var(--ct-stbd)' : 'var(--ct-port)';
    }
    return i === index ? 'var(--ct-brass)' : 'var(--ct-line)';
  });

  return (
    <section style={{ padding: '24px 0 0' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          ...metaRow,
        }}
      >
        <button className="ct-link ct-link-danger" onClick={onQuit}>
          &larr; Abandon
        </button>
        <span>{practice ? 'Practice · untimed' : 'Exam · timed'}</span>
        <span style={{ color: 'var(--ct-muted)' }}>{clock}</span>
      </div>

      <div style={{ display: 'flex', gap: 4, margin: '14px 0 0' }} aria-hidden="true">
        {pips.map((color, i) => (
          <span key={i} style={{ flex: 1, height: 3, background: color }} />
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 14,
          marginTop: 26,
          ...metaRow,
          fontSize: 11,
        }}
      >
        <span>
          Q {index + 1} / {total}
        </span>
        <span>{categoryName}</span>
      </div>

      <h2
        style={{
          margin: '12px 0 0',
          fontSize: 26,
          lineHeight: 1.32,
          fontWeight: 600,
          maxWidth: '44ch',
          color: 'var(--ct-ink)',
        }}
      >
        {question.prompt}
      </h2>

      <div className={`ct-quizbody${showPanel ? ' ct-has-visual' : ''}`}>
        {showPanel && <VisualPanel questionId={question.id} revealed={reveal} />}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {options.map((option, i) => {
            const isPicked = picked === option;
            const isAnswer = option === question.correctAnswer;

            let bg = 'transparent';
            let border = 'var(--ct-line)';
            let color = 'var(--ct-ink)';
            let mark = '';

            if (reveal && isAnswer) {
              border = 'var(--ct-stbd)';
              color = 'var(--ct-stbd)';
              mark = colorblind ? '✓ ok' : '✓';
            } else if (reveal && isPicked) {
              border = 'var(--ct-port)';
              color = 'var(--ct-port)';
              mark = colorblind ? '✕ no' : '✕';
            } else if (isPicked) {
              border = 'var(--ct-brass)';
              bg = 'var(--ct-panel)';
            }

            return (
              <button
                key={option}
                className="ct-option"
                disabled={answered}
                onClick={() => onPick(option)}
                style={{ background: bg, border: `1px solid ${border}`, color }}
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
                <span style={{ fontFamily: MONO, fontSize: 12, paddingTop: 2 }}>{mark}</span>
              </button>
            );
          })}
        </div>
      </div>

      {reveal && (
        <div
          style={{
            marginTop: 22,
            borderLeft: `2px solid ${correct ? 'var(--ct-stbd)' : 'var(--ct-port)'}`,
            padding: '2px 0 2px 16px',
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: correct ? 'var(--ct-stbd)' : 'var(--ct-port)',
            }}
          >
            {correct ? 'Correct' : 'Incorrect'}
            {/* The citation keeps its own case. COLREGS subparagraph letters
                are lowercase - "Rule 25(b)" - and the design's uppercase
                treatment of this whole line would print "RULE 25(B)", a shape
                the citation format test rejects as malformed. */}
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

      {answered && practice && (
        <button className="ct-solid" style={{ marginTop: 26 }} onClick={onNext}>
          {index + 1 === total ? 'See results' : 'Next question'}
        </button>
      )}
    </section>
  );
};
