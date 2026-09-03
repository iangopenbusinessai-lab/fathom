import React, { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
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
import { VisualPanel, hasVisual } from '../../components/VisualPanel';
import { DISPLAY, MONO } from '../../lib/theme';
import { usePrefs } from '../../lib/prefs';
import { readProgress, recordAnswer } from '../../lib/progress';
import { PASS_MARK, categoryBySource } from '../../lib/syllabus';
import {
  DEFAULT_PLAN,
  SessionPlan,
  isDefaultPlan,
  planQueue,
  timerLabel,
} from '../../lib/session';
import { DrillProps } from '../../types';
// Only the types are needed here: the visuals themselves are drawn by the
// shared VisualPanel, which reads the same question-to-diagram maps below.
import { VesselTypeName } from './components/VesselProfile';
import { LightName } from './components/LightDisplay';
import { ScenarioType } from './components/VesselScenario';
import { BlastMark } from './components/SoundSignalDisplay';
import { DayShapeName, MastPosition, ShapeArrangement } from './components/DayShapeDisplay';
import { AnchorTypeName } from './components/AnchorDisplay';
import { BuoyName } from './components/BuoyDisplay';
import { DistressSignalName } from './components/DistressDisplay';

type DrillState = 'idle' | 'playing' | 'finished';
type DrillMode = 'practice' | 'exam';
type CategoryFilter = ColregsCategory | 'all';

// Exam mode's own clock, unchanged and not overridable: a plan's timer sets up
// a timed practice run instead, which is a different thing from sitting the
// exam.
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

// Anchor shown for the five identification questions. Same contract as the
// vessel profiles: the silhouette is the whole question, so nothing in the
// diagram names the type.
//
// The bottom-matching questions (an-06 onward) deliberately have no diagram.
// They ask which anchor suits a given bottom, and drawing one anchor beside
// that prompt would either give the answer away or illustrate a wrong one.
export const QUESTION_ANCHORS: Partial<Record<string, AnchorTypeName>> = {
  'an-01': 'fluke',
  'an-02': 'plow',
  'an-03': 'claw',
  'an-04': 'grapnel',
  'an-05': 'mushroom',
};

// The mark shown for the identification questions. Same contract as the
// anchors and the vessel profiles: the picture is the whole question, so
// nothing in it names the type.
//
// The questions about what a mark MEANS rather than what it looks like - the
// direction "red right returning" applies in, which side of a cardinal the
// safe water is on, what the two regions share - have no diagram on purpose.
// A picture of one mark beside a question about the system would illustrate an
// answer that is not being asked for.
export const QUESTION_BUOYS: Partial<Record<string, BuoyName>> = {
  'by-01': 'port-hand',
  'by-02': 'starboard-hand',
  'by-04': 'cardinal-north',
  'by-05': 'cardinal-south',
  'by-06': 'cardinal-east',
  'by-07': 'cardinal-west',
  'by-09': 'isolated-danger',
  'by-11': 'safe-water',
  'by-12': 'special',
  'by-14': 'icw-triangle',
  'by-15': 'icw-square',
};

// The distress signal shown for the eight that have a visual form. The rest of
// Annex IV cannot be drawn - a gun fired at one-minute intervals, SOS by any
// signalling method, a spoken Mayday, an EPIRB alert - and those are asked as
// text questions instead.
//
// di-16 asks which signal is NOT on the list and di-09 asks for the interval a
// gun is fired at: both are deliberately without a picture, the first because
// it is about four signals at once and the second because the answer is a
// duration. Neither is an oversight.
export const QUESTION_DISTRESS: Partial<Record<string, DistressSignalName>> = {
  'di-01': 'parachute-flare',
  'di-02': 'hand-flare',
  'di-03': 'orange-smoke',
  'di-04': 'star-rocket',
  'di-05': 'flag-nc',
  'di-06': 'flag-and-ball',
  'di-07': 'arms',
  'di-08': 'flames',
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

// The one place a run's questions are chosen. With the default plan this is
// just `shuffle(pool)` - which is exactly what startDrill did before plans
// existed - so an unplanned run draws from the same deck it always did.
function buildQueue(filter: CategoryFilter, plan: SessionPlan): ColregsQuestion[] {
  return planQueue(getPool(filter), (q) => q.id, plan, readProgress());
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
  'anchor-types',
  'buoyage',
  'chart-symbols',
  'distress-signals',
  'vhf-procedure',
];

// `sub` is the descriptor only - the question count is prepended at render
// time from the pool itself, so adding questions cannot leave a stale number.
const CATEGORY_META: Record<CategoryFilter, { label: string; sub: string }> = {
  'all':               { label: 'All rules of the road', sub: 'across every topic'       },
  'navigation-lights': { label: 'Navigation lights',     sub: 'lights and arcs'          },
  'sound-signals':     { label: 'Sound signals',         sub: 'blasts and fog signals'   },
  'vessel-hierarchy':  { label: 'Vessel hierarchy',      sub: 'give-way rules'           },
  'day-shapes':        { label: 'Day shapes',            sub: 'shapes and marks'         },
  'vessel-types':      { label: 'Vessel types',          sub: 'identify by shape and rig' },
  'anchor-types':      { label: 'Anchor types',          sub: 'ground tackle and holding' },
  'buoyage':           { label: 'Buoyage',                sub: 'IALA marks and the ICW'   },
  'chart-symbols':     { label: 'Chart symbols',          sub: 'symbols and abbreviations' },
  'distress-signals':  { label: 'Distress signals',       sub: 'the Annex IV list'        },
  'vhf-procedure':     { label: 'VHF procedure',          sub: 'priority calls on 16'     },
};

// The syllabus card a question belongs to, so its answer lands on the right
// mastery bar. Read from the question rather than from the run's filter, so a
// mixed run credits each card it actually drew from.
function progressIdFor(question: ColregsQuestion): string | null {
  return categoryBySource(question.category)?.id ?? null;
}

const metaRow: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 10.5,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--ct-muted)',
};

function isCategoryFilter(value: string | undefined): value is CategoryFilter {
  return value !== undefined && (CATEGORY_ORDER as string[]).includes(value);
}

export default function ColregsDrill({ focus, start, onExit }: DrillProps) {
  const { prefs } = usePrefs();

  // A hub card names the category it is for, so the drill opens on that
  // category's mode picker. Opened without one, it starts at its own category
  // list exactly as before.
  const focused = isCategoryFilter(focus) ? focus : null;

  const [drillState, setDrillState] = useState<DrillState>('idle');
  const [menuStep, setMenuStep] = useState<'category' | 'mode'>(
    focused ? 'mode' : 'category'
  );
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(focused ?? 'all');

  // The plan the current run was built from. Kept so "Drill it again" repeats
  // the same exercise rather than quietly reverting to the standard one.
  const [plan, setPlan] = useState<SessionPlan>(start?.plan ?? DEFAULT_PLAN);
  // A deck run walks a fixed queue and ends; the alternative is practice's
  // endless draw. An exam is always a deck; a practice run becomes one as soon
  // as a plan shapes it.
  const [deckRun, setDeckRun] = useState(false);
  // Per-question clock for this run, or null for untimed. Exam mode always
  // sets EXAM_QUESTION_MS here; a planned practice run sets its own.
  const [questionMs, setQuestionMs] = useState<number | null>(null);

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

  // advance() runs from a timeout and needs the run's clock without taking a
  // dependency that would re-create it mid-question.
  const questionMsRef = useRef<number | null>(null);

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

  const advance = useCallback((currentDeck: ColregsQuestion[], usesDeck: boolean) => {
    timedOutRef.current = false;
    setSelectedAnswer(null);

    if (usesDeck) {
      const next = [...currentDeck];
      next.pop();
      if (next.length === 0) {
        setDrillState('finished');
        setDeck([]);
        return;
      }
      setDeck(next);
      showQuestion(next[next.length - 1]);
    } else {
      showQuestion(pickExcluding(getPool(categoryFilter), currentIdRef.current));
    }

    if (questionMsRef.current !== null) setTimeLeft(questionMsRef.current);
  }, [categoryFilter, showQuestion]);

  // --- Answer selection ---

  const handleSelect = useCallback((answer: string) => {
    if (selectedAnswer !== null) return;

    const isCorrect = answer === current?.correctAnswer;
    setSelectedAnswer(answer);
    setAnswered(prev => prev + 1);
    if (isCorrect) setScore(prev => prev + 1);

    // Recorded against the syllabus card this run belongs to, which is what
    // fills the mastery bars on the hub. Storage is best-effort, so a failure
    // here cannot interrupt the run.
    const progressId = current ? progressIdFor(current) : null;
    if (progressId && current) recordAnswer(progressId, isCorrect, current.id);

    if (!isCorrect && prefs.haptics && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(60);
      } catch {
        // Vibration is a nicety and is refused outright on some platforms.
      }
    }

    clearTimers();

    advanceRef.current = window.setTimeout(() => {
      advance(deck, deckRun);
    }, isCorrect ? 1200 : 2000);
  }, [selectedAnswer, current, deck, deckRun, advance, clearTimers, prefs.haptics]);

  // --- Exam timer ---

  useEffect(() => {
    // Untimed runs never start the loop at all, which is what an unplanned
    // practice run is.
    if (drillState !== 'playing' || questionMs === null) return;

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
            advance(deck, deckRun);
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
  }, [drillState, questionMs, current?.id]);

  // Cleanup
  useEffect(() => () => clearTimers(), [clearTimers]);

  // --- Start ---

  const startDrill = (mode: DrillMode, runPlan: SessionPlan = plan) => {
    clearTimers();
    const queue = buildQueue(categoryFilter, runPlan);
    if (queue.length === 0) return;

    // Exam mode keeps its own fixed clock; only a practice run takes the
    // plan's. An exam is always a deck, and a practice run becomes one the
    // moment the plan shapes it - untouched, it draws without end as before.
    const perQuestion = mode === 'exam' ? EXAM_QUESTION_MS : runPlan.perQuestionMs;
    const usesDeck = mode === 'exam' || !isDefaultPlan(runPlan);

    setPlan(runPlan);
    setDrillMode(mode);
    setDeckRun(usesDeck);
    setQuestionMs(perQuestion);
    questionMsRef.current = perQuestion;
    setScore(0);
    setAnswered(0);
    setSelectedAnswer(null);
    setTimeLeft(perQuestion ?? EXAM_QUESTION_MS);
    timedOutRef.current = false;

    if (usesDeck) {
      setDeck(queue);
      setDeckTotal(queue.length);
      showQuestion(queue[queue.length - 1]);
    } else {
      setDeck([]);
      setDeckTotal(0);
      showQuestion(queue[0]);
    }
    setDrillState('playing');
  };

  // Launched from a category screen: go straight into the run it configured.
  // A layout effect rather than a plain one, so the drill's own menu never
  // paints for a frame first.
  const plannedStartRef = useRef(false);
  useLayoutEffect(() => {
    if (!start || plannedStartRef.current) return;
    plannedStartRef.current = true;
    startDrill(start.mode === 'exam' ? 'exam' : 'practice', start.plan);
  // startDrill is re-created every render; the ref is what makes this run once.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start]);

  const resetToMenu = () => {
    clearTimers();
    // Launched from a category screen, that screen is the way back - it is
    // where the exercise was set up.
    if (onExit) {
      onExit();
      return;
    }
    setDrillState('idle');
    setMenuStep(focused ? 'mode' : 'category');
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

  // --- Visual aid ---

  // The diagram itself is drawn by the shared VisualPanel, off the same maps
  // declared above; this only asks whether there is one.
  const showPanel = current ? hasVisual(current.id) : false;

  const timerSeconds = Math.ceil(timeLeft / 1000);
  const timerWarning = timerSeconds <= 5;
  const pool = getPool(categoryFilter);

  // ── RENDER ──

  if (drillState === 'idle' && menuStep === 'category') {
    return (
      <section className="ct-fade" style={{ padding: '30px 0 0' }}>
        <div style={metaRow}>Rules of the road</div>
        <h1
          style={{
            margin: '14px 0 0',
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: 42,
            lineHeight: 1.05,
            letterSpacing: '0.005em',
            color: 'var(--ct-ink)',
          }}
        >
          Collision regulations
        </h1>
        <p
          style={{
            maxWidth: '52ch',
            margin: '18px 0 0',
            fontSize: 16,
            lineHeight: 1.6,
            color: 'var(--ct-ink)',
          }}
        >
          Choose a topic to study, or test across all of them.
        </p>

        <div className="ct-rule" style={{ margin: '26px 0 16px' }} />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
            gap: 12,
          }}
        >
          {CATEGORY_ORDER.map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <button
                key={cat}
                className="ct-card"
                onClick={() => {
                  setCategoryFilter(cat);
                  setMenuStep('mode');
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  <span className="ct-display" style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.25 }}>
                    {meta.label}
                  </span>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      letterSpacing: '0.1em',
                      whiteSpace: 'nowrap',
                      color: 'var(--ct-brass)',
                    }}
                  >
                    {getPool(cat).length} Q
                  </span>
                </span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10.5,
                    color: 'var(--ct-muted)',
                    letterSpacing: '0.06em',
                  }}
                >
                  {meta.sub}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (drillState === 'idle') {
    return (
      <section className="ct-fade" style={{ padding: '28px 0 0' }}>
        {/* Focused from a hub card, there is no in-drill category list to go
            back to - the hub itself is the way back, and the masthead already
            offers it. */}
        {!focused && (
          <button className="ct-link" onClick={() => setMenuStep('category')}>
            <ArrowLeft size={12} strokeWidth={2} aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 5 }} />All topics
          </button>
        )}

        <h1
          style={{
            margin: focused ? 0 : '16px 0 0',
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: 42,
            lineHeight: 1.05,
            letterSpacing: '0.005em',
            color: 'var(--ct-ink)',
          }}
        >
          {CATEGORY_META[categoryFilter].label}
        </h1>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginTop: 12, ...metaRow }}>
          <span>{CATEGORY_META[categoryFilter].sub}</span>
          <span>{pool.length} questions</span>
          {bestScore > 0 && <span>Best {bestScore}</span>}
        </div>

        <div className="ct-rule" style={{ margin: '26px 0 22px' }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <button className="ct-solid" onClick={() => startDrill('practice')}>
            Practice · untimed
          </button>
          <button className="ct-ghost" onClick={() => startDrill('exam')}>
            Exam · {pool.length} Q · 15s each
          </button>
        </div>

        <p
          style={{
            maxWidth: '56ch',
            marginTop: 26,
            fontSize: 14,
            lineHeight: 1.6,
            color: 'var(--ct-muted)',
          }}
        >
          Practice draws without end and shows the rule behind every answer. The exam is one
          pass through the whole topic, fifteen seconds a question, with the explanations
          held back.
        </p>
      </section>
    );
  }

  if (drillState === 'playing' && current) {
    // An endless practice draw has no end to show progress towards, so the
    // run of pips belongs to deck runs only.
    const asked = deckTotal - deck.length;
    const pips = deckRun
      ? Array.from({ length: deckTotal }, (_, i) =>
          i === asked ? 'var(--ct-brass)' : 'var(--ct-line)'
        )
      : null;

    return (
      <section style={{ padding: '24px 0 0' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            ...metaRow,
          }}
        >
          <button className="ct-link ct-link-danger" onClick={handleFinish}>
            <ArrowLeft size={12} strokeWidth={2} aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 5 }} />Abandon
          </button>
          <span>
            {drillMode === 'exam'
              ? 'Exam · timed'
              : questionMs === null
                ? 'Practice · untimed'
                : `Practice · ${timerLabel(questionMs)} each`}
          </span>
          <span
            style={{
              color: questionMs !== null && timerWarning ? 'var(--ct-port)' : 'var(--ct-muted)',
            }}
          >
            {questionMs !== null ? `${timerSeconds}s` : `${answered} answered`}
          </span>
        </div>

        {pips && (
          <div style={{ display: 'flex', gap: 4, margin: '14px 0 0' }} aria-hidden="true">
            {pips.map((color, i) => (
              <span key={i} style={{ flex: 1, height: 3, background: color }} />
            ))}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 14,
            marginTop: 26,
            ...metaRow,
            fontSize: 11,
          }}
        >
          {deckRun ? (
            <span>
              Q {asked + 1} / {deckTotal}
            </span>
          ) : (
            <span>Score {score}</span>
          )}
          <span>{CATEGORY_LABELS[current.category]}</span>
        </div>

        <h2
          style={{
            margin: '12px 0 0',
            fontSize: 26,
            lineHeight: 1.32,
            fontWeight: 600,
            maxWidth: '44ch',
            color: 'var(--ct-ink)',
          }}
        >
          {current.prompt}
        </h2>

        <div className={`ct-quizbody${showPanel ? ' ct-has-visual' : ''}`}>
          {showPanel && (
            <VisualPanel
              key={current.id}
              questionId={current.id}
              revealed={selectedAnswer !== null}
            />
          )}

          <ScenarioCard
            key={current.id}
            question={current}
            options={options}
            selectedAnswer={selectedAnswer}
            // Practice reveals the verdict in place; the exam advances by
            // itself and holds it back. Unchanged from before the reskin -
            // only where it is expressed has moved.
            reveal={selectedAnswer !== null && drillMode === 'practice'}
            colorblind={prefs.colorblind}
            showCitations={prefs.showCitations}
            onSelect={handleSelect}
          />
        </div>
      </section>
    );
  }

  if (drillState === 'finished') {
    const total = deckRun ? deckTotal : answered;
    const pass = total > 0 && score / total >= PASS_MARK;

    return (
      <section className="ct-fade" style={{ padding: '28px 0 0' }}>
        <div style={metaRow}>
          {drillMode === 'exam' ? 'Exam result' : 'Practice result'} ·{' '}
          {CATEGORY_META[categoryFilter].label}
        </div>

        <h1
          style={{
            margin: '14px 0 0',
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: 62,
            lineHeight: 1,
            letterSpacing: '0.005em',
            color: pass ? 'var(--ct-stbd)' : 'var(--ct-port)',
          }}
        >
          {pass ? 'Pass' : 'Not yet'}
        </h1>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 30,
            marginTop: 18,
            ...metaRow,
            fontSize: 12,
          }}
        >
          <span>
            Score{' '}
            <strong style={{ color: 'var(--ct-ink)', fontSize: 15 }}>
              {score}/{total}
            </strong>
          </span>
          <span>
            Pass mark{' '}
            <strong style={{ color: 'var(--ct-ink)', fontSize: 15 }}>
              {Math.round(PASS_MARK * 100)}%
            </strong>
          </span>
          {bestScore > 0 && (
            <span>
              Best <strong style={{ color: 'var(--ct-ink)', fontSize: 15 }}>{bestScore}</strong>
            </span>
          )}
        </div>

        <div className="ct-rule" style={{ margin: '26px 0 22px' }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <button className="ct-solid" onClick={() => startDrill(drillMode)}>
            Drill it again
          </button>
          <button className="ct-ghost" onClick={resetToMenu}>
            {focused ? 'Back to the topic' : 'All topics'}
          </button>
        </div>
      </section>
    );
  }

  return null;
}
