import React from 'react';
import { MONO, STENCIL } from '../theme';
import { PASS_MARK } from '../constants';
import { AnswerRecord } from './QuizScreen';

interface ResultsScreenProps {
  header: string;
  results: AnswerRecord[];
  clock: string;
  showCitations: boolean;
  hasMisses: boolean;
  onRetryMisses: () => void;
  onGoHub: () => void;
}

const label: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 10.5,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--ct-muted)',
};

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  header,
  results,
  clock,
  showCitations,
  hasMisses,
  onRetryMisses,
  onGoHub,
}) => {
  const right = results.filter((r) => r.right).length;
  const total = results.length;
  const pass = total > 0 && right / total >= PASS_MARK;
  const verdictColor = pass ? 'var(--ct-stbd)' : 'var(--ct-port)';

  return (
    <section className="ct-fade" style={{ padding: '28px 0 0' }}>
      <div style={label}>{header}</div>

      <h1
        style={{
          margin: '14px 0 0',
          fontFamily: STENCIL,
          fontWeight: 700,
          fontSize: 66,
          lineHeight: 0.9,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: verdictColor,
        }}
      >
        {pass ? 'Pass' : 'Not yet'}
      </h1>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 30,
          marginTop: 18,
          fontFamily: MONO,
          fontSize: 12,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--ct-muted)',
        }}
      >
        <span>
          Score{' '}
          <strong style={{ color: 'var(--ct-ink)', fontSize: 15 }}>
            {right}/{total}
          </strong>
        </span>
        <span>
          Pass mark{' '}
          <strong style={{ color: 'var(--ct-ink)', fontSize: 15 }}>
            {Math.round(PASS_MARK * 100)}%
          </strong>
        </span>
        <span>
          Time <strong style={{ color: 'var(--ct-ink)', fontSize: 15 }}>{clock}</strong>
        </span>
      </div>

      <div className="ct-rule" style={{ margin: '26px 0 16px' }} />
      <div style={{ ...label, fontSize: 10 }}>Question review</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 14 }}>
        {results.map((r, i) => (
          <div
            key={`${r.questionId}-${i}`}
            style={{
              display: 'flex',
              gap: 14,
              alignItems: 'baseline',
              padding: '12px 0',
              borderBottom: '1px solid var(--ct-line)',
            }}
          >
            <span
              style={{
                fontFamily: MONO,
                fontSize: 12,
                color: r.right ? 'var(--ct-stbd)' : 'var(--ct-port)',
                width: 28,
              }}
            >
              {r.right ? '✓' : '✕'}
            </span>
            <span style={{ flex: 1, fontSize: 15, lineHeight: 1.45, color: 'var(--ct-ink)' }}>
              {r.prompt}
            </span>
            {showCitations && r.cite && (
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 10.5,
                  letterSpacing: '0.08em',
                  color: 'var(--ct-muted)',
                  whiteSpace: 'nowrap',
                }}
              >
                {r.cite}
              </span>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
        {/* Nothing to re-drill on a clean sheet, so the button goes away
            rather than restarting the whole run under a misleading label. */}
        {hasMisses && (
          <button className="ct-solid" onClick={onRetryMisses}>
            Drill the misses
          </button>
        )}
        <button className={hasMisses ? 'ct-ghost' : 'ct-solid'} onClick={onGoHub}>
          Back to chart table
        </button>
      </div>
    </section>
  );
};
