import React from 'react';
import { MONO, SANS, STENCIL, THEMES, ThemeName, themeLabel } from '../theme';
import { SOUNDINGS } from '../constants';

// The chart itself: the ruled ground, the soundings along the top edge, the
// masthead, and the stylesheet every screen inside it draws from.
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

.ct-chip {
  display: flex; align-items: center; gap: 7px;
  background: transparent; border: 1px solid var(--ct-line);
  color: var(--ct-muted); font-family: ${MONO}; font-size: 10px;
  letter-spacing: 0.14em; padding: 8px 11px; text-transform: uppercase;
  cursor: pointer; transition: border-color 140ms ease, color 140ms ease;
}
.ct-chip:hover { border-color: var(--ct-brass); color: var(--ct-brass); }

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

.ct-fade { animation: ctFade 260ms ease-out; }
@keyframes ctFade {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .ct-fade { animation: none; }
}
`;

interface ChartFrameProps {
  theme: ThemeName;
  onToggleTheme: () => void;
  onGoHub: () => void;
  onGoSettings: () => void;
  children: React.ReactNode;
}

export const ChartFrame: React.FC<ChartFrameProps> = ({
  theme,
  onToggleTheme,
  onGoHub,
  onGoSettings,
  children,
}) => {
  // The theme tokens ride on the root as inline custom properties, which is
  // what lets the stylesheet above stay theme-agnostic.
  const vars = THEMES[theme] as React.CSSProperties;

  return (
    <div style={{ ...vars, fontFamily: SANS }}>
      <style>{CSS}</style>
      <div className="ct-root">
        <div className="ct-sheet">
          {/* App.tsx floats a fixed "Hub" button at top-left over every drill.
              This clears it so the masthead does not sit underneath. */}
          <div style={{ height: 34 }} />

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
              <button className="ct-chip" onClick={onToggleTheme}>
                {themeLabel(theme)}
              </button>
              <button className="ct-icon" onClick={onGoSettings} title="Settings" aria-label="Settings">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <circle cx="12" cy="12" r="3.2" />
                  <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1" />
                </svg>
              </button>
            </div>
          </header>

          <div className="ct-rule" />
          {children}
        </div>
      </div>
    </div>
  );
};
