import React from 'react';
import { MONO } from '../lib/theme';
import {
  ChartCategory,
  SyllabusSection,
  drillTargetFor,
  questionCount,
} from '../lib/syllabus';
import { Progress, masteryPct } from '../lib/progress';

interface SectionScreenProps {
  section: SyllabusSection;
  progress: Progress;
  onOpenCategory: (categoryId: string) => void;
}

// One section's category list: the grid the hub used to draw for every section
// at once, now reached by opening a section card. It is deliberately the same
// shape as the old colregs-only topic list - a card per topic, its question
// count, its source, and its mastery bar - generalized to any section, so
// Seamanship and Aids to navigation get the same screen the Rules of the road
// always had.

function tagFor(cat: ChartCategory): string {
  if (cat.status === 'live') return `${questionCount(cat)} Q`;
  if (cat.status === 'compass') return 'compass rose';
  return 'soon';
}

export const SectionScreen: React.FC<SectionScreenProps> = ({
  section,
  progress,
  onOpenCategory,
}) => {
  const live = section.categories.filter((c) => c.status === 'live').length;
  const planned = section.categories.filter((c) => c.status === 'soon').length;

  return (
    <section className="ct-fade" style={{ padding: '28px 0 0' }}>
      <h1
        className="ct-display"
        style={{
          margin: 0,
          fontWeight: 600,
          fontSize: 42,
          lineHeight: 1.05,
          letterSpacing: '0.005em',
          color: 'var(--ct-ink)',
        }}
      >
        {section.name}
      </h1>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 18,
          marginTop: 12,
          fontFamily: MONO,
          fontSize: 10.5,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--ct-muted)',
        }}
      >
        <span>
          {section.categories.length}{' '}
          {section.categories.length === 1 ? 'topic' : 'topics'}
        </span>
        {live > 0 && <span>{live} drillable</span>}
        {planned > 0 && <span>{planned} planned</span>}
      </div>

      <div className="ct-rule" style={{ margin: '22px 0 18px' }} />

      <div className="ct-cardgrid">
        {section.categories.map((cat) => {
          const pct = masteryPct(progress, cat.id);
          const target = drillTargetFor(cat);

          return (
            <button
              key={cat.id}
              className="ct-card"
              disabled={target === null}
              onClick={target ? () => onOpenCategory(cat.id) : undefined}
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
                  style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.25 }}
                >
                  {cat.name}
                </span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    letterSpacing: '0.1em',
                    whiteSpace: 'nowrap',
                    color: target ? 'var(--ct-brass)' : 'var(--ct-muted)',
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

              <span style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--ct-muted)' }}>
                {cat.blurb}
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
};
