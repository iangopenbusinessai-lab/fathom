import React from 'react';
import { MONO, SANS, STENCIL, THEMES, ThemeName } from '../lib/theme';

// The chart itself: the ruled ground, the soundings along the top edge, the
// masthead, and the stylesheet every screen inside it draws from.
//
// This is the site's frame, not one drill's. Everything - the hub, the compass
// drill, the colregs drill, settings - renders inside it, which is what makes
// the masthead, the trail and the ruled ground continuous from screen to
// screen.
//
// The design expressed hover states as a `style-hover` attribute, which the
// canvas runtime does not implement - it is an authoring annotation. Inline
// styles cannot express :hover at all, so those states live in the stylesheet
// below as real CSS, keyed off the same custom properties as everything else.

// The depth soundings printed along the top edge. Decorative - they are the
// chart's own texture, not data. The subscript digits are the fractional
// fathom marks a real chart carries.
export const SOUNDINGS: string[] = [
  '4₂',
  '7',
  '11₅',
  '6',
  '3₈',
  '9',
  '14',
  '5₄',
  '8',
  '12',
  '4',
  '17₂',
  '6₆',
  '10',
  '21',
  '3₅',
  '7₈',
  '13',
];

const CSS = `
.ct-root {
  min-height: 100vh;
  background: var(--ct-bg);
  color: var(--ct-ink);
  background-image:
    repeating-linear-gradient(0deg, var(--ct-grid) 0 1px, transparent 1px 56px),
    repeating-linear-gradient(90deg, var(--ct-grid) 0 1px, transparent 1px 56px);
  background-position: center top;
  padding: 0 20px 72px;
}
.ct-sheet { max-width: 760px; margin: 0 auto; }

.ct-rule { border-top: 2px dashed var(--ct-line); }

.ct-mono { font-family: ${MONO}; }
.ct-stencil { font-family: ${STENCIL}; }

/* Buttons ------------------------------------------------------------- */
.ct-solid, .ct-ghost {
  font-family: ${MONO};
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  padding: 14px 22px;
  cursor: pointer;
  transition: background-color 140ms ease, border-color 140ms ease, color 140ms ease;
}
.ct-solid { background: var(--ct-ink); color: var(--ct-bg); border: none; }
.ct-solid:hover { background: var(--ct-brass); }
.ct-ghost { background: transparent; color: var(--ct-ink); border: 1px solid var(--ct-line); }
.ct-ghost:hover { border-color: var(--ct-brass); color: var(--ct-brass); }

.ct-icon {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 34px; background: transparent;
  border: 1px solid var(--ct-line); color: var(--ct-muted);
  cursor: pointer; transition: border-color 140ms ease, color 140ms ease;
}
.ct-icon:hover { border-color: var(--ct-brass); color: var(--ct-brass); }

.ct-link {
  background: transparent; border: none; padding: 0;
  color: var(--ct-muted); font-family: ${MONO}; font-size: 10.5px;
  letter-spacing: 0.16em; text-transform: uppercase; cursor: pointer;
  transition: color 140ms ease;
}
.ct-link:hover { color: var(--ct-brass); }
.ct-link-danger:hover { color: var(--ct-port); }

/* Category cards ------------------------------------------------------ */
.ct-card {
  text-align: left; background: var(--ct-panel);
  border: 1px solid var(--ct-line); padding: 16px 16px 14px;
  display: flex; flex-direction: column; gap: 10px; color: inherit;
  cursor: pointer; transition: border-color 140ms ease;
  font-family: inherit;
}
.ct-card:hover { border-color: var(--ct-brass); }
.ct-card[disabled] { cursor: default; opacity: 0.62; }
.ct-card[disabled]:hover { border-color: var(--ct-line); }

/* Instrument panel ---------------------------------------------------- */
/* The lit-instrument ground the drill visuals sit on. Those diagrams draw
   white masthead lights and grey compass points, so they need a dark field and
   would vanish on the parchment - the panel stays dark in both themes and
   reads as an instrument standing on the chart table. */
.ct-instrument {
  background: #0a1929;
  border: 1px solid var(--ct-line);
  padding: 18px 14px;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
}
.ct-instrument-label {
  align-self: flex-start;
  font-family: ${MONO}; font-size: 9px; letter-spacing: 0.22em;
  text-transform: uppercase; color: rgba(212,169,74,0.65);
}

/* Answer options ------------------------------------------------------ */
.ct-option {
  display: flex; align-items: flex-start; gap: 14px; text-align: left;
  padding: 15px 16px; font-size: 15.5px; line-height: 1.45;
  font-family: inherit; cursor: pointer;
  transition: border-color 140ms ease, background-color 140ms ease;
}
.ct-option[disabled] { cursor: default; }

/* Quiz body: the visual panel sits beside the options once there is room. */
.ct-quizbody {
  display: grid; grid-template-columns: 1fr; gap: 22px;
  margin-top: 22px; align-items: start;
}
@media (min-width: 720px) {
  .ct-quizbody.ct-has-visual { grid-template-columns: 260px minmax(0, 1fr); }
}

/* Compass body: the rose needs far more room than a lights diagram - there are
   32 targets on it - so it leads and takes the wider column. */
.ct-rosebody {
  display: grid; grid-template-columns: 1fr; gap: 26px;
  align-items: start;
}
@media (min-width: 720px) {
  .ct-rosebody { grid-template-columns: minmax(0, 1fr) minmax(0, 290px); }
}

/* The trail: where you are, and the labelled way back ----------------- */
/* The wordmark still goes home, but "click the logo" is a convention, not a
   signpost. The trail states the current location and puts a named Chart
   table button in front of it on every screen that is not the hub. */
.ct-trail {
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
  padding: 11px 0 0;
  font-family: ${MONO}; font-size: 10.5px;
  letter-spacing: 0.14em; text-transform: uppercase;
}
.ct-crumb {
  background: transparent; border: none; padding: 0;
  font: inherit; letter-spacing: inherit; text-transform: inherit;
  color: var(--ct-muted); cursor: pointer;
  transition: color 140ms ease;
}
.ct-crumb:hover { color: var(--ct-brass); }
.ct-crumb-sep { color: var(--ct-line); }
.ct-crumb-here { color: var(--ct-ink); }

.ct-fade { animation: ctFade 260ms ease-out; }
@keyframes ctFade {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .ct-fade { animation: none; }
}
`;

// One step of the trail. A step with an `onClick` is somewhere you can go
// back to; the last step is where you are, and never carries one.
export interface TrailStep {
  label: string;
  onClick?: () => void;
}

interface ChartFrameProps {
  theme: ThemeName;
  onGoHub: () => void;
  onGoSettings: () => void;
  // Everything below the hub. Empty means the hub itself, which shows as the
  // current location rather than as a button back to where you already are.
  trail?: TrailStep[];
  children: React.ReactNode;
}

export const ChartFrame: React.FC<ChartFrameProps> = ({
  theme,
  onGoHub,
  onGoSettings,
  trail = [],
  children,
}) => {
  // The theme tokens ride on the root as inline custom properties, which is
  // what lets the stylesheet above stay theme-agnostic.
  const vars = THEMES[theme] as React.CSSProperties;

  // The hub is always the first step. On the hub itself it is the current
  // location; anywhere else it is the named way back.
  const steps: TrailStep[] = [
    { label: 'Chart table', onClick: trail.length > 0 ? onGoHub : undefined },
    ...trail,
  ];

  return (
    <div style={{ ...vars, fontFamily: SANS }}>
      <style>{CSS}</style>
      <div className="ct-root">
        <div className="ct-sheet">
          <div
            className="ct-mono"
            style={{
              display: 'flex',
              gap: 14,
              padding: '10px 2px 0',
              fontSize: 10,
              letterSpacing: '0.08em',
              color: 'var(--ct-muted)',
              opacity: 0.65,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
            aria-hidden="true"
          >
            {SOUNDINGS.map((s, i) => (
              <span key={`${s}-${i}`}>{s}</span>
            ))}
          </div>

          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              padding: '18px 0 16px',
            }}
          >
            <button
              onClick={onGoHub}
              title="Back to the chart table"
              aria-label="Back to the chart table"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <svg
                width="34"
                height="34"
                viewBox="0 0 48 48"
                fill="none"
                stroke="var(--ct-brass)"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <circle cx="24" cy="24" r="8.5" />
                <circle cx="24" cy="24" r="15" />
                <circle cx="24" cy="24" r="2.6" fill="var(--ct-brass)" stroke="none" />
                <path d="M24 1.5V15M24 33V46.5M1.5 24H15M33 24H46.5M8.1 8.1l7.6 7.6M32.3 32.3l7.6 7.6M39.9 8.1l-7.6 7.6M15.7 32.3l-7.6 7.6" />
              </svg>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span
                  className="ct-stencil"
                  style={{
                    fontWeight: 700,
                    fontSize: 30,
                    lineHeight: 0.92,
                    letterSpacing: '0.13em',
                    color: 'var(--ct-brass)',
                  }}
                >
                  FATHOM
                </span>
                <span
                  className="ct-mono"
                  style={{
                    fontSize: 9,
                    letterSpacing: '0.22em',
                    color: 'var(--ct-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  COLREGs &amp; Seamanship
                </span>
              </span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="ct-icon" onClick={onGoSettings} title="Settings" aria-label="Settings">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <circle cx="12" cy="12" r="3.2" />
                  <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1" />
                </svg>
              </button>
            </div>
          </header>

          <div className="ct-rule" />

          <nav className="ct-trail" aria-label="Breadcrumb">
            {steps.map((step, i) => (
              <React.Fragment key={`${step.label}-${i}`}>
                {i > 0 && (
                  <span className="ct-crumb-sep" aria-hidden="true">
                    /
                  </span>
                )}
                {step.onClick ? (
                  <button className="ct-crumb" onClick={step.onClick}>
                    {i === 0 ? `← ${step.label}` : step.label}
                  </button>
                ) : (
                  <span className="ct-crumb-here" aria-current="page">
                    {step.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>

          {children}
        </div>
      </div>
    </div>
  );
};
