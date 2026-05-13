import React, { useState } from 'react';
import { Play, Timer, ArrowLeft, Medal, Clock, Ship, Compass, XCircle } from 'lucide-react';
import { GameState, GameStats, CompassPoint, GameMode, GameType } from '../types';

interface ControlPanelProps {
  gameState: GameState;
  targetPoint: CompassPoint | null;
  stats: GameStats;
  timeLeft: number;
  gameMode: GameMode;
  gameType: GameType;
  onStart: (mode: GameMode, type: GameType) => void;
  onQuit: () => void;
  examProgress?: { current: number; total: number };
  isTitleScreen?: boolean;
}

type MenuState = 'root' | 'compass-main' | 'compass-challenge' | 'relative-main' | 'relative-challenge';

export const ControlPanel: React.FC<ControlPanelProps> = ({
  gameState,
  targetPoint,
  stats,
  timeLeft,
  gameMode,
  gameType,
  onStart,
  onQuit,
  examProgress,
  isTitleScreen = false
}) => {

  const [menuState, setMenuState] = useState<MenuState>('root');

  // Format time
  const seconds = Math.ceil(timeLeft / 1000);
  const isWarning = seconds <= 5;

  const getTimerColor = () => {
    if (isWarning) return 'text-red-500 animate-pulse';
    if (gameMode === 'exam') return 'text-yellow-400';
    return 'text-white';
  };

  const handleBack = () => {
      if (menuState === 'compass-challenge') setMenuState('compass-main');
      else if (menuState === 'compass-main') setMenuState('root');
      else if (menuState === 'relative-challenge') setMenuState('relative-main');
      else if (menuState === 'relative-main') setMenuState('root');
  };

  return (
    <div className={`flex flex-col items-center justify-start ${isTitleScreen ? 'space-y-12' : 'space-y-6'} w-full max-w-md mx-auto p-4 z-10 transition-all duration-500`}>

      {/* Stats Bar - Hidden on Title Screen */}
      {!isTitleScreen && (
        <div className="flex w-full justify-between items-end text-slate-400 font-mono border-b border-slate-800 pb-3 relative animate-in fade-in slide-in-from-top-4">
          <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest opacity-60">Score</span>
              <span className="text-3xl font-bold text-cyan-400 leading-none">{stats.score}</span>
          </div>

          {gameState === 'playing' && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-3">
                <div className={`flex flex-col items-center ${getTimerColor()}`}>
                      <Timer className="w-4 h-4 mb-1 opacity-50" />
                      <span className="text-3xl font-bold font-mono leading-none">{seconds}s</span>
                </div>
                {/* Quit Button */}
                <button
                    onClick={onQuit}
                    className="absolute -right-24 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] uppercase tracking-wider text-red-500 hover:text-red-400 opacity-60 hover:opacity-100 transition-all"
                >
                    <XCircle size={14} /> Quit
                </button>
            </div>
          )}

          <div className="flex flex-col items-end">
              {gameMode === 'exam' && examProgress ? (
                  <>
                      <span className="text-[10px] uppercase tracking-widest opacity-60">Progress</span>
                      <span className="text-xl font-bold text-slate-300 leading-none">{examProgress.current}/{examProgress.total}</span>
                  </>
              ) : (
                  <>
                      <span className="text-[10px] uppercase tracking-widest opacity-60">Best</span>
                      <span className="text-xl font-bold text-slate-300 leading-none">{stats.bestScore}</span>
                  </>
              )}
          </div>
        </div>
      )}

      {/* Main Action Area */}
      <div className={`flex flex-col items-center justify-center w-full relative ${isTitleScreen ? 'min-h-[auto]' : 'min-h-[250px]'}`}>

        {/* Start Screen / Menus */}
        {gameState === 'idle' && (
          <div className="text-center space-y-6 animate-in fade-in zoom-in-95 w-full">

            {/* Header - Only visible on Root menu in Title Screen */}
            {menuState === 'root' && isTitleScreen && (
                <div className="mb-12">
                    <div className="inline-block px-3 py-1 bg-cyan-950/50 border border-cyan-800 rounded-full text-[10px] uppercase tracking-[0.2em] text-cyan-400 mb-4">
                        Islander Training Aid V1.0
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tighter mb-4 drop-shadow-xl">
                        Nautical<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Master</span>
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base max-w-xs mx-auto leading-relaxed">
                        Master the 32-point compass rose and relative ship bearings.
                    </p>
                </div>
            )}

            {/* ROOT MENU: Compass vs Relative */}
            {menuState === 'root' && (
                <div className="grid grid-cols-1 gap-4 w-full max-w-sm mx-auto">
                    <button
                        onClick={() => setMenuState('compass-main')}
                        className="group relative flex items-center gap-5 px-6 py-6 rounded-2xl border border-cyan-900/30 bg-slate-800/40 hover:bg-slate-800/80 hover:border-cyan-500/50 transition-all text-left backdrop-blur-sm shadow-lg hover:shadow-cyan-900/20"
                    >
                        <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-900/20 p-4 rounded-xl text-cyan-400 group-hover:scale-110 group-hover:text-cyan-300 transition-all border border-cyan-500/10">
                            <Compass size={32} />
                        </div>
                        <div>
                            <span className="block font-bold text-xl text-white group-hover:text-cyan-300 transition-colors">Compass Rose</span>
                            <span className="text-xs text-slate-500 group-hover:text-slate-400">True bearings. 32 points.</span>
                        </div>
                    </button>

                    <button
                        onClick={() => setMenuState('relative-main')}
                        className="group relative flex items-center gap-5 px-6 py-6 rounded-2xl border border-indigo-900/30 bg-slate-800/40 hover:bg-slate-800/80 hover:border-indigo-500/50 transition-all text-left backdrop-blur-sm shadow-lg hover:shadow-indigo-900/20"
                    >
                        <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-900/20 p-4 rounded-xl text-indigo-400 group-hover:scale-110 group-hover:text-indigo-300 transition-all border border-indigo-500/10">
                            <Ship size={32} />
                        </div>
                        <div>
                            <span className="block font-bold text-xl text-white group-hover:text-indigo-300 transition-colors">Relative Bearings</span>
                            <span className="text-xs text-slate-500 group-hover:text-slate-400">Port &amp; Starboard relative.</span>
                        </div>
                    </button>
                </div>
            )}

            {/* COMPASS MENU: Practice vs Challenge */}
            {menuState === 'compass-main' && (
                <>
                    <div className="relative w-full mb-6">
                        <button
                            onClick={handleBack}
                            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white transition-colors hover:bg-slate-800 rounded-full"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h2 className="text-2xl font-bold text-cyan-400 tracking-tight">Compass Mode</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4 w-full max-w-xs mx-auto">
                        <button
                            onClick={() => onStart('practice', 'compass')}
                            className="group flex flex-col items-center gap-2 px-6 py-5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 hover:border-cyan-500/50 transition-all"
                        >
                            <span className="font-bold text-lg text-white group-hover:text-cyan-400">Practice Mode</span>
                            <span className="text-xs text-slate-500">North is up. 60s timer.</span>
                        </button>

                        <button
                            onClick={() => setMenuState('compass-challenge')}
                            className="group flex flex-col items-center gap-2 px-6 py-5 rounded-xl border border-red-900/30 bg-slate-800/80 hover:bg-red-950/30 hover:border-red-500/50 transition-all"
                        >
                            <span className="font-bold text-lg text-red-500 group-hover:text-red-400">Challenge Mode</span>
                            <span className="text-xs text-slate-500">Rotating North. Hard visuals.</span>
                        </button>
                    </div>
                </>
            )}

            {/* COMPASS CHALLENGE SUBMENU: Timed vs Exam */}
            {menuState === 'compass-challenge' && (
                <>
                     <div className="relative w-full mb-6">
                        <button
                            onClick={handleBack}
                            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white transition-colors hover:bg-slate-800 rounded-full"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h2 className="text-2xl font-bold text-red-500 tracking-tight">Challenge Mode</h2>
                     </div>

                     <div className="grid grid-cols-1 gap-4 w-full max-w-xs mx-auto">
                        <button
                            onClick={() => onStart('timed', 'compass')}
                            className="flex items-center gap-4 p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all group"
                        >
                            <div className="bg-red-500/10 p-3 rounded-lg text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                <Clock size={24} />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-white group-hover:text-red-400">Timed Attack</div>
                                <div className="text-xs text-slate-400">60s global timer. High score run.</div>
                            </div>
                        </button>

                        <button
                            onClick={() => onStart('exam', 'compass')}
                            className="flex items-center gap-4 p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all group"
                        >
                            <div className="bg-yellow-500/10 p-3 rounded-lg text-yellow-500 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                                <Medal size={24} />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-white group-hover:text-yellow-400">Exam Mode</div>
                                <div className="text-xs text-slate-400">32 bearings. 15s per question. No retries.</div>
                            </div>
                        </button>
                     </div>
                </>
            )}

            {/* RELATIVE MENU: Practice vs Challenge */}
            {menuState === 'relative-main' && (
                <>
                    <div className="relative w-full mb-6">
                        <button
                            onClick={handleBack}
                            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white transition-colors hover:bg-slate-800 rounded-full"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h2 className="text-2xl font-bold text-indigo-400 tracking-tight">Relative Mode</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4 w-full max-w-xs mx-auto">
                        <button
                            onClick={() => onStart('practice', 'relative')}
                            className="group flex flex-col items-center gap-2 px-6 py-5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 hover:border-indigo-500/50 transition-all"
                        >
                            <span className="font-bold text-lg text-white group-hover:text-indigo-400">Practice Mode</span>
                            <span className="text-xs text-slate-500">Color coded. 60s timer.</span>
                        </button>

                        <button
                            onClick={() => setMenuState('relative-challenge')}
                            className="group flex flex-col items-center gap-2 px-6 py-5 rounded-xl border border-red-900/30 bg-slate-800/80 hover:bg-red-950/30 hover:border-red-500/50 transition-all"
                        >
                            <span className="font-bold text-lg text-red-500 group-hover:text-red-400">Challenge Mode</span>
                            <span className="text-xs text-slate-500">Grey dots. No color hints.</span>
                        </button>
                    </div>
                </>
            )}

            {/* RELATIVE CHALLENGE SUBMENU: Timed vs Exam */}
            {menuState === 'relative-challenge' && (
                <>
                     <div className="relative w-full mb-6">
                        <button
                            onClick={handleBack}
                            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white transition-colors hover:bg-slate-800 rounded-full"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h2 className="text-2xl font-bold text-red-500 tracking-tight">Relative Challenge</h2>
                     </div>

                     <div className="grid grid-cols-1 gap-4 w-full max-w-xs mx-auto">
                        <button
                            onClick={() => onStart('timed', 'relative')}
                            className="flex items-center gap-4 p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all group"
                        >
                            <div className="bg-red-500/10 p-3 rounded-lg text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                <Clock size={24} />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-white group-hover:text-red-400">Timed Attack</div>
                                <div className="text-xs text-slate-400">60s global timer. High score run.</div>
                            </div>
                        </button>

                        <button
                            onClick={() => onStart('exam', 'relative')}
                            className="flex items-center gap-4 p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all group"
                        >
                            <div className="bg-yellow-500/10 p-3 rounded-lg text-yellow-500 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                                <Medal size={24} />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-white group-hover:text-yellow-400">Exam Mode</div>
                                <div className="text-xs text-slate-400">32 bearings. 15s per question. No retries.</div>
                            </div>
                        </button>
                     </div>
                </>
            )}

          </div>
        )}

        {/* Playing Interface - Only visible when game is active */}
        {gameState === 'playing' && targetPoint && (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
             <div className="text-slate-400 text-xs font-mono uppercase tracking-[0.2em] mb-2">
                {gameMode === 'exam' ? 'Target' : 'Find'}
             </div>
             <div className="text-center">
                 <div className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] leading-tight">
                    {targetPoint.abbr}
                 </div>
                 <div className="text-cyan-400 text-base md:text-lg font-medium opacity-80 max-w-[280px] mx-auto leading-snug">
                    {targetPoint.full}
                 </div>
             </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'finished' && (
             <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 w-full bg-slate-900/80 p-8 rounded-2xl border border-slate-800 backdrop-blur-xl">
                <div>
                    <div className="text-slate-400 text-sm uppercase tracking-widest mb-1">
                        {gameMode === 'exam' ? 'Exam Complete' : "Session Ended"}
                    </div>
                    <div className="text-5xl font-bold text-white mb-2">{stats.score}</div>
                    <div className="text-cyan-400 text-sm">
                        {gameMode === 'exam' ? 'Correct / 32' : 'Score'}
                    </div>
                </div>

                <div className="h-px w-full bg-slate-800"></div>

                <button
                    onClick={() => onStart(gameMode, gameType)}
                    className="w-full py-3 bg-white text-slate-900 hover:bg-cyan-50 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    <Play size={18} />
                    Try Again
                </button>

                <button
                    onClick={() => {
                        setMenuState('root');
                        onQuit(); // Use quit handler to reset generic state
                    }}
                    className="text-xs text-slate-500 hover:text-slate-300 underline block w-full py-2"
                >
                    Back to Main Menu
                </button>
             </div>
        )}

      </div>
    </div>
  );
};
