import React from 'react';

export type AnchorTypeName =
  | 'fluke'     // Danforth pattern
  | 'plow'      // CQR / Delta pattern
  | 'claw'      // Bruce pattern
  | 'grapnel'
  | 'mushroom';

interface AnchorDisplayProps {
  type: AnchorTypeName;
  label?: string;
}

// Side elevation, 220×170, drawn to the same rules as VesselProfile: the
// player is asked to name the anchor from its shape, so NOTHING here may name
// the type in text, and no bottom is drawn under it. A seabed texture would
// answer the bottom-matching questions for free - sand under the fluke anchor
// is the answer to an-06 written into the picture.
//
// Each silhouette is built to the proportions the real anchor has, taken off
// maker drawings rather than invented to make five shapes look different. The
// numbers that matter are ratios against the shank, because that is what the
// eye actually compares:
//
//   fluke     Danforth pattern. Two LONG tapering plates - about as long as
//             half the shank - opening ~30 deg either side of it, and a stock
//             through the crown that is wider than the fluke span. The earlier
//             drawing had short stubby plates and a stock narrower than the
//             tips, which is why it read as a generic grappling shape.
//   plow      CQR / Delta. The share is WIDER THAN IT IS LONG (about 80:47),
//             one point down, wings swept up and out, and only a shallow
//             saddle between them. The deep saddle it had before made a heart.
//   claw      Bruce pattern. One casting, and the thing that identifies it is
//             that it is a broad hollow SCOOP - a wide crown with three lobes
//             off it, wider than tall. Three separate round strokes read as a
//             bird's foot, which is what it was doing.
//   grapnel   Long bare shaft, four tines curving out and back UP to finish
//             near mid-shaft, each ending in its own small fluke. The fore-and
//             -aft pair are foreshortened, so they are drawn shorter, thinner
//             and with smaller flukes - not omitted.
//   mushroom  An inverted bowl about twice as wide as it is deep, with a thick
//             rim, and a boss where the shank enters the crown of the dome.
//
// The shackle ring is common to all five and drawn in brass so the eye finds
// the top of the shank first; everything below it is navy plate with a slate
// rim, matching the day shapes and the vessel profiles.

const PLATE_FILL = 'rgb(15,23,42)';
const PLATE_STROKE = 'rgb(148,163,184)';
const PLATE_STROKE_W = 1.2;
const SHANK_STROKE = 'rgba(203,213,225,0.75)';
const RING_STROKE = 'rgba(212,169,74,0.85)';
const DETAIL_STROKE = 'rgba(148,163,184,0.55)';

const CX = 110;
const RING_CY = 34;
const RING_R = 7;

const plate = {
  fill: PLATE_FILL,
  stroke: PLATE_STROKE,
  strokeWidth: PLATE_STROKE_W,
  strokeLinejoin: 'round' as const,
};

// Shank length differs by type: a claw is stubby, a grapnel is a long bare
// shaft. Each profile draws its own, so this only fixes where it starts.
function shank(toY: number, width = 2.6) {
  return (
    <line
      x1={CX}
      y1={RING_CY + RING_R}
      x2={CX}
      y2={toY}
      stroke={SHANK_STROKE}
      strokeWidth={width}
      strokeLinecap="round"
    />
  );
}

function anchorBody(type: AnchorTypeName): React.ReactNode {
  switch (type) {
    // Danforth. Long slender shank down to a crown low in the frame, the stock
    // laid through that crown, and two long tapering plates opening from it.
    // The plates run from y=106 to y=154 against a shank of 78, so they read
    // as roughly half the shank - the real ratio - instead of as stubs.
    case 'fluke':
      return (
        <g>
          {shank(116, 2.4)}
          {/* Stock, through the crown and wider than the fluke span. Drawn
              first so the plates and the crown sit over it. */}
          <line
            x1={46} y1={112} x2={174} y2={112}
            stroke={DETAIL_STROKE} strokeWidth="2.4" strokeLinecap="round"
          />
          <circle cx={46} cy={112} r={3} fill={PLATE_FILL} stroke={DETAIL_STROKE} strokeWidth="1" />
          <circle cx={174} cy={112} r={3} fill={PLATE_FILL} stroke={DETAIL_STROKE} strokeWidth="1" />
          {/* The two plates: wide where they meet the crown, tapering to a
              point at the tip, opening about 30 deg either side of the shank. */}
          <path d="M 105 105 L 112 124 L 64 155 L 55 145 Z" {...plate} />
          <path d="M 115 105 L 108 124 L 156 155 L 165 145 Z" {...plate} />
          <circle cx={CX} cy={114} r={5.5} fill={PLATE_FILL} stroke={PLATE_STROKE} strokeWidth="1.2" />
        </g>
      );

    // CQR / Delta. One plowshare, 80 wide by 47 deep: wider than it is long,
    // which is what stops it reading as a spade or a heart. The saddle between
    // the wings is shallow - a fold, not a cleft - and the ridge runs from it
    // down to the single point.
    case 'plow':
      return (
        <g>
          {shank(118)}
          <path
            d="M 110 157 C 90 148, 72 132, 70 110 L 110 132 L 150 110 C 148 132, 130 148, 110 157 Z"
            {...plate}
          />
          {/* The fold down the middle of the share */}
          <line
            x1={CX} y1={133} x2={CX} y2={153}
            stroke={DETAIL_STROKE} strokeWidth="1" strokeLinecap="round"
          />
          {/* Hinge collar - the CQR pivots here, the Delta does not. Drawn as
              a fitting, small enough not to answer an-10 by itself. */}
          <circle cx={CX} cy={124} r={4.5} fill={PLATE_FILL} stroke={DETAIL_STROKE} strokeWidth="1.2" />
        </g>
      );

    // Bruce. A single casting read as one broad hollow scoop, 84 wide by 58
    // deep, on a short shank: a wide crown with two outer tines curling up at
    // the ends and a centre lobe dropping between them. Outlined as one plate
    // because it IS one piece of steel - three separate strokes made a claw
    // out of sticks.
    case 'claw':
      return (
        <g>
          {shank(102)}
          <path
            d="M 110 100
               C 134 103, 155 117, 163 146
               C 153 154, 141 151, 135 140
               C 131 152, 122 159, 110 159
               C 98 159, 89 152, 85 140
               C 79 151, 67 154, 57 146
               C 65 117, 86 103, 110 100 Z"
            {...plate}
          />
          {/* The hollow of the scoop, so the casting reads as concave rather
              than as a flat plate cut to shape. */}
          <path
            d="M 94 120 C 100 132, 103 145, 102 155"
            fill="none" stroke={DETAIL_STROKE} strokeWidth="1.1" strokeLinecap="round"
          />
          <path
            d="M 126 120 C 120 132, 117 145, 118 155"
            fill="none" stroke={DETAIL_STROKE} strokeWidth="1.1" strokeLinecap="round"
          />
          {/* Crown boss where the shank lands */}
          <circle cx={CX} cy={104} r={6.5} fill={PLATE_FILL} stroke={PLATE_STROKE} strokeWidth="1.3" />
        </g>
      );

    // Long bare shaft with four tines off the crown, curving out and back up to
    // finish around mid-shaft. All four carry a fluke; the fore-and-aft pair
    // are foreshortened, so they are shorter, thinner and their flukes smaller.
    case 'grapnel':
      return (
        <g>
          {shank(148, 2.2)}
          {/* Outer pair, in the plane of the drawing */}
          <g fill="none" stroke={PLATE_STROKE} strokeWidth="3.4" strokeLinecap="round">
            <path d="M 110 147 C 93 146, 71 133, 63 96" />
            <path d="M 110 147 C 127 146, 149 133, 157 96" />
          </g>
          {/* Inner pair, fore and aft of the shaft */}
          <g fill="none" stroke={DETAIL_STROKE} strokeWidth="2.6" strokeLinecap="round">
            <path d="M 110 147 C 100 143, 89 133, 85 110" />
            <path d="M 110 147 C 120 143, 131 133, 135 110" />
          </g>
          {/* Tip flukes: the outer pair full size, the inner pair reduced */}
          <polygon points="63,88 54,106 72,104" {...plate} strokeWidth={1} />
          <polygon points="157,88 148,104 166,106" {...plate} strokeWidth={1} />
          <polygon points="85,103 78,117 92,116" {...plate} strokeWidth={0.9} />
          <polygon points="135,103 128,116 142,117" {...plate} strokeWidth={0.9} />
          <circle cx={CX} cy={148} r={5} fill={PLATE_FILL} stroke={PLATE_STROKE} strokeWidth="1.2" />
        </g>
      );

    // An inverted bowl, 108 across by 52 deep - about twice as wide as it is
    // deep, which is the proportion these are cast in - with a thick rim and a
    // boss where the shank enters the crown. Nothing on it bites: it holds by
    // weight and by silting in.
    case 'mushroom':
      return (
        <g>
          {shank(96)}
          <path
            d="M 56 136 C 56 88, 164 88, 164 136 C 164 148, 56 148, 56 136 Z"
            {...plate}
          />
          {/* Far rim, arcing up inside the near one, so the cap reads as a
              hollow bowl rather than as a solid dome. */}
          <path
            d="M 57 133 C 80 122, 140 122, 163 133"
            fill="none" stroke={DETAIL_STROKE} strokeWidth="1.2"
          />
          {/* Boss at the crown, where the shank enters */}
          <ellipse
            cx={CX} cy={97} rx={9} ry={4}
            fill={PLATE_FILL} stroke={DETAIL_STROKE} strokeWidth="1.1"
          />
        </g>
      );
  }
}

export const AnchorDisplay: React.FC<AnchorDisplayProps> = ({ type, label }) => (
  <div className="flex flex-col items-center gap-3 select-none w-full">
    {label && (
      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-mono">{label}</div>
    )}

    <div className="w-full max-w-[240px] rounded-xl border border-slate-800 bg-slate-900/60 p-3 backdrop-blur-sm">
      <svg viewBox="0 0 220 170" className="w-full" xmlns="http://www.w3.org/2000/svg">
        {/* Shackle ring, common to all five */}
        <circle
          cx={CX}
          cy={RING_CY}
          r={RING_R}
          fill="none"
          stroke={RING_STROKE}
          strokeWidth="2.2"
        />

        {anchorBody(type)}
      </svg>
    </div>
  </div>
);
