import React from 'react';
import { ArrowLeft, Info, MessageSquare, Settings } from 'lucide-react';
import { DISPLAY, MONO, SANS, STENCIL, THEMES, ThemeName } from '../lib/theme';
import { FEEDBACK_FORM_URL, feedbackReady } from '../lib/links';

// The chart itself: the ruled ground, the masthead, and the stylesheet every
// screen inside it draws from.
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

/* The sheet used to be pinned to 760px at every size, which left most of a
   desktop window empty. It steps up instead, and stops at 1280 so an
   ultra-wide monitor gets margins rather than a single absurd line length.
   Content that is prose rather than cards caps itself separately - see
   .ct-measure and the quiz bodies below. */
.ct-sheet { max-width: 760px; margin: 0 auto; }
@media (min-width: 1024px) { .ct-sheet { max-width: 960px; } .ct-root { padding: 0 32px 72px; } }
@media (min-width: 1440px) { .ct-sheet { max-width: 1180px; } .ct-root { padding: 0 44px 80px; } }
@media (min-width: 1800px) { .ct-sheet { max-width: 1280px; } }

/* A reading measure for prose that lives inside the now-wide sheet. */
.ct-measure { max-width: 62ch; }

.ct-rule { border-top: 2px dashed var(--ct-line); }

.ct-mono { font-family: ${MONO}; }
.ct-stencil { font-family: ${STENCIL}; }
.ct-display { font-family: ${DISPLAY}; }

/* Buttons ------------------------------------------------------------- */
.ct-solid, .ct-ghost {
  font-family: ${MONO};
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  padding: 14px 22px;
  border-radius: 11px;
  cursor: pointer;
  transition: background-color 140ms ease, border-color 140ms ease, color 140ms ease;
}
.ct-solid { background: var(--ct-ink); color: var(--ct-bg); border: none; }
.ct-solid:hover { background: var(--ct-brass); }
.ct-ghost { background: transparent; color: var(--ct-ink); border: 1px solid var(--ct-line); }
.ct-ghost:hover { border-color: var(--ct-brass); color: var(--ct-brass); }

/* The top-bar controls. A bare glyph in the masthead read as decoration, so
   each is a real bordered button with an icon and its own word beside it -
   nothing here should need a click to find out what it does. Below 560px the
   words drop and the icons carry it, so three buttons still fit a phone
   without wrapping under the wordmark. */
.ct-topbar { display: flex; align-items: center; gap: 8px; }
.ct-icon {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  min-height: 36px; padding: 0 12px; background: transparent;
  border: 1px solid var(--ct-line); border-radius: 10px;
  color: var(--ct-muted); font-family: ${MONO}; font-size: 10px;
  letter-spacing: 0.16em; text-transform: uppercase;
  cursor: pointer; transition: border-color 140ms ease, color 140ms ease;
}
.ct-icon:hover { border-color: var(--ct-brass); color: var(--ct-brass); }
.ct-icon[aria-current='page'] { border-color: var(--ct-brass); color: var(--ct-brass); }
.ct-icon[data-disabled='true'] { opacity: 0.5; cursor: default; }
.ct-icon[data-disabled='true']:hover { border-color: var(--ct-line); color: var(--ct-muted); }
a.ct-icon { text-decoration: none; }
@media (max-width: 559px) {
  .ct-icon { padding: 0 9px; }
  .ct-icon > span { display: none; }
}

.ct-link {
  display: inline-flex; align-items: center; flex: none; white-space: nowrap;
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
  border: 1px solid var(--ct-line); border-radius: 12px;
  padding: 16px 16px 14px;
  display: flex; flex-direction: column; gap: 10px; color: inherit;
  cursor: pointer; transition: border-color 140ms ease;
  font-family: inherit;
}
/* The mastery bar is the last child of every card. Pinning it to the bottom
   keeps the bars on one line across a row whose titles wrap to different
   heights - grid already equalises the cards, this equalises what is in them. */
.ct-card > :last-child { margin-top: auto; }
.ct-card:hover { border-color: var(--ct-brass); }
.ct-card[disabled] { cursor: default; opacity: 0.62; }
.ct-card[disabled]:hover { border-color: var(--ct-line); }

/* Card grids ---------------------------------------------------------- */
/* Section cards on the hub and category cards on a section screen share this,
   so both pick up columns as the sheet widens instead of staying a narrow
   two-up forever. auto-fill rather than auto-fit: a lone card in a section
   keeps its width instead of stretching across the whole row. */
.ct-cardgrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}
@media (min-width: 1440px) {
  .ct-cardgrid { gap: 14px; grid-template-columns: repeat(auto-fill, minmax(272px, 1fr)); }
}

/* Instrument panel ---------------------------------------------------- */
/* The lit-instrument ground the drill visuals sit on. Those diagrams draw
   white masthead lights and grey compass points, so they need a dark field and
   would vanish on the parchment - the panel stays dark in both themes and
   reads as an instrument standing on the chart table. */
.ct-instrument {
  background: #0a1929;
  border: 1px solid var(--ct-line);
  border-radius: 14px;
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
  border-radius: 12px; font-family: inherit; cursor: pointer;
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
/* The sheet is much wider than it was, and a question with 60ch options should
   not become one with 140ch options. The body caps itself and the diagram
   takes the extra room instead. */
.ct-quizbody { max-width: 1000px; }
@media (min-width: 1440px) {
  .ct-quizbody.ct-has-visual { grid-template-columns: 320px minmax(0, 1fr); }
}

/* Compass body: the rose needs far more room than a lights diagram - there are
   32 targets on it - so it leads and takes the wider column. */
.ct-rosebody {
  display: grid; grid-template-columns: 1fr; gap: 26px;
  align-items: start;
  max-width: 1000px;
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
  display: inline-flex; align-items: center; flex: none; white-space: nowrap;
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
  onGoAbout?: () => void;
  // Which top-bar destination is the screen currently showing, so that button
  // marks itself rather than the trail being the only clue.
  current?: 'about' | 'settings';
  // Everything below the hub. Empty means the hub itself, which shows as the
  // current location rather than as a button back to where you already are.
  trail?: TrailStep[];
  children: React.ReactNode;
}

export const ChartFrame: React.FC<ChartFrameProps> = ({
  theme,
  onGoHub,
  onGoSettings,
  onGoAbout,
  current,
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
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              padding: '26px 0 16px',
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
              {/* The Fathom mark: a six-spindle helm with a stencil-cut F at
                  its centre. The F is broken by two stencil bridges, which is
                  what ties it to the FATHOM wordmark beside it rather than
                  leaving the two merely adjacent.

                  Drawn in currentColor and coloured by `color` on the svg, so
                  the one mark follows the theme instead of needing a brass and
                  a navy copy. public/favicon.svg carries the same shape with
                  the bridges removed - they fill in below about 32px. */}
              <svg
                width="34"
                height="34"
                viewBox="0 0 100 100"
                style={{ color: 'var(--ct-brass)', flex: 'none' }}
                aria-hidden="true"
              >
                <mask id="ct-mark-cut" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
                  <rect width="100" height="100" fill="#fff" />
                  <g fill="#000">
                    <rect x="36" y="43" width="14" height="3.2" />
                    <rect x="51" y="28" width="3.2" height="30" />
                  </g>
                </mask>
                <g stroke="currentColor" strokeWidth="7.5" strokeLinecap="round">
                  <line x1="81.2" y1="68" x2="85.9" y2="70.75" />
                  <line x1="50" y1="86" x2="50" y2="91.5" />
                  <line x1="18.8" y1="68" x2="14.1" y2="70.75" />
                  <line x1="18.8" y1="32" x2="14.1" y2="29.25" />
                  <line x1="50" y1="14" x2="50" y2="8.5" />
                  <line x1="81.2" y1="32" x2="85.9" y2="29.25" />
                </g>
                <g fill="currentColor">
                  <circle cx="87.7" cy="71.75" r="4.6" />
                  <circle cx="50" cy="93.5" r="4.6" />
                  <circle cx="12.3" cy="71.75" r="4.6" />
                  <circle cx="12.3" cy="28.25" r="4.6" />
                  <circle cx="50" cy="6.5" r="4.6" />
                  <circle cx="87.7" cy="28.25" r="4.6" />
                </g>
                <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="8" />
                <g fill="currentColor" mask="url(#ct-mark-cut)">
                  <rect x="38.5" y="31" width="9" height="40" rx="1.5" />
                  <rect x="38.5" y="31" width="25" height="9" rx="1.5" />
                  <rect x="38.5" y="47" width="19" height="9" rx="1.5" />
                </g>
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

            <div className="ct-topbar">
              {onGoAbout && (
                <button
                  className="ct-icon"
                  onClick={onGoAbout}
                  title="About Fathom"
                  aria-label="About Fathom"
                  aria-current={current === 'about' ? 'page' : undefined}
                >
                  <Info size={15} strokeWidth={1.7} aria-hidden="true" />
                  <span>About</span>
                </button>
              )}

              <button
                className="ct-icon"
                onClick={onGoSettings}
                title="Settings"
                aria-label="Settings"
                aria-current={current === 'settings' ? 'page' : undefined}
              >
                <Settings size={15} strokeWidth={1.7} aria-hidden="true" />
                <span>Settings</span>
              </button>

              {/* The form does not exist yet. Rather than ship a button that
                  lands on a dead link, it reads as unavailable until
                  FEEDBACK_FORM_URL in lib/links stops being the placeholder -
                  which is the same one-line change either way. */}
              {feedbackReady() ? (
                <a
                  className="ct-icon"
                  href={FEEDBACK_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Send feedback"
                  aria-label="Send feedback (opens in a new tab)"
                >
                  <MessageSquare size={15} strokeWidth={1.7} aria-hidden="true" />
                  <span>Feedback</span>
                </a>
              ) : (
                <span
                  className="ct-icon"
                  data-disabled="true"
                  title="Feedback form coming soon"
                  aria-disabled="true"
                >
                  <MessageSquare size={15} strokeWidth={1.7} aria-hidden="true" />
                  <span>Feedback</span>
                </span>
              )}
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
                    {/* A real arrow glyph rather than the literal "←"
                        character, for the same reason the settings gear is an
                        icon: it renders the same on every platform. */}
                    {i === 0 && (
                      <ArrowLeft
                        size={12}
                        strokeWidth={2}
                        aria-hidden="true"
                        style={{ verticalAlign: '-2px', marginRight: 5 }}
                      />
                    )}
                    {step.label}
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
