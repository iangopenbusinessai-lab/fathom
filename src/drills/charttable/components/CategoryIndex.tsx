import React from 'react';
import { MONO, STENCIL } from '../theme';
import {
  CATEGORIES,
  ChartCategory,
  SECTION_ORDER,
  questionCount,
} from '../constants';
import { Progress, masteryPct, overallPct, streakDays, totalAnswered } from '../progress';

interface CategoryIndexProps {
  progress: Progress;
  examLength: number;
  onOpenCategory: (id: string) => void;
  onStartMixedExam: () => void;
  onStartWeakest: () => void;
}

function tagFor(cat: ChartCategory): string {
  if (cat.status === 'live') return `${questionCount(cat)} Q`;
  if (cat.status === 'compass') return 'compass drill';
  return 'soon';
}

// A section's subtitle. Counting "live" alone would read "0 of 2 live" over
// the Navigation section, which is wrong - those categories are drillable,
// just in the Compass drill - so each case gets its own wording.
function sectionMeta(cats: ChartCategory[]): string {
  const live = cats.filter((c) => c.status === 'live').length;
  if (live > 0) return `${live} of ${cats.length} live`;
  if (cats.some((c) => c.status === 'compass')) return 'in the compass drill';
  return 'planned';
}

const statLabel: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '0.1em',
  color: 'var(--ct-muted)',
  textTransform: 'uppercase',
};

const statValue: React.CSSProperties = { color: 'var(--ct-brass)', fontWeight: 600 };

export const CategoryIndex: React.FC<CategoryIndexProps> = ({
  progress,
  examLength,
  onOpenCategory,
  onStartMixedExam,
  onStartWeakest,
}) => (
  <>
    <section style={{ padding: '30px 0 8px' }}>
      <p
        style={{
          maxWidth: '52ch',
          margin: 0,
          fontSize: 17,
          lineHeight: 1.6,
          color: 'var(--ct-ink)',
        }}
      >
        Drill the Rules of the Road until they answer before you do. Bearings, lights,
        shapes, signals — cited to the rule, every time.
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 26,
          marginTop: 22,
          ...statLabel,
        }}
      >
        <span>
          Mastery <strong style={statValue}>{overallPct(progress)}%</strong>
        </span>
        <span>
          Drilled <strong style={statValue}>{totalAnswered(progress)}</strong>
        </span>
        <span>
          Streak <strong style={statValue}>{streakDays(progress)} d</strong>
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 24 }}>
        <button className="ct-solid" onClick={onStartMixedExam}>
          Mixed exam · {examLength} Q
        </button>
        <button className="ct-ghost" onClick={onStartWeakest}>
          Practice weakest
        </button>
      </div>
    </section>

    {SECTION_ORDER.map((section) => {
      const cats = CATEGORIES.filter((c) => c.section === section);
      if (cats.length === 0) return null;

      return (
        <section key={section} style={{ padding: '34px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <h2
              className="ct-stencil"
              style={{
                margin: 0,
                fontFamily: STENCIL,
                fontWeight: 600,
                fontSize: 24,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--ct-ink)',
              }}
            >
              {section}
            </h2>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: '0.14em',
                color: 'var(--ct-muted)',
              }}
            >
              {sectionMeta(cats)}
            </span>
          </div>

          <div className="ct-rule" style={{ margin: '12px 0 16px' }} />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
              gap: 12,
            }}
          >
            {cats.map((cat) => {
              const pct = masteryPct(progress, cat.id);
              const interactive = cat.status !== 'soon';

              return (
                <button
                  key={cat.id}
                  className="ct-card"
                  disabled={!interactive}
                  onClick={interactive ? () => onOpenCategory(cat.id) : undefined}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <span style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.25 }}>
                      {cat.name}
                    </span>
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 10,
                        letterSpacing: '0.1em',
                        whiteSpace: 'nowrap',
                        color:
                          cat.status === 'live' ? 'var(--ct-brass)' : 'var(--ct-muted)',
                      }}
                    >
                      {tagFor(cat)}
                    </span>
                  </span>

                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 10.5,
                      color: 'var(--ct-muted)',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {cat.rule}
                  </span>

                  <span
                    style={{ display: 'block', height: 3, background: 'var(--ct-line)' }}
                    role="img"
                    aria-label={`Mastery ${pct} percent`}
                  >
                    <span
                      style={{
                        display: 'block',
                        height: 3,
                        width: `${pct}%`,
                        background: 'var(--ct-brass)',
                      }}
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      );
    })}
  </>
);
