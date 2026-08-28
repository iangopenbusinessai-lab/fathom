import React from 'react';
import { DayShapeName, shapeNode } from './DayShapeDisplay';

export type VesselTypeName =
  | 'nuc'       // Rule 27(a) — not under command
  | 'ram'       // Rule 27(b) — restricted in ability to manoeuvre
  | 'cbd'       // Rule 28    — constrained by her draft
  | 'fishing'   // Rule 26(b) — engaged in fishing (trawling)
  | 'sailing'   // Rule 25    — under sail alone
  | 'towing';   // Rule 24(a)(v) — towing, tow exceeding 200 m

interface VesselProfileProps {
  type: VesselTypeName;
  label?: string;
}

// Side elevation, 220×170. The player is asked to name the vessel type from
// what she is showing, so NOTHING here may name the type in text - the whole
// point of these questions is that the day shapes and rig carry the meaning.
//
// Every cue below is a real COLREGS signal, not a drawing convention invented
// to make the types look different:
//   nuc      two balls in a vertical line            Rule 27(a)(ii)
//   ram      ball over diamond over ball             Rule 27(b)(ii)
//   cbd      one cylinder                            Rule 28
//   fishing  two cones, apexes together, plus gear   Rule 26(b)(i)
//   sailing  the rig itself; no day shape is carried Rule 25
//   towing   one diamond, plus the tow astern        Rule 24(a)(v)
//
// Power-driven is deliberately absent: a power-driven vessel underway carries
// no day shape at all, so on a bare hull she is indistinguishable from a
// sailing vessel with her sails furled. There is no honest cue to draw.

const HULL_FILL = 'rgb(15,23,42)';
const HULL_STROKE = 'rgb(148,163,184)';
const RIG_STROKE = 'rgba(203,213,225,0.75)';
const GEAR_STROKE = 'rgba(148,163,184,0.6)';

const DECK_Y = 112;
const WATERLINE_Y = 120;
const MAST_X = 108;
const MAST_TOP_Y = 26;

// Shapes stack downward from the masthead, first entry uppermost.
const SHAPE_TOP_Y = 44;
const SHAPE_SPACING = 26;

interface Profile {
  shapes: DayShapeName[];
  rig?: 'sail';
  gear?: 'trawl' | 'tow';
}

const PROFILES: Record<VesselTypeName, Profile> = {
  nuc:     { shapes: ['ball', 'ball'] },
  ram:     { shapes: ['ball', 'diamond', 'ball'] },
  cbd:     { shapes: ['cylinder'] },
  fishing: { shapes: ['cone-down', 'cone-up'], gear: 'trawl' },
  sailing: { shapes: [], rig: 'sail' },
  towing:  { shapes: ['diamond'], gear: 'tow' },
};

const HULL_PATH =
  `M 34 ${DECK_Y} L 186 ${DECK_Y} L 176 ${WATERLINE_Y + 10} C 130 ${WATERLINE_Y + 16}, 74 ${WATERLINE_Y + 16}, 44 ${WATERLINE_Y + 10} Z`;

export const VesselProfile: React.FC<VesselProfileProps> = ({ type, label }) => {
  const profile = PROFILES[type];

  return (
    <div className="flex flex-col items-center gap-3 select-none w-full">
      {label && (
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-mono">{label}</div>
      )}

      <div className="w-full max-w-[240px] rounded-xl border border-slate-800 bg-slate-900/60 p-3 backdrop-blur-sm">
        <svg viewBox="0 0 220 170" className="w-full" xmlns="http://www.w3.org/2000/svg">
          {/* Waterline */}
          <line
            x1={6} y1={WATERLINE_Y} x2={214} y2={WATERLINE_Y}
            stroke="rgba(34,211,238,0.25)" strokeWidth="1" strokeDasharray="5 4"
          />

          {/* Towed vessel astern, on a towline - Rule 24 */}
          {profile.gear === 'tow' && (
            <g>
              <line
                x1={34} y1={DECK_Y - 1} x2={30} y2={DECK_Y + 5}
                stroke={GEAR_STROKE} strokeWidth="1.2"
              />
              <path
                d={`M 3 ${DECK_Y + 5} L 30 ${DECK_Y + 5} L 26 ${DECK_Y + 15} C 18 ${DECK_Y + 17}, 10 ${DECK_Y + 17}, 7 ${DECK_Y + 15} Z`}
                fill={HULL_FILL}
                stroke={HULL_STROKE}
                strokeWidth="1"
                opacity="0.75"
              />
            </g>
          )}

          {/* Trawl gear streaming astern - Rule 26 */}
          {profile.gear === 'trawl' && (
            <g stroke={GEAR_STROKE} strokeWidth="1.1" fill="none">
              <path d={`M 40 ${DECK_Y + 2} C 22 ${DECK_Y + 12}, 14 ${DECK_Y + 20}, 8 ${DECK_Y + 30}`} />
              <path d={`M 52 ${DECK_Y + 6} C 36 ${DECK_Y + 18}, 26 ${DECK_Y + 26}, 20 ${DECK_Y + 34}`} />
              <path
                d={`M 8 ${DECK_Y + 30} L 20 ${DECK_Y + 34} L 16 ${DECK_Y + 46} L 4 ${DECK_Y + 42} Z`}
                strokeDasharray="2 2"
              />
            </g>
          )}

          {/* Hull */}
          <path d={HULL_PATH} fill={HULL_FILL} stroke={HULL_STROKE} strokeWidth="1.2" />

          {/* Mast */}
          <line
            x1={MAST_X} y1={DECK_Y} x2={MAST_X} y2={MAST_TOP_Y}
            stroke={RIG_STROKE} strokeWidth="1.6"
          />

          {/* Sail plan - the identifying feature of a vessel under sail */}
          {profile.rig === 'sail' && (
            <g fill="rgba(203,213,225,0.13)" stroke={RIG_STROKE} strokeWidth="1.2">
              {/* Boom */}
              <line x1={MAST_X} y1={DECK_Y - 6} x2={MAST_X - 52} y2={DECK_Y - 6} />
              {/* Mainsail, aft of the mast */}
              <path d={`M ${MAST_X - 3} ${MAST_TOP_Y + 6} L ${MAST_X - 3} ${DECK_Y - 9} L ${MAST_X - 50} ${DECK_Y - 9} Z`} />
              {/* Headsail, forward of the mast */}
              <path d={`M ${MAST_X + 3} ${MAST_TOP_Y + 12} L ${MAST_X + 3} ${DECK_Y - 9} L ${MAST_X + 54} ${DECK_Y - 7} Z`} />
            </g>
          )}

          {/* Day shapes, first entry uppermost */}
          {profile.shapes.map((shape, i) =>
            shapeNode(shape, MAST_X, SHAPE_TOP_Y + i * SHAPE_SPACING, `shape-${i}`)
          )}
        </svg>
      </div>
    </div>
  );
};
