import React, { useState } from 'react';
import { DrillConfig } from './types';
import { DRILLS } from './drills';
import { Hub } from './components/Hub';

export default function App() {
  const [activeDrill, setActiveDrill] = useState<DrillConfig | null>(null);

  if (activeDrill) {
    const DrillComponent = activeDrill.component;
    return (
      <div className="relative">
        <button
          onClick={() => setActiveDrill(null)}
          className="fixed top-4 left-4 z-50 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all backdrop-blur-sm"
        >
          ← Hub
        </button>
        <DrillComponent />
      </div>
    );
  }

  return <Hub drills={DRILLS} onSelect={setActiveDrill} />;
}
