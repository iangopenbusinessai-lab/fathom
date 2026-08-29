import React from 'react';
import { buildScenarioView, ScenarioType, VesselRole } from '../scenarioView';

// Re-exported so existing importers keep using this module's public surface.
export type { ScenarioType } from '../scenarioView';


interface VesselScenarioProps {
  scenario: ScenarioType;
  label?: string;
  // False until the player has answered. Everything that states or colour-codes
  // the give-way outcome is withheld until then - see REVEALED_ONLY below.
  revealed?: boolean;
}

// A simple top-down vessel silhouette as an SVG path in a local 0–20 coordinate space.
// Bow points upward (negative y). The path is centered at (0,0).
const HULL_PATH = 'M 0 -9 C 5 -6, 6 2, 4 9 L -4 9 C -6 2, -5 -6, 0 -9 Z';



const ROLE_COLORS: Record<VesselRole, {
  fill: string; stroke: string; glow: string; text: string; arrow: string;
}> = {
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

export const VesselScenario: React.FC<VesselScenarioProps> = ({ scenario, label, revealed = false }) => {
  // All answer-gating lives in buildScenarioView; this component renders
  // whatever it is handed and makes no reveal decisions of its own.
  const view = buildScenarioView(scenario, revealed);

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

          {view.vessels.map((v, i) => {
            const colors = ROLE_COLORS[v.colorRole];
            const markerId = `arrow-${v.colorRole}`;

            // Arrow endpoint — shorten by arrowhead (~8px from hull)
            const ax = v.x + v.arrowDx;
            const ay = v.y + v.arrowDy;

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
                  y={v.y + (v.arrowDy > 0 ? 26 : -22)}
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

      {/* Caption and legend both state the outcome, so they are the answer.
          Reserve the space either way to stop the diagram jumping on reveal. */}
      <div className="min-h-[58px] flex flex-col items-center gap-3">
        {view.caption !== null && (
          <p className="text-[11px] text-slate-400 text-center leading-snug max-w-[260px] font-mono animate-in fade-in duration-300">
            {view.caption}
          </p>
        )}

        {view.showLegend && (
          <div className="flex gap-5 text-[10px] font-mono uppercase tracking-wider animate-in fade-in duration-300">
            <span className="flex items-center gap-1.5 text-orange-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-orange-700 border border-orange-400 inline-block" />
              Give-Way
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-950 border border-cyan-400 inline-block" />
              Stand-On
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
