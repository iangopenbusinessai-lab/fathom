import React from 'react';
import { MONO, STENCIL } from '../../../lib/theme';
import { ChartCategory, questionCount } from '../../../lib/syllabus';
import { Progress, lastDrilledLabel, masteryPct } from '../../../lib/progress';

interface CategoryDetailProps {
  category: ChartCategory;
  progress: Progress;
  onBack: () => void;
  onPractice: () => void;
  onExam: () => void;
}

const panel: React.CSSProperties = {
  border: '1px solid var(--ct-line)',
  background: 'var(--ct-panel)',
  padding: 16,
};

const panelLabel: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 10,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--ct-muted)',
};

const panelValue: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 34,
  fontWeight: 600,
  marginTop: 6,
};

export const CategoryDetail: React.FC<CategoryDetailProps> = ({
  category,
  progress,
  onBack,
  onPractice,
  onExam,
}) => {
  const count = questionCount(category);
  const live = category.status === 'live';

  return (
    <section className="ct-fade" style={{ padding: '28px 0 0' }}>
      <button className="ct-link" onClick={onBack}>
        &larr; All categories
      </button>

      <h1
        style={{
          margin: '16px 0 0',
          fontFamily: STENCIL,
          fontWeight: 700,
          fontSize: 46,
          lineHeight: 0.98,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--ct-ink)',
        }}
      >
        {category.name}
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
        <span>{category.section}</span>
        <span>{category.rule}</span>
        {live && <span>{count} questions</span>}
      </div>

      <p
        style={{
          maxWidth: '56ch',
          fontSize: 16,
          lineHeight: 1.65,
          color: 'var(--ct-ink)',
          margin: '20px 0 0',
        }}
      >
        {category.blurb}
      </p>

      {live && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
            margin: '26px 0 0',
          }}
        >
          <div style={panel}>
            <div style={panelLabel}>Mastery</div>
            <div style={{ ...panelValue, color: 'var(--ct-brass)' }}>
              {masteryPct(progress, category.id)}%
            </div>
          </div>
          <div style={panel}>
            <div style={panelLabel}>Last drilled</div>
            <div style={{ ...panelValue, color: 'var(--ct-ink)' }}>
              {lastDrilledLabel(progress, category.id)}
            </div>
          </div>
        </div>
      )}

      <div className="ct-rule" style={{ margin: '26px 0 18px' }} />
      <div style={panelLabel}>Covered</div>

      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: '12px 0 0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '8px 22px',
        }}
      >
        {category.topics.map((topic) => (
          <li
            key={topic}
            style={{ fontSize: 14.5, lineHeight: 1.5, display: 'flex', gap: 10 }}
          >
            <span style={{ color: 'var(--ct-brass)', fontFamily: MONO, fontSize: 12 }}>
              ·
            </span>
            {topic}
          </li>
        ))}
      </ul>

      {live ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 30 }}>
          <button className="ct-solid" onClick={onPractice}>
            Practice · untimed
          </button>
          <button className="ct-ghost" onClick={onExam}>
            Exam · timed
          </button>
        </div>
      ) : (
        <p
          style={{
            marginTop: 30,
            maxWidth: '56ch',
            fontSize: 14,
            lineHeight: 1.6,
            color: 'var(--ct-muted)',
          }}
        >
          {category.status === 'compass'
            ? 'Bearings are drilled against the 32-point rose rather than a written question bank. Leave the chart table and pick the Compass drill from the hub.'
            : 'No questions in the bank for this category yet.'}
        </p>
      )}
    </section>
  );
};
