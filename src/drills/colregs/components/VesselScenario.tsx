import React from 'react';

export type ScenarioType =
  | 'head-on'
  | 'crossing-stbd'         // other vessel on own starboard → own vessel is give-way
  | 'crossing-port'         // other vessel on own port → own vessel is stand-on
  | 'overtaking'            // own vessel overtaking another from astern
  | 'being-overtaken'
  | 'standon-may-act'       // give-way vessel is not acting → stand-on may manoeuvre
  | 'priority-nuc'          // Rule 18 — all vessels keep clear of a NUC vessel
  | 'sail-keeps-clear-ram'  // Rule 18 — sailing vessel keeps clear of a RAM vessel
  | 'fishing-over-sailing'  // Rule 18 — sailing vessel keeps clear of a fishing vessel
  | 'hierarchy-ladder';     // Rule 18 — the full responsibilities ordering

interface VesselScenarioProps {
  scenario: ScenarioType;
  label?: string;
}

// A simple top-down vessel silhouette as an SVG path in a local 0–20 coordinate space.
// Bow points upward (negative y). The path is centered at (0,0).
const HULL_PATH = 'M 0 -9 C 5 -6, 6 2, 4 9 L -4 9 C -6 2, -5 -6, 0 -9 Z';

interface VesselDef {
  x: number;
  y: number;
  rotation: number;
  role: 'give-way' | 'stand-on' | 'neutral';
  label: string;
  showArrow?: boolean;
  arrowDx?: number;
  arrowDy?: number;
}

const SCENARIOS: Record<ScenarioType, { vessels: VesselDef[]; caption: string }> = {
  'head-on': {
    caption: 'Head-On — both alter course to starboard (pass port-to-port)',
    vessels: [
      { x: 100, y: 200, rotation: 0,   role: 'neutral', label: 'Own',   showArrow: true, arrowDx: 0,   arrowDy: -28 },
      { x: 100, y: 70,  rotation: 180, role: 'neutral', label: 'Other', showArrow: true, arrowDx: 0,   arrowDy: 28  },
    ],
  },
  'crossing-stbd': {
    caption: 'Crossing — other vessel on own starboard. Own vessel gives way.',
    vessels: [
      { x: 90,  y: 170, rotation: 0,    role: 'give-way',  label: 'Own (Give-Way)',  showArrow: true, arrowDx: 0,   arrowDy: -28 },
      { x: 210, y: 110, rotation: -90,  role: 'stand-on',  label: 'Other (Stand-On)', showArrow: true, arrowDx: -28, arrowDy: 0   },
    ],
  },
  'crossing-port': {
    caption: 'Crossing — other vessel on own port. Own vessel stands on.',
    vessels: [
      { x: 210, y: 170, rotation: 0,    role: 'stand-on',  label: 'Own (Stand-On)', showArrow: true, arrowDx: 0,   arrowDy: -28 },
      { x: 90,  y: 110, rotation: 90,   role: 'give-way',  label: 'Other (Give-Way)', showArrow: true, arrowDx: 28,  arrowDy: 0   },
    ],
  },
  'overtaking': {
    caption: 'Overtaking — the vessel coming up from astern must keep clear.',
    vessels: [
      { x: 100, y: 85,  rotation: 0,   role: 'stand-on',  label: 'Ahead (Stand-On)',    showArrow: true, arrowDx: 0, arrowDy: -24 },
      { x: 100, y: 195, rotation: 0,   role: 'give-way',  label: 'Overtaking (Give-Way)', showArrow: true, arrowDx: 0, arrowDy: -24 },
    ],
  },
  'being-overtaken': {
    caption: 'Being Overtaken — the vessel being overtaken is the stand-on vessel.',
    vessels: [
      { x: 100, y: 85,  rotation: 0,   role: 'give-way',  label: 'Overtaking (Give-Way)', showArrow: true, arrowDx: 0, arrowDy: -24 },
      { x: 100, y: 195, rotation: 0,   role: 'stand-on',  label: 'Own (Stand-On)',         showArrow: true, arrowDx: 0, arrowDy: -24 },
    ],
  },
  'standon-may-act': {
    caption: 'Give-way vessel is not acting — the stand-on vessel may take avoiding action (Rule 17).',
    vessels: [
      { x: 190, y: 190, rotation: 0,   role: 'stand-on', label: 'Own (Stand-On)',   showArrow: true, arrowDx: 0,  arrowDy: -28 },
      { x: 110, y: 120, rotation: 90,  role: 'give-way', label: 'Other (Give-Way)', showArrow: true, arrowDx: 28, arrowDy: 0   },
    ],
  },
  'priority-nuc': {
    caption: 'Rule 18 — every other vessel keeps clear of a vessel Not Under Command.',
    vessels: [
      { x: 200, y: 105, rotation: 25, role: 'stand-on', label: 'NUC (Stand-On)',    showArrow: false },
      { x: 95,  y: 195, rotation: 0,  role: 'give-way', label: 'Power (Give-Way)',  showArrow: true, arrowDx: 0, arrowDy: -28 },
    ],
  },
  'sail-keeps-clear-ram': {
    caption: 'Rule 18 — a sailing vessel keeps clear of a RAM vessel, and must not impede one constrained by her draft.',
    vessels: [
      { x: 205, y: 110, rotation: -90, role: 'stand-on', label: 'RAM (Stand-On)',     showArrow: true, arrowDx: -28, arrowDy: 0 },
      { x: 90,  y: 190, rotation: 0,   role: 'give-way', label: 'Sailing (Give-Way)', showArrow: true, arrowDx: 0,   arrowDy: -28 },
    ],
  },
  'fishing-over-sailing': {
    caption: 'Rule 18 — a sailing vessel keeps clear of a vessel engaged in fishing.',
    vessels: [
      { x: 95,  y: 110, rotation: 90, role: 'stand-on', label: 'Fishing (Stand-On)', showArrow: true, arrowDx: 28, arrowDy: 0 },
      { x: 205, y: 190, rotation: 0,  role: 'give-way', label: 'Sailing (Give-Way)', showArrow: true, arrowDx: 0,  arrowDy: -28 },
    ],
  },
  'hierarchy-ladder': {
    caption: 'Rule 18 order of responsibility — least burdened at the top, most burdened at the bottom.',
    vessels: [
      { x: 150, y: 34,  rotation: 0, role: 'stand-on', label: 'NUC' },
      { x: 150, y: 74,  rotation: 0, role: 'stand-on', label: 'RAM' },
      { x: 150, y: 114, rotation: 0, role: 'neutral',  label: 'CBD' },
      { x: 150, y: 154, rotation: 0, role: 'neutral',  label: 'Fishing' },
      { x: 150, y: 194, rotation: 0, role: 'give-way', label: 'Sailing' },
      { x: 150, y: 234, rotation: 0, role: 'give-way', label: 'Power-Driven' },
    ],
  },
};

const ROLE_COLORS = {
  'give-way': {
    fill:   'rgb(124,45,18)',
    stroke: 'rgb(251,146,60)',
    glow:   'drop-shadow(0 0 6px rgba(251,146,60,0.7))',
    text:   'rgb(251,146,60)',
    arrow:  'rgb(251,146,60)',
  },
  'stand-on': {
    fill:   'rgb(8,51,68)',
    stroke: 'rgb(34,211,238)',
    glow:   'drop-shadow(0 0 6px rgba(34,211,238,0.7))',
    text:   'rgb(34,211,238)',
    arrow:  'rgb(34,211,238)',
  },
  'neutral': {
    fill:   'rgb(30,41,59)',
    stroke: 'rgb(148,163,184)',
    glow:   'drop-shadow(0 0 4px rgba(148,163,184,0.4))',
    text:   'rgb(148,163,184)',
    arrow:  'rgb(148,163,184)',
  },
};

export const VesselScenario: React.FC<VesselScenarioProps> = ({ scenario, label }) => {
  const { vessels, caption } = SCENARIOS[scenario];

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {label && (
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-mono">{label}</div>
      )}

      <div className="w-full max-w-[300px]">
        <svg
          viewBox="0 0 300 280"
          className="w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="0.5" />
            </pattern>
            <marker id="arrow-giveway" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M 0 0 L 6 3 L 0 6 Z" fill={ROLE_COLORS['give-way'].arrow} />
            </marker>
            <marker id="arrow-standon" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M 0 0 L 6 3 L 0 6 Z" fill={ROLE_COLORS['stand-on'].arrow} />
            </marker>
            <marker id="arrow-neutral" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M 0 0 L 6 3 L 0 6 Z" fill={ROLE_COLORS['neutral'].arrow} />
            </marker>
          </defs>

          <rect width="300" height="280" fill="url(#grid)" />
          <rect width="300" height="280" fill="rgb(2,10,22)" opacity="0.6" />

          {/* Water texture rings */}
          <circle cx="150" cy="140" r="100" fill="none" stroke="rgba(34,211,238,0.03)" strokeWidth="1" />
          <circle cx="150" cy="140" r="65"  fill="none" stroke="rgba(34,211,238,0.03)" strokeWidth="1" />

          {vessels.map((v, i) => {
            const colors = ROLE_COLORS[v.role];
            const markerId = `arrow-${v.role}`;

            // Arrow endpoint — shorten by arrowhead (~8px from hull)
            const ax = v.x + (v.arrowDx ?? 0);
            const ay = v.y + (v.arrowDy ?? 0);

            return (
              <g key={i}>
                {/* Course arrow */}
                {v.showArrow && (
                  <line
                    x1={v.x}
                    y1={v.y}
                    x2={ax}
                    y2={ay}
                    stroke={colors.arrow}
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    markerEnd={`url(#${markerId})`}
                    opacity="0.7"
                  />
                )}

                {/* Hull */}
                <g
                  transform={`translate(${v.x}, ${v.y}) rotate(${v.rotation})`}
                  style={{ filter: colors.glow }}
                >
                  <path
                    d={HULL_PATH}
                    fill={colors.fill}
                    stroke={colors.stroke}
                    strokeWidth="0.8"
                  />
                </g>

                {/* Label */}
                <text
                  x={v.x}
                  y={v.y + (v.arrowDy && v.arrowDy > 0 ? 26 : -22)}
                  textAnchor="middle"
                  fontSize="8"
                  fill={colors.text}
                  fontFamily="monospace"
                  opacity="0.85"
                >
                  {v.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Caption */}
      <p className="text-[11px] text-slate-400 text-center leading-snug max-w-[260px] font-mono">
        {caption}
      </p>

      {/* Legend */}
      <div className="flex gap-5 text-[10px] font-mono uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-orange-400">
          <span className="w-2.5 h-2.5 rounded-sm bg-orange-700 border border-orange-400 inline-block" />
          Give-Way
        </span>
        <span className="flex items-center gap-1.5 text-cyan-400">
          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-950 border border-cyan-400 inline-block" />
          Stand-On
        </span>
      </div>
    </div>
  );
};
