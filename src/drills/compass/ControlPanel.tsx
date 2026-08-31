import React from 'react';
import { GameState, GameStats, CompassPoint, GameMode, GameType } from '../../types';
import { MONO, STENCIL } from '../../lib/theme';

// The compass drill's screens, in the chart-table idiom. The rose itself is
// unchanged and is drawn by ../CompassRose; this is the paper around it - the
// menu, the target readout that goes beside the rose, and the result.
//
// Every button here calls the same onStart(mode, type) the drill has always
// exposed, so the runs it can start are exactly the runs it could start
// before. The old menu nested Timed and Exam under a "Challenge" step; they
// are offered directly now, which is one fewer tap for the same three runs.

interface ControlPanelProps {
  gameState: GameState;
  targetPoint: CompassPoint | null;
  stats: GameStats;
  timeLeft: number;
  gameMode: GameMode;
  gameType: GameType;
  onStart: (mode: GameMode, type: GameType) => void;
  onQuit: () => void;
  examProgress?: { current: number; total: number };
  // How many bearings the exam just asked. A planned run can be shorter than
  // the full rose, so the result cannot say "out of 32" and be right.
  examTotal?: number;
}

const metaRow: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 10.5,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--ct-muted)',
};

const heading: React.CSSProperties = {
  margin: 0,
  fontFamily: STENCIL,
  fontWeight: 700,
  fontSize: 46,
  lineHeight: 0.98,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--ct-ink)',
};

const TYPE_COPY: Record<GameType, { title: string; blurb: string; practice: string }> = {
  compass: {
    title: 'Compass bearings',
    blurb:
      'The 32-point rose. Name the point you are asked for, from north round to north again.',
    practice: 'North stays up.',
  },
  relative: {
    title: 'Relative bearings',
    blurb:
      'The same 32 points read off your own head: ahead, bow, beam, quarter, astern, port and starboard.',
    practice: 'Port red, starboard green.',
  },
};

export const ControlPanel: React.FC<ControlPanelProps> = ({
  gameState,
  targetPoint,
  stats,
  timeLeft,
  gameMode,
  gameType,
  onStart,
  onQuit,
  examProgress,
  examTotal,
}) => {
  const seconds = Math.ceil(timeLeft / 1000);
  const warning = seconds <= 5;
  const copy = TYPE_COPY[gameType];

  if (gameState === 'idle') {
    return (
      <section className="ct-fade" style={{ padding: '28px 0 0' }}>
        <div style={metaRow}>Navigation</div>
        <h1 style={{ ...heading, marginTop: 14 }}>{copy.title}</h1>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginTop: 12, ...metaRow }}>
          <span>32 points</span>
          {stats.bestScore > 0 && <span>Best {stats.bestScore}</span>}
        </div>

        <p
          style={{
            maxWidth: '56ch',
            margin: '20px 0 0',
            fontSize: 16,
            lineHeight: 1.65,
            color: 'var(--ct-ink)',
          }}
        >
          {copy.blurb}
        </p>

        <div className="ct-rule" style={{ margin: '26px 0 22px' }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <button className="ct-solid" onClick={() => onStart('practice', gameType)}>
            Practice · 60s
          </button>
          <button className="ct-ghost" onClick={() => onStart('timed', gameType)}>
            Timed attack · 60s
          </button>
          <button className="ct-ghost" onClick={() => onStart('exam', gameType)}>
            Exam · 32 · 15s each
          </button>
        </div>

        <p
          style={{
            maxWidth: '56ch',
            marginTop: 26,
            fontSize: 14,
            lineHeight: 1.6,
            color: 'var(--ct-muted)',
          }}
        >
          {copy.practice} Timed attack and the exam spin the rose to a random heading, so the
          point has to be found rather than remembered by position.
        </p>
      </section>
    );
  }

  if (gameState === 'playing') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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
          <span style={{ color: warning ? 'var(--ct-port)' : 'var(--ct-muted)' }}>
            {seconds}s
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 26, ...metaRow, fontSize: 11 }}>
          <span>
            Score{' '}
            <strong style={{ color: 'var(--ct-brass)', fontSize: 15 }}>{stats.score}</strong>
          </span>
          {examProgress ? (
            <span>
              Q{' '}
              <strong style={{ color: 'var(--ct-ink)', fontSize: 15 }}>
                {examProgress.current}/{examProgress.total}
              </strong>
            </span>
          ) : (
            <span>
              Best{' '}
              <strong style={{ color: 'var(--ct-ink)', fontSize: 15 }}>{stats.bestScore}</strong>
            </span>
          )}
        </div>

        <div className="ct-rule" />

        {targetPoint && (
          <div>
            <div style={metaRow}>{gameMode === 'exam' ? 'Target' : 'Find'}</div>
            <div
              style={{
                fontFamily: STENCIL,
                fontWeight: 700,
                fontSize: 54,
                lineHeight: 1,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: 'var(--ct-ink)',
                marginTop: 10,
              }}
            >
              {targetPoint.abbr}
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 16,
                lineHeight: 1.5,
                color: 'var(--ct-brass)',
                maxWidth: '30ch',
              }}
            >
              {targetPoint.full}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="ct-fade" style={{ padding: '28px 0 0' }}>
      <div style={metaRow}>
        {gameMode === 'exam' ? 'Exam result' : 'Session ended'} · {copy.title}
      </div>

      <h1
        style={{
          ...heading,
          marginTop: 14,
          fontSize: 66,
          lineHeight: 0.9,
          letterSpacing: '0.05em',
          color: 'var(--ct-brass)',
        }}
      >
        {stats.score}
      </h1>

      <div
        style={{ display: 'flex', flexWrap: 'wrap', gap: 30, marginTop: 18, ...metaRow, fontSize: 12 }}
      >
        <span>
          {gameMode === 'exam' ? `Correct out of ${examTotal ?? 32}` : 'Points found'}
        </span>
        {stats.bestScore > 0 && (
          <span>
            Best <strong style={{ color: 'var(--ct-ink)', fontSize: 15 }}>{stats.bestScore}</strong>
          </span>
        )}
      </div>

      <div className="ct-rule" style={{ margin: '26px 0 22px' }} />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <button className="ct-solid" onClick={() => onStart(gameMode, gameType)}>
          Run it again
        </button>
        <button className="ct-ghost" onClick={onQuit}>
          Back to the rose
        </button>
      </div>
    </section>
  );
};
