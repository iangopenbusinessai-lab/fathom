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
// Each silhouette is built from the features that actually tell the types
// apart on a foredeck, not from stylistic differences invented to make five
// shapes look distinct:
//   fluke     two broad flat plates hinged at the crown, stock across it
//   plow      one plowshare, wings up and a single point down
//   claw      three heavy curved tines off one crown, no stock, short shank
//   grapnel   four thin hooked tines around a long shaft
//   mushroom  an inverted bowl on a plain shank
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
    // Wide flat flukes hinged at a crown, with the stock across it. The plates
    // are what give it its holding power for its weight in sand and mud.
    case 'fluke':
      return (
        <g>
          {shank(118)}
          {/* Stock, across the crown */}
          <line
            x1={64} y1={116} x2={156} y2={116}
            stroke={DETAIL_STROKE} strokeWidth="2.2" strokeLinecap="round"
          />
          <circle cx={64} cy={116} r={2.6} fill={PLATE_FILL} stroke={DETAIL_STROKE} strokeWidth="1" />
          <circle cx={156} cy={116} r={2.6} fill={PLATE_FILL} stroke={DETAIL_STROKE} strokeWidth="1" />
          {/* Crown */}
          <circle cx={CX} cy={118} r={5} fill={PLATE_FILL} stroke={PLATE_STROKE} strokeWidth="1.1" />
          {/* Two broad plates, widening to the tips */}
          <path d="M 106 116 L 58 150 L 80 156 L 106 130 Z" {...plate} />
          <path d="M 114 116 L 162 150 L 140 156 L 114 130 Z" {...plate} />
        </g>
      );

    // One plowshare: two wings sweeping up and out from a single point, with a
    // deep saddle between them where the shank lands. The saddle is what keeps
    // it from reading as a spade - a spade has a straight top edge.
    case 'plow':
      return (
        <g>
          {shank(126)}
          <path
            d="M 110 158 C 92 150, 68 130, 76 98 L 110 128 L 144 98 C 152 130, 128 150, 110 158 Z"
            {...plate}
          />
          {/* Ridge down the share */}
          <line
            x1={CX} y1={128} x2={CX} y2={150}
            stroke={DETAIL_STROKE} strokeWidth="1" strokeLinecap="round"
          />
          {/* Hinge collar - the CQR's shank pivots here, the Delta's does not.
              Drawn as a fitting, small enough not to answer an-10 by itself. */}
          <circle cx={CX} cy={124} r={4.5} fill={PLATE_FILL} stroke={DETAIL_STROKE} strokeWidth="1.1" />
        </g>
      );

    // Three heavy curved tines off one crown, short shank, no stock: a single
    // casting. Drawn as thick round-capped strokes rather than outlined plates
    // because the tines are round in section - outlining them made them taper
    // to points at both ends and read as leaves.
    case 'claw':
      return (
        <g>
          {shank(106)}
          <g fill="none" stroke={PLATE_STROKE} strokeWidth="7.5" strokeLinecap="round">
            <path d="M 110 110 C 92 120, 78 134, 74 152" />
            <path d="M 110 110 C 108 128, 110 142, 116 156" />
            <path d="M 110 110 C 128 118, 140 132, 146 148" />
          </g>
          <circle cx={CX} cy={108} r={8} fill={PLATE_FILL} stroke={PLATE_STROKE} strokeWidth="1.4" />
        </g>
      );

    // Four thin hooked tines around a long bare shaft, each ending in a small
    // fluke: it holds by catching on something rather than by burying, so it is
    // drawn as hooks with points, not as plates.
    case 'grapnel':
      return (
        <g>
          {shank(146, 2.2)}
          <g fill="none" stroke={PLATE_STROKE} strokeWidth="3.6" strokeLinecap="round">
            {/* Outer pair, sweeping furthest and highest */}
            <path d="M 110 146 C 96 144, 78 134, 68 104" />
            <path d="M 110 146 C 124 144, 142 134, 152 104" />
          </g>
          <g fill="none" stroke={DETAIL_STROKE} strokeWidth="3" strokeLinecap="round">
            {/* Inner pair, foreshortened - the tines fore and aft of the shaft */}
            <path d="M 110 146 C 102 142, 92 134, 88 116" />
            <path d="M 110 146 C 118 142, 128 134, 132 116" />
          </g>
          {/* Tip flukes on the outer pair */}
          <polygon points="68,98 61,114 77,110" {...plate} strokeWidth={1} />
          <polygon points="152,98 143,110 159,114" {...plate} strokeWidth={1} />
          {/* Crown collar */}
          <circle cx={CX} cy={147} r={5} fill={PLATE_FILL} stroke={PLATE_STROKE} strokeWidth="1.2" />
        </g>
      );

    // An inverted bowl on a plain shank. Nothing bites: it holds by its own
    // weight and by silting in over time.
    case 'mushroom':
      return (
        <g>
          {shank(110)}
          <path
            d="M 58 128 C 58 84, 162 84, 162 128 C 136 142, 84 142, 58 128 Z"
            {...plate}
          />
          {/* The rim of the bowl, so it reads as a cap and not as a solid dome */}
          <path
            d="M 58 128 C 84 142, 136 142, 162 128"
            fill="none"
            stroke={DETAIL_STROKE}
            strokeWidth="1.2"
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
