import React from 'react';

export type DayShapeName = 'ball' | 'cone-down' | 'cone-up' | 'diamond' | 'cylinder';
export type MastPosition = 'forward' | 'main' | 'aft';
export type ShapeArrangement = 'vertical' | 'yardarm';

interface DayShapeDisplayProps {
  shapes: DayShapeName[];
  position?: MastPosition;
  arrangement?: ShapeArrangement;
  label?: string;
}

// Shapes are black by COLREGS; on the dark hull they are drawn near-black with a
// light rim so they stay legible against the slate background.
const SHAPE_FILL = 'rgb(9,13,24)';
const SHAPE_STROKE = 'rgba(203,213,225,0.75)';
const SHAPE_STROKE_W = 1.1;

// Mast positions in the 200×260 viewBox (same hull geometry as LightDisplay).
// deckY = where the mast steps onto the deck; shapes stack upward from there.
const MAST_POSITIONS: Record<MastPosition, { x: number; deckY: number; label: string }> = {
  forward: { x: 100, deckY: 86,  label: 'Fore Mast'  },
  main:    { x: 100, deckY: 140, label: 'Main Mast'  },
  aft:     { x: 100, deckY: 190, label: 'Aft Mast'   },
};

const SHAPE_SPACING = 26;
const MAST_CLEARANCE = 20; // gap between deck and the lowest shape

// Exported so VesselProfile draws the same shapes with the same geometry
// rather than keeping a second, drifting copy.
export function shapeNode(shape: DayShapeName, cx: number, cy: number, key: string) {
  const common = {
    fill: SHAPE_FILL,
    stroke: SHAPE_STROKE,
    strokeWidth: SHAPE_STROKE_W,
  };
  switch (shape) {
    case 'ball':
      return <circle key={key} cx={cx} cy={cy} r={8.5} {...common} />;
    case 'diamond':
      return (
        <polygon
          key={key}
          points={`${cx},${cy - 10.5} ${cx + 8.5},${cy} ${cx},${cy + 10.5} ${cx - 8.5},${cy}`}
          {...common}
        />
      );
    case 'cone-down':
      // Apex downwards — Rule 25(e)
      return (
        <polygon
          key={key}
          points={`${cx - 9.5},${cy - 8.5} ${cx + 9.5},${cy - 8.5} ${cx},${cy + 10.5}`}
          {...common}
        />
      );
    case 'cone-up':
      // Apex upwards — the lower cone of the Rule 26 fishing pair
      return (
        <polygon
          key={key}
          points={`${cx - 9.5},${cy + 8.5} ${cx + 9.5},${cy + 8.5} ${cx},${cy - 10.5}`}
          {...common}
        />
      );
    case 'cylinder':
      return (
        <g key={key}>
          <rect x={cx - 8} y={cy - 10} width={16} height={20} rx={2.5} {...common} />
          <ellipse cx={cx} cy={cy - 10} rx={8} ry={2.6} {...common} />
        </g>
      );
  }
}

const SHAPE_LABELS: Record<DayShapeName, string> = {
  'ball':      'Ball',
  'diamond':   'Diamond',
  'cone-down': 'Cone, apex down',
  'cone-up':   'Cone, apex up',
  'cylinder':  'Cylinder',
};

export const DayShapeDisplay: React.FC<DayShapeDisplayProps> = ({
  shapes,
  position = 'main',
  arrangement = 'vertical',
  label,
}) => {
  const mast = MAST_POSITIONS[position];

  // Vertical stack: first entry in `shapes` is the highest shape.
  const stackHeight = (shapes.length - 1) * SHAPE_SPACING;
  const lowestY = mast.deckY - MAST_CLEARANCE;
  const topY = lowestY - stackHeight;

  const isYardarm = arrangement === 'yardarm';
  const yardarmY = lowestY - 4;
  const yardarmHalf = 30;

  // Placed shape coordinates
  const placed: { shape: DayShapeName; cx: number; cy: number }[] = isYardarm
    ? shapes.map((shape, i) => {
        if (i === 0) return { shape, cx: mast.x, cy: yardarmY - 26 }; // foremast head
        const side = i === 1 ? -1 : 1;                                // fore yardarm ends
        return { shape, cx: mast.x + side * yardarmHalf, cy: yardarmY };
      })
    : shapes.map((shape, i) => ({ shape, cx: mast.x, cy: topY + i * SHAPE_SPACING }));

  // ds-15 asks what a vessel under sail alone displays - the answer is nothing,
  // so it passes no shapes. Math.min of an empty list is Infinity, which would
  // send the mast off the canvas; fall back to a plain bare mast instead.
  const mastTopY = placed.length > 0
    ? Math.min(...placed.map(p => p.cy)) - 14
    : lowestY - 30;

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
            <linearGradient id="dsHullGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(15,23,42)" stopOpacity="0.95" />
              <stop offset="100%" stopColor="rgb(30,41,59)" stopOpacity="0.85" />
            </linearGradient>
          </defs>

          {/* Vessel hull (matches LightDisplay) */}
          <path
            d="M 100 28 C 135 45, 142 100, 130 195 L 70 195 C 58 100, 65 45, 100 28 Z"
            fill="url(#dsHullGrad)"
            stroke="rgba(71,85,105,0.5)"
            strokeWidth="0.8"
          />
          <line x1="100" y1="32" x2="100" y2="190" stroke="rgba(148,163,184,0.08)" strokeWidth="0.6" />
          <path d="M 94 30 L 100 20 L 106 30" fill="none" stroke="rgba(148,163,184,0.25)" strokeWidth="0.8" />
          <line x1="72" y1="193" x2="128" y2="193" stroke="rgba(148,163,184,0.2)" strokeWidth="0.8" />

          {/* Mast */}
          <line
            x1={mast.x} y1={mast.deckY}
            x2={mast.x} y2={mastTopY}
            stroke="rgba(148,163,184,0.45)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />

          {/* Fore yardarm (minesweeping arrangement) */}
          {isYardarm && (
            <line
              x1={mast.x - yardarmHalf} y1={yardarmY}
              x2={mast.x + yardarmHalf} y2={yardarmY}
              stroke="rgba(148,163,184,0.45)"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          )}

          {/* Day shapes */}
          {placed.map((p, i) => shapeNode(p.shape, p.cx, p.cy, `shape-${i}`))}

          {/* Shape labels — vertical stacks only; yardarm balls are self-evident */}
          {!isYardarm && placed.map((p, i) => (
            <text
              key={`lbl-${i}`}
              x={p.cx + 16}
              y={p.cy + 1}
              textAnchor="start"
              dominantBaseline="middle"
              fontSize="7"
              fill="rgba(226,232,240,0.7)"
              fontFamily="monospace"
            >
              {SHAPE_LABELS[p.shape]}
            </text>
          ))}

          {/* Mast position callout */}
          <text
            x={mast.x - 14}
            y={mast.deckY - 6}
            textAnchor="end"
            fontSize="7"
            fill="rgba(148,163,184,0.55)"
            fontFamily="monospace"
          >
            {mast.label}
          </text>

          {/* Orientation labels */}
          <text x="100" y="12" textAnchor="middle" fontSize="7" fill="rgba(148,163,184,0.3)" fontFamily="monospace">BOW</text>
          <text x="100" y="250" textAnchor="middle" fontSize="7" fill="rgba(148,163,184,0.3)" fontFamily="monospace">STERN</text>
          <text x="22" y="132" textAnchor="middle" fontSize="7" fill="rgba(148,163,184,0.2)" fontFamily="monospace">PORT</text>
          <text x="178" y="132" textAnchor="middle" fontSize="7" fill="rgba(148,163,184,0.2)" fontFamily="monospace">STBD</text>
        </svg>
      </div>
    </div>
  );
};
