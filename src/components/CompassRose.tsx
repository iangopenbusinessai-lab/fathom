import React, { useMemo } from 'react';
import { COMPASS_POINTS, RELATIVE_POINTS } from '../constants';
import { CompassPoint, GameState, GameMode, GameType } from '../types';

interface CompassRoseProps {
  targetPoint: CompassPoint | null;
  gameState: GameState;
  onPointClick: (index: number) => void;
  clickedIndex: number | null; // The index the user just clicked
  rotation: number;
  gameMode: GameMode;
  gameType: GameType;
}

export const CompassRose: React.FC<CompassRoseProps> = ({
  targetPoint,
  gameState,
  onPointClick,
  clickedIndex,
  rotation,
  gameMode,
  gameType
}) => {

  const isHardVisuals = gameMode === 'timed' || gameMode === 'exam';
  const isCompass = gameType === 'compass';
  const activePoints = isCompass ? COMPASS_POINTS : RELATIVE_POINTS;

  // Helper to calculate Cubic Bezier point
  const cubicBezier = (t: number, p0: number, p1: number, p2: number, p3: number) => {
    return Math.pow(1 - t, 3) * p0 +
           3 * Math.pow(1 - t, 2) * t * p1 +
           3 * (1 - t) * Math.pow(t, 2) * p2 +
           Math.pow(t, 3) * p3;
  };

  const getShipCoords = (index: number) => {
    // Ship Shape Definition:
    // Right Side Curve: Start(50, 4) -> C1(85, 20) -> C2(85, 70) -> End(70, 96)
    // Bottom: Line from (70, 96) to (30, 96)

    // Key Indices:
    // 0: Dead Ahead (50, 4)
    // 8: Stbd Beam (should be near mid t)
    // 14: Corner? (70, 96)
    // 16: Dead Astern (50, 96)

    if (index === 0) return { x: 50, y: 4 };
    if (index === 16) return { x: 50, y: 96 };

    // Starboard (Right) Side: Indices 1 to 15
    // Port (Left) Side: Indices 31 down to 17

    const isStarboard = index > 0 && index < 16;
    const i = isStarboard ? index : (32 - index);

    let x, y;

    // Distribute points 1..13 along the Bezier curve
    // Point 14 is the Corner
    // Point 15 is on the flat Stern line

    if (i === 14) {
        // Corner
        x = 70;
        y = 96;
    } else if (i === 15) {
        // Between Corner(70) and Center(50).
        // 16 is Center. 14 is Corner. 15 is mid way.
        x = 60;
        y = 96;
    } else {
        // Points 1 to 13 along the curve.
        // We map 1..13 to t values.
        // To distribute them nicely, we shouldn't use purely linear t, but linear is a good start.
        // t=0 is Index 0 (Top). t=1 is Index 14 (Corner).
        // So t = i / 14.
        const t = i / 14;

        // P0(50,4), P1(85,20), P2(85,70), P3(70,96)
        x = cubicBezier(t, 50, 85, 85, 70);
        y = cubicBezier(t, 4, 20, 70, 96);
    }

    // Mirror for Port side
    if (!isStarboard) {
        x = 50 - (x - 50);
    }

    return { x, y };
  };


  // Calculate positions
  const points = useMemo(() => {
    return activePoints.map((point) => {
      let x, y;

      if (isCompass) {
          // Convert degrees to radians. Subtract 90 degrees so 0 is North (top)
          const radians = (point.angle - 90) * (Math.PI / 180);
          x = 50 + (Math.cos(radians) * 42); // 42% from center (Circle)
          y = 50 + (Math.sin(radians) * 42);
      } else {
          // Ship Shape Custom Outline
          const coords = getShipCoords(point.index);
          x = coords.x;
          y = coords.y;
      }

      let sizeClass = '';
      let colorClass = '';
      let zIndex = 'z-10';
      const isNorthOrAhead = point.index === 0;

      if (!isCompass) {
         // Relative Mode
         if (isHardVisuals) {
            // Hard Mode (Uniform Grey, Distinctive Head)
            if (isNorthOrAhead) {
                colorClass = 'bg-white border border-slate-900 z-20 shadow-[0_0_15px_rgba(255,255,255,0.3)]';
                sizeClass = 'w-6 h-6';
            } else {
                sizeClass = 'w-4 h-4';
                colorClass = 'bg-slate-600 hover:bg-cyan-400 hover:scale-150 transition-all duration-200 cursor-pointer';
            }
         } else {
            // Practice Mode (Color Coded)
            sizeClass = 'w-4 h-4';
            // 0 = Ahead (White), 1-15 = Stbd (Green), 16 = Astern (White), 17-31 = Port (Red)
            if (point.index === 0 || point.index === 16) {
                colorClass = 'bg-white border border-slate-900';
                sizeClass = 'w-5 h-5';
            } else if (point.index > 0 && point.index < 16) {
                colorClass = 'bg-green-500 hover:bg-green-400 hover:scale-150 shadow-[0_0_10px_rgba(34,197,94,0.4)]';
            } else {
                colorClass = 'bg-red-500 hover:bg-red-400 hover:scale-150 shadow-[0_0_10px_rgba(239,68,68,0.4)]';
            }
            colorClass += ' cursor-pointer transition-all duration-300';
         }
      } else if (isHardVisuals) {
        // Hard Mode Visuals: Uniform dots, except North
        if (isNorthOrAhead) {
            sizeClass = 'w-10 h-10 border-2 border-white/20';
            colorClass = 'bg-red-600 hover:bg-red-500 cursor-pointer shadow-[0_0_15px_rgba(220,38,38,0.5)] flex items-center justify-center text-white font-bold';
            zIndex = 'z-20';
        } else {
            sizeClass = 'w-5 h-5';
            colorClass = 'bg-slate-600 hover:bg-cyan-400 hover:scale-125 cursor-pointer';
        }
      } else {
        // Easy/Practice Compass Mode Visuals: Hierarchy sizing
        if (point.type === 'cardinal') {
            sizeClass = 'w-8 h-8 border-2 border-slate-900';
            colorClass = 'bg-slate-400 hover:bg-cyan-400 cursor-pointer';
            zIndex = 'z-20';
        } else if (point.type === 'intercardinal') {
            sizeClass = 'w-6 h-6 border border-slate-900';
            colorClass = 'bg-slate-500 hover:bg-cyan-400 cursor-pointer';
        } else {
            sizeClass = 'w-4 h-4';
            colorClass = 'bg-slate-500/40 hover:bg-cyan-400 hover:scale-150 hover:shadow-[0_0_15px_rgba(34,211,238,0.6)] cursor-pointer';
        }
      }

      // Feedback Logic (Only when something has been clicked)
      if (clickedIndex !== null) {
        // Dim everything by default
        colorClass = 'bg-slate-700 opacity-30';

        if (point.index === targetPoint?.index) {
            // Correct answer -> Green highlight
            colorClass = 'bg-green-400 shadow-[0_0_30px_rgba(34,197,94,1)] scale-150 border-2 border-white z-30';
            sizeClass = (isNorthOrAhead && isHardVisuals && isCompass) ? 'w-12 h-12 flex items-center justify-center' : 'w-10 h-10';
        } else if (point.index === clickedIndex) {
            // Wrong click -> Red/Orange
            colorClass = 'bg-orange-600 shadow-[0_0_30px_rgba(234,88,12,0.8)] scale-125 border-2 border-white z-30';
            sizeClass = (isNorthOrAhead && isHardVisuals && isCompass) ? 'w-12 h-12 flex items-center justify-center' : 'w-8 h-8';
        } else if (isNorthOrAhead && isHardVisuals && isCompass) {
            // Keep North visible in hard mode even when dimmed
            colorClass = 'bg-red-900/50 border-white/10 flex items-center justify-center text-white/50';
        } else if (isNorthOrAhead && isHardVisuals && !isCompass) {
             // Keep Dead Ahead visible in relative hard mode
             colorClass = 'bg-white opacity-50';
        }
      }

      return { ...point, x, y, sizeClass, colorClass, zIndex };
    });
  }, [targetPoint, clickedIndex, isHardVisuals, rotation, isCompass, activePoints]);

  return (
    <div
      className="relative w-full max-w-[600px] aspect-square mx-auto transition-transform duration-700 ease-out"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Visual Container */}

      {isCompass ? (
        <>
            {/* Background Decorative Rings for Compass */}
            <div className="absolute inset-0 rounded-full border border-slate-700/30 scale-[0.85]"></div>
            <div className="absolute inset-0 rounded-full border border-slate-800 scale-[0.6]"></div>
            <div className="absolute inset-0 rounded-full border-4 border-slate-800/50 shadow-inner bg-slate-900/40 backdrop-blur-sm"></div>

            {/* Central Hub */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-slate-700 rounded-full z-0"></div>

            {/* Standard Cross Hairs (Hidden in Hard Mode) */}
            {!isHardVisuals && (
                <>
                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-700/20 -translate-x-1/2"></div>
                    <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-700/20 -translate-y-1/2"></div>
                </>
            )}

            {/* North Indicator (Practice/Easy Mode Only) */}
            {!isHardVisuals && (
                <div className="absolute left-1/2 top-[1%] -translate-x-1/2 text-slate-500 font-bold text-sm select-none">N</div>
            )}
        </>
      ) : (
        <>
            {/* Ship Visuals - SVG Implementation */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl opacity-90">
                    <defs>
                      <linearGradient id="hullGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgb(15, 23, 42)" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="rgb(30, 41, 59)" stopOpacity="0.8" />
                      </linearGradient>
                    </defs>

                    {/*
                       Hull Shape:
                       Starts at Bow (50, 4).
                       Curves wide to Beam.
                       Squares off at Stern (y=96).
                    */}
                    <path
                      d="M 50 4 C 85 20, 85 70, 70 96 L 30 96 C 15 70, 15 20, 50 4 Z"
                      fill="url(#hullGradient)"
                      stroke="rgba(71, 85, 105, 0.5)"
                      strokeWidth="0.5"
                    />

                    {/* Deck Detail: Center line */}
                    <line x1="50" y1="8" x2="50" y2="92" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="0.5" />

                    {/* Transom detail (Squared off bottom) */}
                    <path d="M 32 94 L 68 94" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="0.5" />

                    {/* Bow detail */}
                    <path d="M 50 4 L 50 15" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="0.5" />
                 </svg>
             </div>
             {/* Center Label */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center opacity-30 pointer-events-none z-0">
                <span className="text-[10px] font-bold tracking-widest text-slate-400 mb-1">SHIP</span>
             </div>
        </>
      )}

      {/* Render Points */}
      {points.map((p) => (
        <div
          key={p.abbr}
          onClick={() => gameState === 'playing' && clickedIndex === null && onPointClick(p.index)}
          className={`absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 ${p.sizeClass} ${p.colorClass} ${p.zIndex}`}
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        >
          {isCompass && isHardVisuals && p.index === 0 && (
            <span
              className="select-none text-[10px] pointer-events-none"
              style={{ transform: `rotate(${-rotation}deg)` }}
            >
              N
            </span>
          )}
        </div>
      ))}
    </div>
  );
};
