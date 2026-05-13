import React from 'react';
import { DrillConfig } from '../types';

interface HubProps {
  drills: DrillConfig[];
  onSelect: (drill: DrillConfig) => void;
}

export const Hub: React.FC<HubProps> = ({ drills, onSelect }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8">
      <div className="mb-12 text-center">
        <div className="inline-block px-3 py-1 bg-cyan-950/50 border border-cyan-800 rounded-full text-[10px] uppercase tracking-[0.2em] text-cyan-400 mb-4">
          Islander Training Aid V1.0
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tighter mb-4 drop-shadow-xl">
          Nautical<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Master</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-xs mx-auto leading-relaxed">
          Select a drill to begin training.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        {drills.map((drill) => (
          <button
            key={drill.id}
            onClick={() => onSelect(drill)}
            className="group text-left p-8 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-cyan-500/40 transition-all backdrop-blur-sm shadow-lg"
          >
            <h2 className="text-xl font-bold text-white group-hover:text-cyan-400 mb-2 transition-colors">
              {drill.title}
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">{drill.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
