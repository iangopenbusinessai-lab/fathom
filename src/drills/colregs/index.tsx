import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Play, Timer, Medal, XCircle, BookOpen } from 'lucide-react';
import {
  COLREGS_QUESTIONS,
  COLREGS_QUESTIONS_BY_CATEGORY,
  CATEGORY_LABELS,
  ColregsCategory,
  ColregsQuestion,
} from './constants';
import { bestScoreKey, readBestScore, writeBestScore } from '../../lib/storage';
import { shuffle } from '../../lib/shuffle';
import { ScenarioCard } from './components/ScenarioCard';
import { VesselProfile, VesselTypeName } from './components/VesselProfile';
import { LightDisplay, LightName } from './components/LightDisplay';
import { VesselScenario, ScenarioType } from './components/VesselScenario';
import { SoundSignalDisplay, BlastMark } from './components/SoundSignalDisplay';
import {
  DayShapeDisplay,
  DayShapeName,
  MastPosition,
  ShapeArrangement,
} from './components/DayShapeDisplay';

type DrillState = 'idle' | 'playing' | 'finished';
type DrillMode = 'practice' | 'exam';
type CategoryFilter = ColregsCategory | 'all';

const EXAM_QUESTION_MS = 15000;

export const QUESTION_LIGHTS: Partial<Record<string, LightName[]>> = {
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
  // Rule 25(a): sailing vessel underway - sidelights and sternlight, no masthead.
  'nl-11': ['port', 'starboard', 'stern'],
  // Rule 23(d)(i): power-driven under 12 m - all-round white plus sidelights.
  'nl-12': ['allRoundWhite', 'port', 'starboard'],
  // Rule 25(b): tricolour lantern - an observer sees these same three sectors.
  'nl-13': ['port', 'starboard', 'stern'],
  // Rule 26(b)(i): trawling - green over white, plus sidelights and sternlight.
  'nl-14': ['allRoundGreen1', 'allRoundWhite2', 'port', 'starboard', 'stern'],
  // Rule 26(c)(i): fishing other than trawling - red over white.
  'nl-15': ['allRoundRed1', 'allRoundWhite2'],
  // Rule 27(b)(i): RAM - red, white, red in a vertical line.
  'nl-16': ['allRoundRed1', 'allRoundWhite2', 'allRoundRed3'],
  // Rule 24(a)(iv): towing - yellow towing light above the sternlight.
  'nl-17': ['masthead', 'port', 'starboard', 'stern', 'allRoundYellow'],
  // Rule 30(a): at anchor, 50 m or more - forward light and a lower one aft.
  'nl-18': ['anchor', 'allRoundWhite'],
  // Rule 23(b): air-cushion in non-displacement mode - all-round flashing yellow.
  'nl-19': ['masthead', 'port', 'starboard', 'stern', 'allRoundYellow'],
  // Rule 21(b): the sidelight arcs themselves are the question.
  'nl-20': ['port', 'starboard'],
};

export interface DayShapeSpec {
  shapes: DayShapeName[];
  position: MastPosition;
  arrangement?: ShapeArrangement;
}

// Shapes listed top-down (first entry is the uppermost shape).
export const QUESTION_SHAPES: Partial<Record<string, DayShapeSpec>> = {
  // Rule 30(a): at anchor — one ball in the forepart.
  'ds-01': { shapes: ['ball'], position: 'forward' },
  // Rule 27(a): not under command — two balls in a vertical line.
  'ds-02': { shapes: ['ball', 'ball'], position: 'main' },
  // Rule 25(e): sail + machinery — one cone, apex downwards, forward.
  'ds-03': { shapes: ['cone-down'], position: 'forward' },
  // Rule 24(a)(v): tow exceeding 200 m — one diamond.
  'ds-04': { shapes: ['diamond'], position: 'main' },
  // Rule 27(b): restricted in ability to manoeuvre — ball, diamond, ball.
  'ds-05': { shapes: ['ball', 'diamond', 'ball'], position: 'main' },
  // Rule 28: constrained by draft — one cylinder.
  'ds-06': { shapes: ['cylinder'], position: 'main' },
  // Rule 30(d): aground — three balls in a vertical line.
  'ds-07': { shapes: ['ball', 'ball', 'ball'], position: 'forward' },
  // Rule 27(f): minesweeping — one ball at the foremast head and one at each
  // end of the fore yardarm.
  'ds-08': { shapes: ['ball', 'ball', 'ball'], position: 'forward', arrangement: 'yardarm' },
  // Rule 26(b)(i): fishing - two cones, apexes together.
  'ds-09': { shapes: ['cone-down', 'cone-up'], position: 'main' },
  // Rule 26(c)(ii): gear extending over 150 m - a cone apex up toward the gear.
  'ds-10': { shapes: ['cone-up'], position: 'forward' },
  // Rule 24(e)(iii): the vessel being towed, tow over 200 m - one diamond.
  'ds-11': { shapes: ['diamond'], position: 'main' },
  // Rule 30(g): the anchor ball a small vessel need not exhibit.
  'ds-12': { shapes: ['ball'], position: 'forward' },
  // Rule 30(f): the three balls a vessel under 12 m aground need not exhibit.
  'ds-13': { shapes: ['ball', 'ball', 'ball'], position: 'forward' },
  // Rule 30(a)(i): the anchor ball, shown in the fore part.
  'ds-14': { shapes: ['ball'], position: 'forward' },
  // Rule 25: under sail alone - a bare mast, no shape at all.
  'ds-15': { shapes: [], position: 'main' },
  // Annex I s6: the ball whose minimum dimensions are in question.
  'ds-16': { shapes: ['ball'], position: 'main' },
};

// Blast sequences in order, left to right.
export const QUESTION_SOUNDS: Partial<Record<string, BlastMark[]>> = {
  // Rule 34(a): "I am altering my course to starboard."
  'ss-01': ['short'],
  // Rule 34(a): "I am altering my course to port."
  'ss-02': ['short', 'short'],
  // Rule 34(a): "I am operating astern propulsion."
  'ss-03': ['short', 'short', 'short'],
  // Rule 35(a): power-driven, making way in restricted visibility.
  'ss-04': ['prolonged'],
  // Rule 35(b): power-driven, underway but stopped.
  'ss-05': ['prolonged', 'prolonged'],
  // Rule 35(c): NUC / RAM / constrained by draft / sailing / fishing / towing.
  'ss-06': ['prolonged', 'short', 'short'],
  // Rule 32(b): the definition of a short blast - one is shown for reference.
  'ss-07': ['short'],
  // Rule 35(g): at anchor - rapid ringing of the bell for about 5 seconds.
  'ss-08': ['bell'],
  // Rule 34(d): the doubt signal - at least five short and rapid blasts.
  'ss-09': ['short', 'short', 'short', 'short', 'short'],
  // Rule 34(e): nearing a bend - one prolonged blast.
  'ss-10': ['prolonged'],
  // Rule 34(c)(i): "I intend to overtake you on your starboard side."
  'ss-11': ['prolonged', 'prolonged', 'short'],
  // Rule 34(c)(i): "I intend to overtake you on your port side."
  'ss-12': ['prolonged', 'prolonged', 'short', 'short'],
  // Rule 34(c)(ii): agreement by the vessel about to be overtaken.
  'ss-13': ['prolonged', 'short', 'prolonged', 'short'],
  // Rule 35(g): at anchor, warning an approaching vessel.
  'ss-14': ['short', 'prolonged', 'short'],
  // Rule 35(h): aground - the bell signal, with three strokes either side.
  'ss-15': ['bell'],
  // Rule 32(c): one prolonged blast shown for reference.
  'ss-16': ['prolonged'],
};

// Gap between blasts, in seconds, for signals whose rule states its own
// interval. Anything absent here uses SoundSignalDisplay's default 1s gap.
export const QUESTION_SOUND_GAPS: Partial<Record<string, number>> = {
  // Rule 35(b): "two prolonged blasts in succession, with an interval of
  // about 2 seconds between them."
  'ss-05': 2,
};

// Vessel shown for the type-identification questions. No text in the diagram
// names the type - the day shapes and rig are the whole question.
export const QUESTION_VESSEL_TYPES: Partial<Record<string, VesselTypeName>> = {
  'vt-01': 'nuc',
  'vt-02': 'ram',
  'vt-03': 'cbd',
  'vt-04': 'fishing',
  'vt-05': 'sailing',
  'vt-06': 'towing',
};

export const QUESTION_SCENARIOS: Partial<Record<string, ScenarioType>> = {
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
  'vh-11': 'sail-vs-sail',
  'vh-12': 'sail-vs-sail',
  'vh-13': 'being-overtaken',
  'vh-14': 'narrow-channel',
  'vh-15': 'narrow-channel',
  'vh-16': 'narrow-channel',
  'vh-17': 'priority-nuc',
  // vh-18 (restricted visibility), vh-19 (seaplanes) and vh-20 (risk of
  // collision) have no scenario: none of the diagrams depicts them, and
  // borrowing one would attach a caption that contradicts the question.
};

// The bank lists the correct answer first in 73% of its 78 questions (option
// D is correct exactly once in the whole bank), so drilling in source order
// can be beaten by always pressing the first button. Settling a presentation
// order per drawn question fixes that without touching the content, and it is
// settled once per draw rather than per render so the options cannot reorder
// underneath the pointer. Everything downstream compares option TEXT, never an
// index, so the reorder cannot desync from the answer.
export function presentationOrder(question: ColregsQuestion): string[] {
  return shuffle(question.options);
}

function getPool(filter: CategoryFilter): ColregsQuestion[] {
  return filter === 'all' ? COLREGS_QUESTIONS : COLREGS_QUESTIONS_BY_CATEGORY[filter];
}

// Practice draws with replacement, so without this the same question can come
// up twice running. Excluding the one just answered fixes that; falling back to
// the unfiltered pool keeps a one-question category from having nothing to draw.
export function pickExcluding(pool: ColregsQuestion[], excludeId: string | null): ColregsQuestion {
  const candidates = excludeId === null ? pool : pool.filter(q => q.id !== excludeId);
  const from = candidates.length > 0 ? candidates : pool;
  return from[Math.floor(Math.random() * from.length)];
}

const CATEGORY_ORDER: CategoryFilter[] = [
  'all',
  'navigation-lights',
  'sound-signals',
  'vessel-hierarchy',
  'day-shapes',
  'vessel-types',
];

// `sub` is the descriptor only - the question count is prepended at render
// time from the pool itself, so adding questions cannot leave a stale number.
const CATEGORY_META: Record<CategoryFilter, { label: string; sub: string; accent: string }> = {
  'all':               { label: 'All COLREGS',        sub: 'across all topics',        accent: 'cyan'   },
  'navigation-lights': { label: 'Navigation Lights',  sub: 'lights & arcs',            accent: 'amber'  },
  'sound-signals':     { label: 'Sound Signals',      sub: 'blasts & fog signals',     accent: 'green'  },
  'vessel-hierarchy':  { label: 'Vessel Hierarchy',   sub: 'give-way rules',           accent: 'indigo' },
  'day-shapes':        { label: 'Day Shapes',         sub: 'shapes & marks',           accent: 'rose'   },
  'vessel-types':      { label: 'Vessel Types',       sub: 'identify by shape & rig',  accent: 'violet' },
};

const ACCENT_CLASSES: Record<string, { border: string; bg: string; text: string; hover: string }> = {
  cyan:   { border: 'border-cyan-900/40',   bg: 'from-cyan-500/15 to-cyan-900/15',   text: 'text-cyan-400',   hover: 'hover:border-cyan-500/50'   },
  amber:  { border: 'border-amber-900/40',  bg: 'from-amber-500/15 to-amber-900/15', text: 'text-amber-400',  hover: 'hover:border-amber-500/50'  },
  green:  { border: 'border-green-900/40',  bg: 'from-green-500/15 to-green-900/15', text: 'text-green-400',  hover: 'hover:border-green-500/50'  },
  indigo: { border: 'border-indigo-900/40', bg: 'from-indigo-500/15 to-indigo-900/15',text: 'text-indigo-400',hover: 'hover:border-indigo-500/50' },
  rose:   { border: 'border-rose-900/40',   bg: 'from-rose-500/15 to-rose-900/15',   text: 'text-rose-400',   hover: 'hover:border-rose-500/50'   },
  violet: { border: 'border-violet-900/40', bg: 'from-violet-500/15 to-violet-900/15',text: 'text-violet-400',hover: 'hover:border-violet-500/50' },
};

export default function ColregsDrill() {
  const [drillState, setDrillState] = useState<DrillState>('idle');
  const [menuStep, setMenuStep] = useState<'category' | 'mode'>('category');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const [deck, setDeck] = useState<ColregsQuestion[]>([]);
  const [deckTotal, setDeckTotal] = useState(0);
  const [current, setCurrent] = useState<ColregsQuestion | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [drillMode, setDrillMode] = useState<DrillMode>('practice');
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  // Bests are kept per category+mode: an 8-question Day Shapes exam and a
  // 36-question All-COLREGS exam are not comparable, so they get their own
  // keys rather than overwriting one shared number.
  const bestKey = bestScoreKey('colregs', categoryFilter, drillMode);
  const [bestScore, setBestScore] = useState(() => readBestScore(bestKey));

  const [timeLeft, setTimeLeft] = useState(EXAM_QUESTION_MS);

  const advanceRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const timedOutRef = useRef(false);

  // Every draw goes through here, so a question can never reach the screen
  // with the previous question's option order still on it.
  const showQuestion = useCallback((question: ColregsQuestion) => {
    setCurrent(question);
    setOptions(presentationOrder(question));
  }, []);

  const clearTimers = useCallback(() => {
    if (advanceRef.current) clearTimeout(advanceRef.current);
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
  }, []);

  // Lets advance exclude the outgoing question without taking `current` as a
  // dependency, which would re-create it and restart the exam timer effect.
  const currentIdRef = useRef<string | null>(null);
  useEffect(() => { currentIdRef.current = current?.id ?? null; }, [current]);

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
      showQuestion(next[next.length - 1]);
      setTimeLeft(EXAM_QUESTION_MS);
    } else {
      showQuestion(pickExcluding(getPool(categoryFilter), currentIdRef.current));
    }
  }, [categoryFilter, showQuestion]);

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
      showQuestion(pool[pool.length - 1]);
    } else {
      setDeck([]);
      setDeckTotal(0);
      showQuestion(pool[0]);
    }
    setDrillState('playing');
  };

  const resetToMenu = () => {
    clearTimers();
    setDrillState('idle');
    setMenuStep('category');
    setCurrent(null);
    setOptions([]);
    setSelectedAnswer(null);
  };

  // Swap in the stored best whenever the category+mode pair changes, so the
  // figure on screen always belongs to the combination being played.
  useEffect(() => {
    setBestScore(readBestScore(bestKey));
  }, [bestKey]);

  // Persist on the spot when a run beats the stored best. Writing here rather
  // than from an effect on bestScore keeps the value and the key it is written
  // under from ever drifting apart when the category or mode changes.
  const recordBest = (value: number) => {
    if (value <= bestScore) return;
    setBestScore(value);
    writeBestScore(bestKey, value);
  };

  const handleFinish = () => {
    recordBest(score);
    setDrillState('finished');
    clearTimers();
  };

  // Sync finished state when exam deck empties
  useEffect(() => {
    if (drillState === 'finished') {
      recordBest(score);
    }
  }, [drillState, score]);

  // --- Visual aids ---

  const activeLights = current ? (QUESTION_LIGHTS[current.id] ?? null) : null;
  const activeScenario = current ? (QUESTION_SCENARIOS[current.id] ?? null) : null;
  const activeShapes = current ? (QUESTION_SHAPES[current.id] ?? null) : null;
  const activeSounds = current ? (QUESTION_SOUNDS[current.id] ?? null) : null;
  const activeVesselType = current ? (QUESTION_VESSEL_TYPES[current.id] ?? null) : null;
  const hasVisual =
    activeLights !== null ||
    activeScenario !== null ||
    activeShapes !== null ||
    activeSounds !== null ||
    activeVesselType !== null;

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
                        <span className="text-xs text-slate-500">
                          {getPool(cat).length} questions — {meta.sub}
                        </span>
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
                {activeVesselType && (
                  <VesselProfile type={activeVesselType} label="Vessel" />
                )}
                {activeLights && !activeVesselType && (
                  <LightDisplay active={activeLights} label="Vessel Lights" />
                )}
                {activeSounds && !activeLights && !activeVesselType && (
                  <SoundSignalDisplay
                    key={current.id}
                    sequence={activeSounds}
                    gapS={QUESTION_SOUND_GAPS[current.id]}
                    label="Blast Sequence"
                  />
                )}
                {activeShapes && !activeLights && !activeSounds && !activeVesselType && (
                  <DayShapeDisplay
                    shapes={activeShapes.shapes}
                    position={activeShapes.position}
                    arrangement={activeShapes.arrangement}
                    label="Day Shapes"
                  />
                )}
                {activeScenario && !activeLights && !activeShapes && !activeSounds && !activeVesselType && (
                  <VesselScenario
                    scenario={activeScenario}
                    label="Scenario"
                    revealed={selectedAnswer !== null}
                  />
                )}
              </div>
            )}

            {/* Card */}
            <div className={`flex-1 w-full ${!hasVisual ? 'max-w-lg mx-auto' : ''}`}>
              <ScenarioCard
                key={current.id}
                question={current}
                options={options}
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
