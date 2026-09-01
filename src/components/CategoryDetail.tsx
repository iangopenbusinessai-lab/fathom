import React, { useMemo, useState } from 'react';
import { MONO, STENCIL } from '../lib/theme';
import {
  ChartCategory,
  drillTargetFor,
  itemsForCategory,
  questionCount,
} from '../lib/syllabus';
import {
  Progress,
  WEAK_MIN_ATTEMPTS,
  itemsAnswered,
  lastDrilledLabel,
  masteryPct,
  weakSpots,
} from '../lib/progress';
import {
  COUNT_CHOICES,
  DEFAULT_PLAN,
  SessionPlan,
  TIMER_CHOICES,
  countLabel,
  isDefaultPlan,
  timerLabel,
} from '../lib/session';
import { GameMode } from '../types';

interface CategoryDetailProps {
  category: ChartCategory;
  progress: Progress;
  // Optional for the same reason as on the settings screen: the frame's trail
  // is the way back, so the shell leaves this off and only the retired chart
  // table drill still supplies it.
  onBack?: () => void;
  // The drill's own mode, plus the plan the controls below built. A plan left
  // at its defaults is the same run the drill has always started.
  onStart: (mode: GameMode, plan: SessionPlan) => void;
}

const panel: React.CSSProperties = {
  border: '1px solid var(--ct-line)',
  borderRadius: 12,
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

const noteStyle: React.CSSProperties = {
  maxWidth: '56ch',
  fontSize: 14,
  lineHeight: 1.6,
  color: 'var(--ct-muted)',
  margin: '12px 0 0',
};

// The cycling control from the settings screen, reused: one button that steps
// through its choices. Three of these take less room than three rows of radio
// buttons and read as instrument settings rather than a form.
function Cycle<T>({
  label,
  value,
  choices,
  render,
  disabled,
  onChange,
}: {
  label: string;
  value: T;
  choices: readonly T[];
  render: (value: T) => string;
  disabled?: boolean;
  onChange: (value: T) => void;
}) {
  const active = choices.indexOf(value);
  const on = active > 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ ...panelLabel, flex: 1 }}>{label}</span>
      <button
        disabled={disabled}
        onClick={() => onChange(choices[(active + 1) % choices.length])}
        style={{
          minWidth: 74,
          padding: '8px 12px',
          borderRadius: 10,
          fontFamily: MONO,
          fontSize: 10.5,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          cursor: disabled ? 'default' : 'pointer',
          opacity: disabled ? 0.45 : 1,
          background: on ? 'var(--ct-brass)' : 'transparent',
          border: `1px solid ${on ? 'var(--ct-brass)' : 'var(--ct-line)'}`,
          color: on ? 'var(--ct-bg)' : 'var(--ct-muted)',
        }}
      >
        {render(value)}
      </button>
    </div>
  );
}

export const CategoryDetail: React.FC<CategoryDetailProps> = ({
  category,
  progress,
  onBack,
  onStart,
}) => {
  const [plan, setPlan] = useState<SessionPlan>(DEFAULT_PLAN);

  const count = questionCount(category);
  const target = drillTargetFor(category);
  const live = category.status === 'live';
  const onTheRose = category.status === 'compass';

  const items = useMemo(() => itemsForCategory(category), [category]);
  const labels = useMemo(
    () => new Map(items.map((i) => [i.id, i.label])),
    [items]
  );
  const itemIds = useMemo(() => items.map((i) => i.id), [items]);

  const spots = useMemo(() => weakSpots(progress, itemIds), [progress, itemIds]);
  const answeredHere = itemsAnswered(progress, itemIds);
  // One pass over a category is not enough to call anything a weak spot: an
  // item needs WEAK_MIN_ATTEMPTS answers before it can appear at all, so until
  // there are at least that many answers here there is nothing to say.
  const enoughHistory = answeredHere >= WEAK_MIN_ATTEMPTS * 2;

  // Only offer counts the category can actually fill.
  const countChoices = COUNT_CHOICES.filter((c) => c === null || c < items.length);

  // Counts are the length of a deck, and the compass's Practice and Timed runs
  // are not decks - they draw for sixty seconds. So the count applies to the
  // exam there, and the note under the controls says so.
  const countAppliesToEveryMode = target?.drillId !== 'compass';

  const timedPractice = plan.perQuestionMs !== null;
  const practiceLabel = timedPractice
    ? `Practice · ${timerLabel(plan.perQuestionMs)} each`
    : 'Practice · untimed';

  return (
    <section className="ct-fade" style={{ padding: '28px 0 0' }}>
      {onBack && (
        <button className="ct-link" onClick={onBack}>
          &larr; All categories
        </button>
      )}

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
        {onTheRose && <span>{items.length} points</span>}
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

      {target && (
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

      {/* ── Weak spots ── */}
      {target && (
        <>
          <div className="ct-rule" style={{ margin: '26px 0 18px' }} />
          <div style={panelLabel}>What you are missing</div>

          {!enoughHistory ? (
            <p style={noteStyle}>
              Not enough answers here yet. Drill this category a couple of times and the
              ones you keep getting wrong will be listed here.
            </p>
          ) : spots.length === 0 ? (
            <p style={noteStyle}>
              Nothing missed twice here. Everything you have been asked more than once in
              this category, you have got right.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 0' }}>
              {spots.map((spot) => (
                <li
                  key={spot.id}
                  style={{
                    display: 'flex',
                    gap: 14,
                    alignItems: 'baseline',
                    padding: '11px 0',
                    borderBottom: '1px solid var(--ct-line)',
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      fontSize: 14.5,
                      lineHeight: 1.45,
                      color: 'var(--ct-ink)',
                    }}
                  >
                    {labels.get(spot.id) ?? spot.id}
                  </span>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 11,
                      letterSpacing: '0.08em',
                      whiteSpace: 'nowrap',
                      color: 'var(--ct-port)',
                    }}
                  >
                    {spot.pct}% · {spot.correct}/{spot.answered}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
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

      {/* ── Set the exercise ── */}
      {target && (
        <>
          <div className="ct-rule" style={{ margin: '26px 0 18px' }} />
          <div style={panelLabel}>Set the exercise</div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '14px 26px',
              margin: '16px 0 0',
            }}
          >
            <Cycle
              label="Questions"
              value={plan.count}
              choices={countChoices}
              render={countLabel}
              onChange={(count) => setPlan((p) => ({ ...p, count }))}
            />
            <Cycle
              label="Timer"
              value={plan.perQuestionMs}
              choices={TIMER_CHOICES}
              render={timerLabel}
              onChange={(perQuestionMs) => setPlan((p) => ({ ...p, perQuestionMs }))}
            />
            <Cycle
              label="Focus on weak spots"
              value={plan.weakSpotsOnly}
              choices={[false, true]}
              render={(on) => (on ? 'On' : 'Off')}
              disabled={!enoughHistory}
              onChange={(weakSpotsOnly) => setPlan((p) => ({ ...p, weakSpotsOnly }))}
            />
          </div>

          <p style={{ ...noteStyle, marginTop: 16 }}>
            {plan.weakSpotsOnly
              ? 'The ones you miss more often than you get right come first; if there are too few to fill the run, the rest of the category tops it up.'
              : 'Left alone, these are the runs as they have always been: practice draws without end, the exam is one timed pass through the whole category.'}
            {!countAppliesToEveryMode && ' A question count applies to the exam — practice and timed attack run for sixty seconds instead.'}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 24 }}>
            <button className="ct-solid" onClick={() => onStart('practice', plan)}>
              {practiceLabel}
            </button>
            {target.drillId === 'compass' && (
              <button className="ct-ghost" onClick={() => onStart('timed', plan)}>
                Timed attack · 60s
              </button>
            )}
            <button className="ct-ghost" onClick={() => onStart('exam', plan)}>
              Exam · 15s each
            </button>
          </div>

          {!isDefaultPlan(plan) && (
            <button
              className="ct-link"
              style={{ marginTop: 18 }}
              onClick={() => setPlan(DEFAULT_PLAN)}
            >
              Reset to the standard run
            </button>
          )}
        </>
      )}

      {!target && (
        <p style={{ ...noteStyle, marginTop: 30 }}>
          No questions in the bank for this category yet.
        </p>
      )}
    </section>
  );
};
