import React from 'react';

export type BoatPartName =
  // Seen from the side
  | 'bow'
  | 'stern'
  | 'transom'
  | 'keel'
  | 'gunwale'
  | 'freeboard'
  | 'draft'
  | 'rudder'
  | 'waterline'
  // Seen from above
  | 'beam'
  | 'thwart'
  | 'amidships'
  | 'port-side';

interface BoatPartDisplayProps {
  part: BoatPartName;
  label?: string;
}

// 220x170. One small craft, drawn twice - from the side and from above - with
// a single part picked out in brass. The player names the highlighted part, so
// NOTHING here may name it in text.
//
// The hull is drawn in the same idiom as VesselProfile: navy plate, slate
// rim, and the waterline as a dashed cyan line. It could not simply reuse that
// component's silhouette, which is a ship seen broadside with both ends alike
// - a shape with no stem and no transom cannot be asked which end is the bow.
// This one has a raised stem forward and a flat transom aft, because half the
// questions turn on telling those two apart.
//
// Two views rather than one, because the parts do not all live in the same
// projection. Beam is a width and amidships is a position along the length:
// from the side they are invisible or ambiguous, and a plan view is what a
// boat's own drawings use for exactly the same reason. PART_VIEW is what
// decides, so adding a part is one row rather than a new drawing.
//
// The measurements - freeboard and draft - are drawn as dimension arrows
// between the two things being measured, which is the one case where the
// highlight is not part of the boat but the distance between two parts of it.

const HULL_FILL = 'rgb(15,23,42)';
const HULL_STROKE = 'rgb(148,163,184)';
const DETAIL = 'rgba(148,163,184,0.55)';
const WATER = 'rgba(34,211,238,0.25)';
const MARK = 'rgba(212,169,74,0.95)';
const MARK_WASH = 'rgba(212,169,74,0.18)';

const WATERLINE_Y = 100;

// Side elevation, bow to the right.
const SHEER = 'M 188 54 C 152 62, 92 70, 40 80';
const TRANSOM = 'M 40 80 L 46 114';
const BOTTOM = 'M 46 114 C 92 128, 146 124, 174 96';
const STEM = 'M 174 96 C 184 84, 189 68, 188 54';
const PROFILE_HULL = `${SHEER} L 46 114 C 92 128, 146 124, 174 96 C 184 84, 189 68, 188 54 Z`;

// Plan, bow to the top.
const PLAN_HULL =
  'M 110 22 C 138 46, 152 76, 152 100 L 148 144 L 72 144 L 68 100 C 68 76, 82 46, 110 22 Z';

type View = 'profile' | 'plan';

const PART_VIEW: Record<BoatPartName, View> = {
  bow: 'profile',
  stern: 'profile',
  transom: 'profile',
  keel: 'profile',
  gunwale: 'profile',
  freeboard: 'profile',
  draft: 'profile',
  rudder: 'profile',
  waterline: 'profile',
  beam: 'plan',
  thwart: 'plan',
  amidships: 'plan',
  'port-side': 'plan',
};

const mark = {
  fill: 'none' as const,
  stroke: MARK,
  strokeWidth: 4,
  strokeLinecap: 'round' as const,
};

// A dimension line with a head at each end, for the two measurements.
function dimension(x1: number, y1: number, x2: number, y2: number): React.ReactNode {
  const head = (x: number, y: number, up: boolean) => (
    <polygon
      points={`${x},${y} ${x - 4},${y + (up ? 8 : -8)} ${x + 4},${y + (up ? 8 : -8)}`}
      fill={MARK}
    />
  );
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={MARK} strokeWidth="2" />
      {x1 === x2 ? (
        <>
          {head(x1, y1, true)}
          {head(x2, y2, false)}
        </>
      ) : (
        <>
          <polygon points={`${x1},${y1} ${x1 + 8},${y1 - 4} ${x1 + 8},${y1 + 4}`} fill={MARK} />
          <polygon points={`${x2},${y2} ${x2 - 8},${y2 - 4} ${x2 - 8},${y2 + 4}`} fill={MARK} />
        </>
      )}
    </g>
  );
}

function highlight(part: BoatPartName): React.ReactNode {
  switch (part) {
    // The forward end, taken as a region rather than as one line: the bow is
    // an area of the boat, not an edge of it.
    case 'bow':
      return (
        <g>
          <path
            d="M 188 54 C 168 58, 150 62, 140 65 L 150 118 C 166 110, 180 96, 188 76 Z"
            fill={MARK_WASH}
          />
          <path d="M 150 63 C 168 59, 180 56, 188 54 C 189 68, 184 84, 174 96" {...mark} />
        </g>
      );

    case 'stern':
      return (
        <g>
          <path d="M 40 80 L 80 74 L 86 122 L 46 114 Z" fill={MARK_WASH} />
          <path d="M 80 74 C 60 77, 48 79, 40 80 L 46 114 C 60 118, 72 120, 84 121" {...mark} />
        </g>
      );

    // The flat plate closing the after end. Distinct from the stern, which is
    // the whole after part of the boat, and the two are asked separately.
    case 'transom':
      return <path d={TRANSOM} {...mark} />;

    case 'keel':
      return <path d={BOTTOM} {...mark} />;

    // The upper edge of the side, running the whole length.
    case 'gunwale':
      return <path d={SHEER} {...mark} />;

    // Gunwale down to the water.
    case 'freeboard':
      return dimension(104, 69, 104, WATERLINE_Y);

    // Water down to the lowest point of the hull.
    case 'draft':
      return dimension(104, WATERLINE_Y, 104, 126);

    case 'rudder':
      return <path d="M 34 108 L 44 108 L 42 136 L 33 133 Z" fill={MARK_WASH} stroke={MARK} strokeWidth="3" strokeLinejoin="round" />;

    case 'waterline':
      return (
        <line
          x1={10} y1={WATERLINE_Y} x2={210} y2={WATERLINE_Y}
          stroke={MARK} strokeWidth="3" strokeDasharray="8 5" strokeLinecap="round"
        />
      );

    // Widest point, measured across.
    case 'beam':
      return dimension(68, 100, 152, 100);

    // The seat athwartships.
    case 'thwart':
      return (
        <rect x={72} y={88} width={76} height={13} rx={2} fill={MARK_WASH} stroke={MARK} strokeWidth="3" />
      );

    // The middle of the boat, along her length.
    case 'amidships':
      return (
        <g>
          <path d="M 69 70 L 151 70 L 152 106 L 68 106 Z" fill={MARK_WASH} />
          <line x1={68} y1={88} x2={152} y2={88} stroke={MARK} strokeWidth="3" strokeDasharray="7 5" />
        </g>
      );

    // The left-hand side, looking forward - which is why the plan is drawn
    // bow-up: turn the page and the answer changes.
    case 'port-side':
      return (
        <g>
          <path d="M 110 22 C 92 38, 68 76, 68 100 L 72 144 L 110 144 Z" fill={MARK_WASH} />
          <path d="M 110 22 C 82 46, 68 76, 68 100 L 72 144" {...mark} />
        </g>
      );
  }
}

function profileView(part: BoatPartName): React.ReactNode {
  return (
    <g>
      <line
        x1={10} y1={WATERLINE_Y} x2={210} y2={WATERLINE_Y}
        stroke={WATER} strokeWidth="1" strokeDasharray="5 4"
      />
      {/* Rudder, hung aft of the transom */}
      <path
        d="M 34 108 L 44 108 L 42 136 L 33 133 Z"
        fill={HULL_FILL} stroke={HULL_STROKE} strokeWidth="1.1" strokeLinejoin="round"
      />
      <path d={PROFILE_HULL} fill={HULL_FILL} stroke={HULL_STROKE} strokeWidth="1.3" strokeLinejoin="round" />
      {/* Sheer strake, so the top edge reads as an edge and not as an outline */}
      <path
        d="M 184 60 C 150 68, 92 76, 42 86"
        fill="none" stroke={DETAIL} strokeWidth="1"
      />
      {highlight(part)}
    </g>
  );
}

function planView(part: BoatPartName): React.ReactNode {
  return (
    <g>
      <path d={PLAN_HULL} fill={HULL_FILL} stroke={HULL_STROKE} strokeWidth="1.3" strokeLinejoin="round" />
      {/* Inwale and centreline, so the plan reads as a hollow boat */}
      <path
        d="M 110 34 C 132 54, 144 78, 144 100 L 141 137 L 79 137 L 76 100 C 76 78, 88 54, 110 34 Z"
        fill="none" stroke={DETAIL} strokeWidth="1"
      />
      <line x1={110} y1={34} x2={110} y2={137} stroke={DETAIL} strokeWidth="0.8" strokeDasharray="4 5" />
      {/* The seat athwartships */}
      <rect x={78} y={90} width={64} height={9} rx={2} fill={HULL_FILL} stroke={HULL_STROKE} strokeWidth="1.1" />
      {highlight(part)}
    </g>
  );
}

export const BoatPartDisplay: React.FC<BoatPartDisplayProps> = ({ part, label }) => (
  <div className="flex flex-col items-center gap-3 select-none w-full">
    {label && (
      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-mono">{label}</div>
    )}

    <div className="w-full max-w-[240px] rounded-xl border border-slate-800 bg-slate-900/60 p-3 backdrop-blur-sm">
      <svg viewBox="0 0 220 170" className="w-full" xmlns="http://www.w3.org/2000/svg">
        {PART_VIEW[part] === 'plan' ? planView(part) : profileView(part)}
      </svg>
    </div>
  </div>
);
