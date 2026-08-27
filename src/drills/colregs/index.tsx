import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Play, Timer, Medal, XCircle, BookOpen } from 'lucide-react';
import {
  COLREGS_QUESTIONS,
  COLREGS_QUESTIONS_BY_CATEGORY,
  CATEGORY_LABELS,
  ColregsCategory,
  ColregsQuestion,
} from './constants';
import { ScenarioCard } from './components/ScenarioCard';
import { LightDisplay, LightName } from './components/LightDisplay';
import { VesselScenario, ScenarioType } from './components/VesselScenario';

type DrillState = 'idle' | 'playing' | 'finished';
type DrillMode = 'practice' | 'exam';
type CategoryFilter = ColregsCategory | 'all';

const EXAM_QUESTION_MS = 15000;

const QUESTION_LIGHTS: Partial<Record<string, LightName[]>> = {
  'nl-01': ['starboard'],
  'nl-02': ['port'],
  'nl-03': ['masthead'],
  'nl-04': ['masthead', 'port', 'starboard', 'stern'],
  'nl-05': ['anchor'],
  'nl-06': ['stern'],
  'nl-07': ['allRoundRed1', 'allRoundRed2'],
  'nl-08': ['masthead', 'masthead2', 'masthead3', 'port', 'starboard', 'stern'],
  'nl-09': ['masthead', 'port', 'starboard', 'stern', 'allRoundRed1', 'allRoundRed2', 'allRoundRed3'],
  'nl-10': ['allRoundWhite', 'allRoundRed1'],
};

const QUESTION_SCENARIOS: Partial<Record<string, ScenarioType>> = {
  'vh-01': 'priority-nuc',
  'vh-02': 'sail-keeps-clear-ram',
  'vh-03': 'crossing-stbd',
  'vh-04': 'head-on',
  'vh-05': 'overtaking',
  'vh-06': 'overtaking',
  'vh-07': 'crossing-port',
  'vh-08': 'standon-may-act',
  'vh-09': 'fishing-over-sailing',
  'vh-10': 'hierarchy-ladder',
};

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function getPool(filter: CategoryFilter): ColregsQuestion[] {
  return filter === 'all' ? COLREGS_QUESTIONS : COLREGS_QUESTIONS_BY_CATEGORY[filter];
}

const CATEGORY_ORDER: CategoryFilter[] = [
  'all',
  'navigation-lights',
  'sound-signals',
  'vessel-hierarchy',
  'day-shapes',
];

const CATEGORY_META: Record<CategoryFilter, { label: string; sub: string; accent: string }> = {
  'all':               { label: 'All COLREGS',        sub: '36 questions across all topics',    accent: 'cyan'   },
  'navigation-lights': { label: 'Navigation Lights',  sub: '10 questions — lights & arcs',      accent: 'amber'  },
  'sound-signals':     { label: 'Sound Signals',      sub: '8 questions — blasts & fog signals', accent: 'green'  },
  'vessel-hierarchy':  { label: 'Vessel Hierarchy',   sub: '10 questions — give-way rules',     accent: 'indigo' },
  'day-shapes':        { label: 'Day Shapes',         sub: '8 questions — shapes & marks',      accent: 'rose'   },
};

const ACCENT_CLASSES: Record<string, { border: string; bg: string; text: string; hover: string }> = {
  cyan:   { border: 'border-cyan-900/40',   bg: 'from-cyan-500/15 to-cyan-900/15',   text: 'text-cyan-400',   hover: 'hover:border-cyan-500/50'   },
  amber:  { border: 'border-amber-900/40',  bg: 'from-amber-500/15 to-amber-900/15', text: 'text-amber-400',  hover: 'hover:border-amber-500/50'  },
  green:  { border: 'border-green-900/40',  bg: 'from-green-500/15 to-green-900/15', text: 'text-green-400',  hover: 'hover:border-green-500/50'  },
  indigo: { border: 'border-indigo-900/40', bg: 'from-indigo-500/15 to-indigo-900/15',text: 'text-indigo-400',hover: 'hover:border-indigo-500/50' },
  rose:   { border: 'border-rose-900/40',   bg: 'from-rose-500/15 to-rose-900/15',   text: 'text-rose-400',   hover: 'hover:border-rose-500/50'   },
};

export default function ColregsDrill() {
  const [drillState, setDrillState] = useState<DrillState>('idle');
  const [menuStep, setMenuStep] = useState<'category' | 'mode'>('category');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const [deck, setDeck] = useState<ColregsQuestion[]>([]);
  const [deckTotal, setDeckTotal] = useState(0);
  const [current, setCurrent] = useState<ColregsQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [drillMode, setDrillMode] = useState<DrillMode>('practice');
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(EXAM_QUESTION_MS);

  const advanceRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const timedOutRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (advanceRef.current) clearTimeout(advanceRef.current);
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
  }, []);

  // --- Deck helpers ---

  const pickNext = useCallback((remainingDeck: ColregsQuestion[], mode: DrillMode): ColregsQuestion | null => {
    if (mode === 'exam') return remainingDeck.length > 0 ? remainingDeck[remainingDeck.length - 1] : null;
    const pool = getPool(categoryFilter);
    return pool[Math.floor(Math.random() * pool.length)];
  }, [categoryFilter]);

  // --- Advance to next question ---

  const advance = useCallback((currentDeck: ColregsQuestion[], mode: DrillMode) => {
    timedOutRef.current = false;
    setSelectedAnswer(null);

    if (mode === 'exam') {
      const next = [...currentDeck];
      next.pop();
      if (next.length === 0) {
        setDrillState('finished');
        setDeck([]);
        return;
      }
      setDeck(next);
      setCurrent(next[next.length - 1]);
      setTimeLeft(EXAM_QUESTION_MS);
    } else {
      const pool = getPool(categoryFilter);
      const next = pool[Math.floor(Math.random() * pool.length)];
      setCurrent(next);
    }
  }, [categoryFilter]);

  // --- Answer selection ---

  const handleSelect = useCallback((answer: string) => {
    if (selectedAnswer !== null) return;

    const isCorrect = answer === current?.correctAnswer;
    setSelectedAnswer(answer);
    setAnswered(prev => prev + 1);
    if (isCorrect) setScore(prev => prev + 1);

    clearTimers();

    advanceRef.current = window.setTimeout(() => {
      advance(deck, drillMode);
    }, isCorrect ? 1200 : 2000);
  }, [selectedAnswer, current, deck, drillMode, advance, clearTimers]);

  // --- Exam timer ---

  useEffect(() => {
    if (drillState !== 'playing' || drillMode !== 'exam') return;

    let last = performance.now();
    const loop = (now: number) => {
      const delta = now - last;
      last = now;
      setTimeLeft(prev => {
        const next = prev - delta;
        if (next <= 0 && !timedOutRef.current) {
          timedOutRef.current = true;
          setAnswered(a => a + 1);
          advanceRef.current = window.setTimeout(() => {
            advance(deck, drillMode);
          }, 1200);
          return 0;
        }
        return Math.max(0, next);
      });
      timerRef.current = requestAnimationFrame(loop);
    };
    timerRef.current = requestAnimationFrame(loop);
    return () => { if (timerRef.current) cancelAnimationFrame(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drillState, drillMode, current?.id]);

  // Cleanup
  useEffect(() => () => clearTimers(), [clearTimers]);

  // --- Start ---

  const startDrill = (mode: DrillMode) => {
    clearTimers();
    const pool = shuffle(getPool(categoryFilter));
    setDrillMode(mode);
    setScore(0);
    setAnswered(0);
    setSelectedAnswer(null);
    setTimeLeft(EXAM_QUESTION_MS);
    timedOutRef.current = false;

    if (mode === 'exam') {
      setDeck(pool);
      setDeckTotal(pool.length);
      setCurrent(pool[pool.length - 1]);
    } else {
      setDeck([]);
      setDeckTotal(0);
      setCurrent(pool[0]);
    }
    setDrillState('playing');
  };

  const resetToMenu = () => {
    clearTimers();
    setDrillState('idle');
    setMenuStep('category');
    setCurrent(null);
    setSelectedAnswer(null);
  };

  const handleFinish = () => {
    setBestScore(prev => Math.max(prev, score));
    setDrillState('finished');
    clearTimers();
  };

  // Sync finished state when exam deck empties
  useEffect(() => {
    if (drillState === 'finished') {
      setBestScore(prev => Math.max(prev, score));
    }
  }, [drillState, score]);

  // --- Visual aids ---

  const activeLights = current ? (QUESTION_LIGHTS[current.id] ?? null) : null;
  const activeScenario = current ? (QUESTION_SCENARIOS[current.id] ?? null) : null;
  const hasVisual = activeLights !== null || activeScenario !== null;

  const timerSeconds = Math.ceil(timeLeft / 1000);
  const timerWarning = timerSeconds <= 5;

  // ── RENDER ──

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden relative selection:bg-cyan-500/30 font-sans">

      {/* Background ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-900/10 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-900/10 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
      </div>

      {/* ── IDLE ── */}
      {drillState === 'idle' && (
        <div className="z-10 w-full max-w-lg flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-500">

          {menuStep === 'category' && (
            <>
              <div className="text-center">
                <div className="inline-block px-3 py-1 bg-cyan-950/50 border border-cyan-800 rounded-full text-[10px] uppercase tracking-[0.2em] text-cyan-400 mb-4">
                  COLREGS Drill
                </div>
                <h2 className="text-4xl font-bold text-white tracking-tighter mb-2">
                  Collision Regulations
                </h2>
                <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
                  Choose a category to study, or test across all topics.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 w-full">
                {CATEGORY_ORDER.map((cat) => {
                  const meta = CATEGORY_META[cat];
                  const ac = ACCENT_CLASSES[meta.accent];
                  return (
                    <button
                      key={cat}
                      onClick={() => { setCategoryFilter(cat); setMenuStep('mode'); }}
                      className={`group flex items-center gap-4 px-5 py-4 rounded-2xl border ${ac.border} bg-slate-800/40 hover:bg-slate-800/80 ${ac.hover} transition-all text-left backdrop-blur-sm`}
                    >
                      <div className={`bg-gradient-to-br ${ac.bg} p-3 rounded-xl ${ac.text} border ${ac.border} group-hover:scale-105 transition-transform`}>
                        <BookOpen size={22} />
                      </div>
                      <div>
                        <span className={`block font-bold text-base text-white group-hover:${ac.text} transition-colors`}>{meta.label}</span>
                        <span className="text-xs text-slate-500">{meta.sub}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {menuStep === 'mode' && (
            <>
              <div className="relative w-full flex items-center justify-center">
                <button
                  onClick={() => setMenuStep('category')}
                  className="absolute left-0 p-2 text-slate-500 hover:text-white transition-colors hover:bg-slate-800 rounded-full"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className={`text-2xl font-bold tracking-tight ${ACCENT_CLASSES[CATEGORY_META[categoryFilter].accent].text}`}>
                  {CATEGORY_META[categoryFilter].label}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 w-full max-w-xs mx-auto">
                <button
                  onClick={() => startDrill('practice')}
                  className="group flex flex-col items-center gap-2 px-6 py-5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 hover:border-cyan-500/50 transition-all"
                >
                  <span className="font-bold text-lg text-white group-hover:text-cyan-400">Practice Mode</span>
                  <span className="text-xs text-slate-500">Unlimited questions. No timer.</span>
                </button>

                <button
                  onClick={() => startDrill('exam')}
                  className="group flex items-center gap-4 px-6 py-5 rounded-xl border border-yellow-900/30 bg-slate-800/80 hover:bg-yellow-950/30 hover:border-yellow-500/40 transition-all"
                >
                  <div className="bg-yellow-500/10 p-3 rounded-lg text-yellow-500 group-hover:bg-yellow-500 group-hover:text-white transition-colors shrink-0">
                    <Medal size={22} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white group-hover:text-yellow-400">Exam Mode</div>
                    <div className="text-xs text-slate-400">All questions. 15s each. One pass.</div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── PLAYING ── */}
      {drillState === 'playing' && current && (
        <div className="z-10 w-full max-w-5xl animate-in fade-in slide-in-from-right-8 duration-500">

          {/* Stats bar */}
          <div className="flex justify-between items-end text-slate-400 font-mono border-b border-slate-800 pb-3 mb-6 relative">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest opacity-60">Score</span>
              <span className="text-3xl font-bold text-cyan-400 leading-none">{score}</span>
            </div>

            {drillMode === 'exam' && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-3 flex flex-col items-center">
                <Timer className="w-4 h-4 mb-1 opacity-50" />
                <span className={`text-3xl font-bold leading-none transition-colors ${timerWarning ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
                  {timerSeconds}s
                </span>
              </div>
            )}

            <div className="flex items-center gap-4">
              {drillMode === 'exam' && (
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-widest opacity-60">Progress</span>
                  <span className="text-xl font-bold text-slate-300 leading-none">
                    {deckTotal - deck.length + 1}/{deckTotal}
                  </span>
                </div>
              )}
              {drillMode === 'practice' && (
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-widest opacity-60">Answered</span>
                  <span className="text-xl font-bold text-slate-300 leading-none">{answered}</span>
                </div>
              )}
              <button
                onClick={handleFinish}
                className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-red-500 hover:text-red-400 opacity-60 hover:opacity-100 transition-all"
              >
                <XCircle size={14} /> Quit
              </button>
            </div>
          </div>

          {/* Question area */}
          <div className={`flex flex-col ${hasVisual ? 'md:flex-row' : ''} items-start gap-8`}>

            {/* Visual aid */}
            {hasVisual && (
              <div className="w-full md:w-64 shrink-0 flex items-center justify-center">
                {activeLights && (
                  <LightDisplay active={activeLights} label="Vessel Lights" />
                )}
                {activeScenario && !activeLights && (
                  <VesselScenario scenario={activeScenario} label="Scenario" />
                )}
              </div>
            )}

            {/* Card */}
            <div className={`flex-1 w-full ${!hasVisual ? 'max-w-lg mx-auto' : ''}`}>
              <ScenarioCard
                key={current.id}
                question={current}
                selectedAnswer={selectedAnswer}
                onSelect={handleSelect}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── FINISHED ── */}
      {drillState === 'finished' && (
        <div className="z-10 w-full max-w-sm animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-slate-900/80 p-8 rounded-2xl border border-slate-800 backdrop-blur-xl text-center space-y-6">
            <div>
              <div className="text-slate-400 text-sm uppercase tracking-widest mb-1">
                {drillMode === 'exam' ? 'Exam Complete' : 'Session Ended'}
              </div>
              <div className="text-6xl font-bold text-white mb-1">{score}</div>
              <div className="text-cyan-400 text-sm">
                {drillMode === 'exam' ? `Correct out of ${deckTotal}` : `of ${answered} answered`}
              </div>
              {bestScore > 0 && (
                <div className="text-slate-500 text-xs mt-2">Best: {bestScore}</div>
              )}
            </div>

            <div className="h-px w-full bg-slate-800" />

            <button
              onClick={() => startDrill(drillMode)}
              className="w-full py-3 bg-white text-slate-900 hover:bg-cyan-50 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Play size={18} />
              Try Again
            </button>

            <button
              onClick={resetToMenu}
              className="text-xs text-slate-500 hover:text-slate-300 underline block w-full py-2"
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
