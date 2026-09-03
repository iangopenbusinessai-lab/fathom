import React from 'react';

export type BuoyName =
  // Lateral marks, IALA Region B - the system the United States buoys under
  | 'port-hand'
  | 'starboard-hand'
  // Cardinal marks - identical in both regions
  | 'cardinal-north'
  | 'cardinal-east'
  | 'cardinal-south'
  | 'cardinal-west'
  | 'isolated-danger'
  | 'safe-water'
  | 'special'
  // The ICW overlay: an ordinary lateral mark carrying a yellow triangle or
  // square, which is read independently of the mark's own colour
  | 'icw-triangle'
  | 'icw-square';

interface BuoyDisplayProps {
  type: BuoyName;
  label?: string;
}

// Side elevation, 220x170, drawn to the same contract as AnchorDisplay: the
// player is asked to name the mark from what it looks like, so NOTHING here
// may name the type in text. No water line and no channel either - a channel
// drawn around the buoy would answer "which side do you leave it" for free.
//
// A buoy is not one silhouette the way an anchor is, so a mark is DESCRIBED
// here rather than hand-drawn: a body shape, the bands or stripes painted on
// it, a topmark, and for the ICW an overlay badge. Those four are exactly the
// four things a mark is identified by, so the table below reads as the answer
// key it is, and the next mark is a row rather than a new set of paths.
//
// The light characteristic is the fifth identifier and is deliberately NOT
// drawn: it is a rhythm over time, a still picture cannot carry it, and a lit
// buoy graphic would suggest the flash mattered to a question that is asking
// about shape. The questions that turn on light rhythm say so in words and
// carry no diagram.

type BuoyShape = 'can' | 'nun' | 'pillar' | 'sphere';
type Topmark =
  | 'cones-up'
  | 'cones-down'
  | 'cones-base'
  | 'cones-point'
  | 'spheres'
  | 'sphere-red'
  | 'cross';
type Badge = 'triangle' | 'square';

const RED = '#a8332c';
const GREEN = '#1e7a49';
const YELLOW = '#dcb02f';
const BLACK = '#0f172a';
const WHITE = '#e2e6ea';

const OUTLINE = 'rgb(148,163,184)';
const OUTLINE_W = 1.2;
const STAFF = 'rgba(203,213,225,0.75)';
const BADGE_EDGE = 'rgba(15,23,42,0.55)';

const CX = 110;
const BASE_Y = 142;

interface MarkSpec {
  shape: BuoyShape;
  // Horizontal bands, top to bottom. A single entry is a plain hull.
  bands: string[];
  // Vertical stripes, left to right. Where present they replace the bands -
  // safe water is the only mark in the system painted this way.
  stripes?: string[];
  topmark?: Topmark;
  badge?: Badge;
}

const MARKS: Record<BuoyName, MarkSpec> = {
  // Region B laterals: green can to port, red nun to starboard, entering from
  // seaward. Neither carries a topmark in the ordinary case, and drawing one
  // on them would teach the commonest thing candidates get wrong.
  'port-hand': { shape: 'can', bands: [GREEN] },
  'starboard-hand': { shape: 'nun', bands: [RED] },

  // Cardinals: the cones point the way the black band runs. North is black
  // over yellow with both cones up, south yellow over black with both down,
  // and east and west take the band that matches which way the cones meet.
  'cardinal-north': { shape: 'pillar', bands: [BLACK, YELLOW], topmark: 'cones-up' },
  'cardinal-east': { shape: 'pillar', bands: [BLACK, YELLOW, BLACK], topmark: 'cones-base' },
  'cardinal-south': { shape: 'pillar', bands: [YELLOW, BLACK], topmark: 'cones-down' },
  'cardinal-west': { shape: 'pillar', bands: [YELLOW, BLACK, YELLOW], topmark: 'cones-point' },

  'isolated-danger': { shape: 'pillar', bands: [BLACK, RED, BLACK], topmark: 'spheres' },
  'safe-water': {
    shape: 'pillar',
    bands: [RED],
    stripes: [RED, WHITE, RED, WHITE],
    topmark: 'sphere-red',
  },
  'special': { shape: 'can', bands: [YELLOW], topmark: 'cross' },

  // The overlay sits on an ordinary lateral mark. Which lateral it is drawn on
  // is chosen so the ICW questions cannot be answered off the base colour: the
  // triangle here is on a red mark and the square on a green one, the pairing
  // seen where the ICW runs with the local lateral system rather than against
  // it. The triangle still means starboard and the square port whatever the
  // hull under it is painted.
  'icw-triangle': { shape: 'nun', bands: [RED], badge: 'triangle' },
  'icw-square': { shape: 'can', bands: [GREEN], badge: 'square' },
};

// Where the body's crown sits, per shape: the topmark and its staff hang off
// this, so a pillar's topmark stands higher than a can's without a table of
// its own.
const TOP_Y: Record<BuoyShape, number> = {
  can: 78,
  nun: 84,
  pillar: 60,
  sphere: 76,
};

function bodyPath(shape: BuoyShape): string {
  switch (shape) {
    case 'can':
      return `M 80 ${BASE_Y} L 140 ${BASE_Y} L 140 78 L 80 78 Z`;
    case 'nun':
      return `M 82 ${BASE_Y} L 138 ${BASE_Y} L 126 84 L 94 84 Z`;
    // A squat base with a column standing on it. Bands run across the whole
    // structure, which is how a cardinal is actually painted.
    case 'pillar':
      return `M 84 ${BASE_Y} L 136 ${BASE_Y} L 136 104 L 121 104 L 121 60 L 99 60 L 99 104 L 84 104 Z`;
    case 'sphere':
      return `M 110 76 C 129 76, 144 91, 144 109 C 144 127, 129 ${BASE_Y}, 110 ${BASE_Y} C 91 ${BASE_Y}, 76 127, 76 109 C 76 91, 91 76, 110 76 Z`;
  }
}

function cone(baseY: number, pointing: 'up' | 'down'): React.ReactNode {
  const h = 17;
  const w = 12;
  const pts =
    pointing === 'up'
      ? `${CX - w},${baseY} ${CX + w},${baseY} ${CX},${baseY - h}`
      : `${CX - w},${baseY - h} ${CX + w},${baseY - h} ${CX},${baseY}`;
  return (
    <polygon points={pts} fill={BLACK} stroke={OUTLINE} strokeWidth="1" strokeLinejoin="round" />
  );
}

// Topmarks are drawn upward from `top`, the crown of the body, with a short
// staff between. The two-cone marks are the whole of the cardinal system: the
// bands only confirm what the cones have already said.
function topmarkGroup(mark: Topmark, top: number): React.ReactNode {
  const staffTop = top - 8;
  const lower = staffTop; // base line of the lower element
  const upper = staffTop - 19; // base line of the upper element

  let content: React.ReactNode = null;
  switch (mark) {
    case 'cones-up':
      content = (
        <>
          {cone(lower, 'up')}
          {cone(upper, 'up')}
        </>
      );
      break;
    case 'cones-down':
      content = (
        <>
          {cone(lower, 'down')}
          {cone(upper, 'down')}
        </>
      );
      break;
    // Base to base: the two bases meet in the middle, so the lower cone points
    // down and the upper one points up.
    case 'cones-base':
      content = (
        <>
          {cone(lower, 'down')}
          {cone(upper, 'up')}
        </>
      );
      break;
    // Point to point: the apexes meet in the middle instead.
    case 'cones-point':
      content = (
        <>
          {cone(lower, 'up')}
          {cone(upper, 'down')}
        </>
      );
      break;
    case 'spheres':
      content = (
        <>
          <circle cx={CX} cy={lower - 9} r={9} fill={BLACK} stroke={OUTLINE} strokeWidth="1" />
          <circle cx={CX} cy={upper - 9} r={9} fill={BLACK} stroke={OUTLINE} strokeWidth="1" />
        </>
      );
      break;
    case 'sphere-red':
      content = (
        <circle cx={CX} cy={lower - 10} r={10} fill={RED} stroke={OUTLINE} strokeWidth="1" />
      );
      break;
    // St Andrew's cross, standing as an X.
    case 'cross':
      content = (
        <g stroke={YELLOW} strokeWidth="4.5" strokeLinecap="round">
          <line x1={CX - 11} y1={lower - 1} x2={CX + 11} y2={lower - 23} />
          <line x1={CX - 11} y1={lower - 23} x2={CX + 11} y2={lower - 1} />
        </g>
      );
      break;
  }

  return (
    <g>
      <line
        x1={CX}
        y1={top}
        x2={CX}
        y2={staffTop}
        stroke={STAFF}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {content}
    </g>
  );
}

// The ICW overlay, painted on the body face. It is deliberately drawn as
// something stuck on rather than blended into the paintwork: on the water it
// is read as a separate instruction from the mark's own colour, and the
// picture should say so.
function badgeGroup(badge: Badge, shape: BuoyShape): React.ReactNode {
  const cy = shape === 'nun' ? 116 : 110;
  if (badge === 'square') {
    return (
      <rect
        x={CX - 13}
        y={cy - 13}
        width={26}
        height={26}
        fill={YELLOW}
        stroke={BADGE_EDGE}
        strokeWidth="1.2"
      />
    );
  }
  return (
    <polygon
      points={`${CX},${cy - 15} ${CX + 15},${cy + 12} ${CX - 15},${cy + 12}`}
      fill={YELLOW}
      stroke={BADGE_EDGE}
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  );
}

function buoyBody(type: BuoyName): React.ReactNode {
  const spec = MARKS[type];
  const d = bodyPath(spec.shape);
  const clipId = `buoy-clip-${type}`;
  const top = TOP_Y[spec.shape];

  // Bands and stripes are painted through a clip of the body outline, so a
  // three-band cardinal needs no per-shape geometry of its own.
  const paint: React.ReactNode[] = [];
  if (spec.stripes) {
    const n = spec.stripes.length;
    const w = 72 / n;
    spec.stripes.forEach((colour, i) => {
      paint.push(
        <rect key={`s${i}`} x={74 + i * w} y={50} width={w + 0.5} height={100} fill={colour} />
      );
    });
  } else {
    const n = spec.bands.length;
    const h = (BASE_Y - top) / n;
    spec.bands.forEach((colour, i) => {
      paint.push(
        <rect key={`b${i}`} x={70} y={top + i * h} width={80} height={h + 0.5} fill={colour} />
      );
    });
  }

  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <path d={d} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>{paint}</g>
      <path d={d} fill="none" stroke={OUTLINE} strokeWidth={OUTLINE_W} strokeLinejoin="round" />
      {spec.badge && badgeGroup(spec.badge, spec.shape)}
      {spec.topmark && topmarkGroup(spec.topmark, top)}
    </g>
  );
}

export const BuoyDisplay: React.FC<BuoyDisplayProps> = ({ type, label }) => (
  <div className="flex flex-col items-center gap-3 select-none w-full">
    {label && (
      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-mono">{label}</div>
    )}

    <div className="w-full max-w-[240px] rounded-xl border border-slate-800 bg-slate-900/60 p-3 backdrop-blur-sm">
      <svg viewBox="0 0 220 170" className="w-full" xmlns="http://www.w3.org/2000/svg">
        {buoyBody(type)}
      </svg>
    </div>
  </div>
);
