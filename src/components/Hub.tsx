import React from 'react';
import { ChevronRight } from 'lucide-react';
import { MONO } from '../lib/theme';
import { ChartCategory, SyllabusSection, sections } from '../lib/syllabus';
import { Progress, overallPct, streakDays, totalAnswered } from '../lib/progress';

interface HubProps {
  progress: Progress;
  // A section card opens that section's category list, which is where an
  // individual category - and the run set up on it - is reached. The two
  // shortcuts at the top skip both and go straight into a drill's own menu.
  onOpenSection: (section: string) => void;
  onOpenDrill: (drillId: string, focus: string) => void;
}

// The hub is a welcome screen, not the whole syllabus laid out at once. It
// used to render every category in every section on one page, which meant the
// first thing a new arrival saw was a wall of a dozen cards. Now it introduces
// the app, shows where you stand, and offers the syllabus one section at a
// time - the section list read from syllabus.ts, so it is however many
// sections there are rather than a number written here.

// Mastery across a whole section: pooled answers, not a mean of percentages,
// so a category with four answers cannot outweigh one with two hundred.
function sectionPct(progress: Progress, cats: ChartCategory[]): number {
  let answered = 0;
  let correct = 0;
  for (const cat of cats) {
    const c = progress.cats[cat.id];
    if (!c) continue;
    answered += c.answered;
    correct += c.correct;
  }
  if (answered === 0) return 0;
  return Math.round((correct / answered) * 100);
}

// Counting "live" alone would read "0 of 2 live" over Navigation, which is
// wrong - those categories are drillable, just against the rose rather than a
// written bank - so each case gets its own wording.
function sectionMeta(section: SyllabusSection): string {
  const cats = section.categories;
  const live = cats.filter((c) => c.status === 'live').length;
  if (live > 0) return `${live} of ${cats.length} live`;
  if (cats.some((c) => c.status === 'compass')) return 'drilled on the rose';
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

export const Hub: React.FC<HubProps> = ({ progress, onOpenSection, onOpenDrill }) => {
  const all = sections();

  return (
    <>
      <section style={{ padding: '30px 0 8px' }}>
        <p
          className="ct-measure"
          style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: 'var(--ct-ink)' }}
        >
          Drill the Rules of the Road until they answer before you do. Bearings, lights,
          shapes, signals and seamanship — cited to the rule, every time.
        </p>

        <div
          style={{ display: 'flex', flexWrap: 'wrap', gap: 26, marginTop: 22, ...statLabel }}
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
          {/* 'all' is the colregs drill's own across-every-topic filter, so this
              is its existing mixed exam rather than a second engine. */}
          <button className="ct-solid" onClick={() => onOpenDrill('colregs', 'all')}>
            All rules of the road
          </button>
          <button className="ct-ghost" onClick={() => onOpenDrill('compass', 'compass')}>
            Compass rose
          </button>
        </div>
      </section>

      <section style={{ padding: '38px 0 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <h2
            className="ct-display"
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: 26,
              letterSpacing: '0.01em',
              color: 'var(--ct-ink)',
            }}
          >
            The syllabus
          </h2>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: '0.14em',
              color: 'var(--ct-muted)',
              textTransform: 'uppercase',
            }}
          >
            {all.length} sections
          </span>
        </div>

        <div className="ct-rule" style={{ margin: '12px 0 16px' }} />

        <div className="ct-cardgrid">
          {all.map((section) => {
            const pct = sectionPct(progress, section.categories);

            return (
              <button
                key={section.name}
                className="ct-card"
                onClick={() => onOpenSection(section.name)}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  <span
                    className="ct-display"
                    style={{ fontSize: 19, fontWeight: 600, lineHeight: 1.2 }}
                  >
                    {section.name}
                  </span>
                  <ChevronRight
                    size={16}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    style={{ flex: 'none', color: 'var(--ct-brass)' }}
                  />
                </span>

                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--ct-brass)',
                  }}
                >
                  {section.categories.length}{' '}
                  {section.categories.length === 1 ? 'topic' : 'topics'} ·{' '}
                  {sectionMeta(section)}
                </span>

                <span
                  style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--ct-muted)' }}
                >
                  {section.categories.map((c) => c.name).join(', ')}
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
    </>
  );
};
