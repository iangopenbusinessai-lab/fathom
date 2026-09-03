import React from 'react';

export type LightName =
  | 'masthead'
  | 'masthead2'
  | 'masthead3'
  | 'port'
  | 'starboard'
  | 'stern'
  | 'anchor'
  | 'allRoundRed1'
  | 'allRoundRed2'
  | 'allRoundRed3'
  | 'allRoundWhite'
  | 'allRoundWhite2'
  | 'allRoundGreen1'
  | 'allRoundGreen2'
  | 'allRoundGreen3'
  | 'allRoundYellow'
  | 'allRoundYellowFlashing'
  | 'cylinder';

interface LightDisplayProps {
  active: LightName[];
  label?: string;
}

// This was the first visual component in the app and it predated the rule the
// later ones are built to: the diagram may be the stimulus of a question,
// never its answer. It has been brought into line, in two steps.
//
// It used to caption every lit light with its own type - "Masthead", "Port",
// "All-Rd Red" - which named the thing being asked about. Those captions are
// gone. What is left is the hull with BOW, STERN, PORT and STBD on it, which
// is orientation and not an answer, the same as every other component here.
//
// What it draws is a light CONFIGURATION, so it is honest in one direction
// only: a pattern shown, the vessel or situation named. It must never be put
// beside a question that names the vessel and asks which lights she shows -
// that question is answered by the picture. QUESTION_LIGHTS in ../index.tsx
// records the audit that established this and holds only the safe direction.

const LIGHT_COLORS: Record<LightName, string> = {
  masthead:      '#ffffff',
  masthead2:     '#ffffff',
  masthead3:     '#ffffff',
  port:          '#ef4444',
  starboard:     '#22c55e',
  stern:         '#ffffff',
  anchor:        '#ffffff',
  allRoundRed1:  '#ef4444',
  allRoundRed2:  '#ef4444',
  allRoundRed3:  '#ef4444',
  allRoundWhite: '#ffffff',
  allRoundWhite2:'#ffffff',
  allRoundGreen1:'#22c55e',
  allRoundGreen2:'#22c55e',
  allRoundGreen3:'#22c55e',
  allRoundYellow:'#eab308',
  allRoundYellowFlashing: '#eab308',
  cylinder:      '#1e293b',
};

const LIGHT_GLOWS: Record<LightName, string> = {
  masthead:      'rgba(255,255,255,0.8)',
  masthead2:     'rgba(255,255,255,0.8)',
  masthead3:     'rgba(255,255,255,0.8)',
  port:          'rgba(239,68,68,0.9)',
  starboard:     'rgba(34,197,94,0.9)',
  stern:         'rgba(255,255,255,0.8)',
  anchor:        'rgba(255,255,255,0.9)',
  allRoundRed1:  'rgba(239,68,68,0.9)',
  allRoundRed2:  'rgba(239,68,68,0.9)',
  allRoundRed3:  'rgba(239,68,68,0.9)',
  allRoundWhite: 'rgba(255,255,255,0.9)',
  allRoundWhite2:'rgba(255,255,255,0.9)',
  allRoundGreen1:'rgba(34,197,94,0.9)',
  allRoundGreen2:'rgba(34,197,94,0.9)',
  allRoundGreen3:'rgba(34,197,94,0.9)',
  allRoundYellow:'rgba(234,179,8,0.9)',
  allRoundYellowFlashing: 'rgba(234,179,8,0.9)',
  cylinder:      'rgba(100,116,139,0.5)',
};

// Arcs are drawn as SVG paths radiating from the light position.
// Each arc is defined by a center, radius, start angle and end angle (degrees, 0=up/north).
// The vessel bow faces up (north in the SVG).

interface ArcDef {
  cx: number;
  cy: number;
  r: number;
  startDeg: number; // clockwise from north
  endDeg: number;
  color: string;
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(endDeg));
  const y2 = cy + r * Math.sin(toRad(endDeg));
  const span = ((endDeg - startDeg) + 360) % 360;
  const large = span > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
}

// Fixed light positions in the 200×260 SVG viewBox
// Vessel bow at top, stern at bottom; hull occupies roughly y 30–220, center x=100
const LIGHT_POSITIONS: Record<LightName, { cx: number; cy: number; arc?: ArcDef }> = {
  masthead:     { cx: 100, cy: 65,  arc: { cx: 100, cy: 65,  r: 40, startDeg: 247.5, endDeg: 112.5, color: 'rgba(255,255,255,0.07)' } },
  masthead2:    { cx: 100, cy: 105, arc: { cx: 100, cy: 105, r: 40, startDeg: 247.5, endDeg: 112.5, color: 'rgba(255,255,255,0.05)' } },
  masthead3:    { cx: 100, cy: 85,  arc: { cx: 100, cy: 85,  r: 40, startDeg: 247.5, endDeg: 112.5, color: 'rgba(255,255,255,0.04)' } },
  port:         { cx: 62,  cy: 130, arc: { cx: 62,  cy: 130, r: 42, startDeg: 337.5, endDeg: 90,    color: 'rgba(239,68,68,0.08)'    } },
  starboard:    { cx: 138, cy: 130, arc: { cx: 138, cy: 130, r: 42, startDeg: 270,   endDeg: 22.5,  color: 'rgba(34,197,94,0.08)'    } },
  stern:        { cx: 100, cy: 205, arc: { cx: 100, cy: 205, r: 40, startDeg: 112.5, endDeg: 247.5, color: 'rgba(255,255,255,0.06)' } },
  anchor:       { cx: 100, cy: 90,  arc: { cx: 100, cy: 90,  r: 44, startDeg: 0,     endDeg: 360,   color: 'rgba(255,255,255,0.05)' } },
  allRoundRed1: { cx: 100, cy: 80,  arc: { cx: 100, cy: 80,  r: 40, startDeg: 0,     endDeg: 360,   color: 'rgba(239,68,68,0.07)'    } },
  allRoundRed2: { cx: 100, cy: 110, arc: { cx: 100, cy: 110, r: 40, startDeg: 0,     endDeg: 360,   color: 'rgba(239,68,68,0.05)'    } },
  allRoundRed3: { cx: 100, cy: 140, arc: { cx: 100, cy: 140, r: 40, startDeg: 0,     endDeg: 360,   color: 'rgba(239,68,68,0.04)'    } },
  allRoundWhite:{ cx: 100, cy: 130, arc: { cx: 100, cy: 130, r: 40, startDeg: 0,     endDeg: 360,   color: 'rgba(255,255,255,0.05)' } },
  allRoundWhite2:{ cx: 100, cy: 110, arc: { cx: 100, cy: 110, r: 40, startDeg: 0,     endDeg: 360,   color: 'rgba(255,255,255,0.05)' } },
  allRoundGreen1:{ cx: 100, cy: 80,  arc: { cx: 100, cy: 80,  r: 40, startDeg: 0,     endDeg: 360,   color: 'rgba(34,197,94,0.07)'    } },
  allRoundGreen2:{ cx: 100, cy: 110, arc: { cx: 100, cy: 110, r: 40, startDeg: 0,     endDeg: 360,   color: 'rgba(34,197,94,0.05)'    } },
  allRoundGreen3:{ cx: 100, cy: 140, arc: { cx: 100, cy: 140, r: 40, startDeg: 0,     endDeg: 360,   color: 'rgba(34,197,94,0.04)'    } },
  allRoundYellow:{ cx: 100, cy: 170,arc: { cx: 100, cy: 170, r: 40, startDeg: 0,     endDeg: 360,   color: 'rgba(234,179,8,0.06)'    } },
  // Rule 23(b) puts the air-cushion vessel's yellow light "where it can best
  // be seen" and prescribes no position, so it is drawn high and clear of the
  // towing light below - far enough apart that the two yellows are never
  // mistaken for each other, without asserting a position the rule does not.
  // The rule prescribes a FLASHING light, which a still drawing cannot carry:
  // any question using this light says so in its prompt.
  allRoundYellowFlashing: { cx: 100, cy: 45, arc: { cx: 100, cy: 45, r: 34, startDeg: 0, endDeg: 360, color: 'rgba(234,179,8,0.06)' } },
  cylinder:     { cx: 100, cy: 40,  },
};

export const LightDisplay: React.FC<LightDisplayProps> = ({ active, label }) => {
  const activeSet = new Set(active);

  const isLit = (name: LightName) => activeSet.has(name);

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {label && (
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-mono">{label}</div>
      )}

      <div className="relative w-full max-w-[220px]">
        <svg
          viewBox="0 0 200 260"
          className="w-full drop-shadow-2xl"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {(Object.keys(LIGHT_GLOWS) as LightName[]).map((name) => (
              <filter key={name} id={`glow-${name}`} x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
            <linearGradient id="hullGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(15,23,42)" stopOpacity="0.95" />
              <stop offset="100%" stopColor="rgb(30,41,59)" stopOpacity="0.85" />
            </linearGradient>
          </defs>

          {/* Arc fills (drawn first, behind hull) */}
          {(Object.entries(LIGHT_POSITIONS) as [LightName, typeof LIGHT_POSITIONS[LightName]][]).map(
            ([name, pos]) => {
              if (!isLit(name) || !pos.arc) return null;
              const { cx, cy, r, startDeg, endDeg, color } = pos.arc;
              const isFullCircle = Math.abs(endDeg - startDeg) === 360 || (startDeg === 0 && endDeg === 360);
              return isFullCircle ? (
                <circle
                  key={`arc-${name}`}
                  cx={cx} cy={cy} r={r}
                  fill={color}
                />
              ) : (
                <path
                  key={`arc-${name}`}
                  d={arcPath(cx, cy, r, startDeg, endDeg)}
                  fill={color}
                />
              );
            }
          )}

          {/* Vessel hull */}
          <path
            d="M 100 28 C 135 45, 142 100, 130 195 L 70 195 C 58 100, 65 45, 100 28 Z"
            fill="url(#hullGrad)"
            stroke="rgba(71,85,105,0.5)"
            strokeWidth="0.8"
          />
          {/* Center line */}
          <line x1="100" y1="32" x2="100" y2="190" stroke="rgba(148,163,184,0.08)" strokeWidth="0.6" />
          {/* Bow indicator */}
          <path d="M 94 30 L 100 20 L 106 30" fill="none" stroke="rgba(148,163,184,0.25)" strokeWidth="0.8" />
          {/* Transom */}
          <line x1="72" y1="193" x2="128" y2="193" stroke="rgba(148,163,184,0.2)" strokeWidth="0.8" />

          {/* Cylinder day shape */}
          {isLit('cylinder') && (
            <rect
              x="88" y="6" width="24" height="16" rx="4"
              fill="rgb(30,41,59)"
              stroke="rgba(148,163,184,0.5)"
              strokeWidth="0.8"
            />
          )}

          {/* Light dots */}
          {(Object.entries(LIGHT_POSITIONS) as [LightName, typeof LIGHT_POSITIONS[LightName]][]).map(
            ([name, pos]) => {
              const lit = isLit(name);
              const color = LIGHT_COLORS[name];
              const glow = LIGHT_GLOWS[name];
              if (name === 'cylinder') return null;
              return (
                <circle
                  key={name}
                  cx={pos.cx}
                  cy={pos.cy}
                  r={lit ? 5.5 : 3.5}
                  fill={lit ? color : 'rgb(51,65,85)'}
                  filter={lit ? `url(#glow-${name})` : undefined}
                  style={lit ? { filter: `drop-shadow(0 0 6px ${glow})` } : undefined}
                  opacity={lit ? 1 : 0.4}
                />
              );
            }
          )}

          {/* Bow / Stern labels */}
          <text x="100" y="12" textAnchor="middle" fontSize="7" fill="rgba(148,163,184,0.3)" fontFamily="monospace">BOW</text>
          <text x="100" y="250" textAnchor="middle" fontSize="7" fill="rgba(148,163,184,0.3)" fontFamily="monospace">STERN</text>
          <text x="22" y="132" textAnchor="middle" fontSize="7" fill="rgba(148,163,184,0.2)" fontFamily="monospace">PORT</text>
          <text x="178" y="132" textAnchor="middle" fontSize="7" fill="rgba(148,163,184,0.2)" fontFamily="monospace">STBD</text>
        </svg>
      </div>
    </div>
  );
};
