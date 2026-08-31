import React, { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import { CompassRose } from './CompassRose';
import { ControlPanel } from './ControlPanel';
import { COMPASS_POINTS, RELATIVE_POINTS } from './constants';
import { CompassPoint, DrillProps, GameState, GameStats, GameMode, GameType } from '../../types';
import { bestScoreKey, readBestScore, writeBestScore } from '../../lib/storage';
import { readProgress, recordAnswer } from '../../lib/progress';
import { itemIdForPoint } from '../../lib/syllabus';
import { DEFAULT_PLAN, SessionPlan, planQueue } from '../../lib/session';

// Standalone Application - No External Services

const GLOBAL_GAME_DURATION_MS = 60000; // 60 seconds for Practice/Timed
const EXAM_QUESTION_DURATION_MS = 15000; // 15 seconds per question for Exam

// Draw an index in [0, length) that is not the one just used. Falls back to the
// full range if excluding would leave nothing, so a single-point set still runs.
export function pickIndexExcluding(length: number, exclude: number | null): number {
  if (length <= 1 || exclude === null) return Math.floor(Math.random() * length);
  const roll = Math.floor(Math.random() * (length - 1));
  return roll >= exclude ? roll + 1 : roll;
}

export default function CompassDrill({ focus, start, onExit }: DrillProps) {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [gameMode, setGameMode] = useState<GameMode>('practice');
  // The hub's Navigation cards are 'compass' and 'relative', which are exactly
  // this drill's two game types, so a card opens straight onto its own rose.
  const [gameType, setGameType] = useState<GameType>(
    focus === 'relative' ? 'relative' : 'compass'
  );
  // How the run was set up on the category screen, if it was. Practice and
  // timed attack run for sixty seconds rather than walking a deck, so the
  // count shapes the exam only; the weak-spot filter narrows the points every
  // mode draws from, and the timer sets the exam's per-question clock.
  const [plan, setPlan] = useState<SessionPlan>(start?.plan ?? DEFAULT_PLAN);
  const [examQuestionMs, setExamQuestionMs] = useState(EXAM_QUESTION_DURATION_MS);
  const [rotation, setRotation] = useState(0);

  // Game Data
  const [targetPoint, setTargetPoint] = useState<CompassPoint | null>(null);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);

  // Exam Specific State
  const [examDeck, setExamDeck] = useState<number[]>([]);
  const [questionsTotal, setQuestionsTotal] = useState(0);

  // Bests are kept per type+mode, as in the colregs drill: a 32-question exam
  // and a 60-second timed run are not comparable, so they get their own keys
  // rather than overwriting one shared number.
  const bestKey = bestScoreKey('compass', gameType, gameMode);

  // Stats - the best score is seeded from storage on mount, so a reload picks
  // up where the last session left off instead of restarting at 0.
  const [stats, setStats] = useState<GameStats>(() => ({
    score: 0,
    bestScore: readBestScore(bestKey),
    totalAttempts: 0
  }));
  const [timeLeft, setTimeLeft] = useState(GLOBAL_GAME_DURATION_MS);

  // Refs
  const timerRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  // The point asked last round, held in a ref so generateRound can exclude it
  // without taking a dependency that would re-create it every round.
  const lastTargetIndexRef = useRef<number | null>(null);

  // --- Helpers ---

  // Get active points set based on game type
  const getActivePoints = useCallback(() => {
      return gameType === 'compass' ? COMPASS_POINTS : RELATIVE_POINTS;
  }, [gameType]);

  // The points the run in progress may draw from. Held in a ref because
  // startGame settles it before its own state updates have landed, and
  // generateRound has to read the same set startGame chose.
  const runPointsRef = useRef<CompassPoint[]>(COMPASS_POINTS);

  // The rose a run draws from. With the default plan that is all 32 points in
  // their own order - exactly what every draw used before plans existed. With
  // "focus on weak spots" it is the points the ledger says are missed more
  // often than not, widened from the rest of the rose when too few qualify.
  const pointsFor = useCallback((type: GameType, runPlan: SessionPlan) => {
    const all = type === 'compass' ? COMPASS_POINTS : RELATIVE_POINTS;
    if (!runPlan.weakSpotsOnly) return all;
    const queued = planQueue(
      all,
      (pt) => itemIdForPoint(type, pt.abbr),
      { ...runPlan, count: null },
      readProgress()
    );
    return queued.length > 0 ? queued : all;
  }, []);

  // Indices into `points`, shuffled, cut to the plan's count. Unplanned this
  // is the same full 32-index shuffle the exam always used.
  const buildDeck = useCallback((points: CompassPoint[], runPlan: SessionPlan) => {
    const deck = [...points.keys()];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return runPlan.count === null ? deck : deck.slice(0, runPlan.count);
  }, []);

  // --- Game Logic ---

  const endGame = useCallback(() => {
    setGameState('finished');
    setStats(prev => ({
        ...prev,
        bestScore: Math.max(prev.bestScore, prev.score)
    }));
    setRotation(0);
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
  }, []);

  // Swap in the stored best whenever the type+mode pair changes, so the figure
  // on screen always belongs to the combination being played.
  useEffect(() => {
    setStats(prev => ({ ...prev, bestScore: readBestScore(bestKey) }));
  }, [bestKey]);

  // Persist once a game is over, when bestScore has settled. Gating on the
  // finished state is what makes this key-safe: the key only ever changes in
  // startGame, which moves the game to 'playing' in the same commit, so this
  // can never fire with a new key while bestScore still holds the previous
  // combination's value. Keeping it out of the setStats updater above also
  // leaves that updater pure, which React requires - it invokes it twice under
  // StrictMode.
  useEffect(() => {
    if (gameState !== 'finished') return;
    if (stats.bestScore > 0) writeBestScore(bestKey, stats.bestScore);
  }, [gameState, stats.bestScore, bestKey]);

  const resetToMenu = () => {
    // Launched from a category screen, that screen is the way back - it is
    // where the exercise was set up.
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (onExit) {
      onExit();
      return;
    }
    setGameState('idle');
    setClickedIndex(null);
    setTargetPoint(null);
    setRotation(0);
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const generateRound = useCallback(() => {
    setClickedIndex(null);
    const activePoints = runPointsRef.current;

    // 1. Determine Target
    let nextTargetIndex = 0;

    if (gameMode === 'exam') {
        if (examDeck.length === 0) {
            endGame();
            return;
        }
        const nextDeck = [...examDeck];
        nextTargetIndex = nextDeck.pop()!;
        setExamDeck(nextDeck);

        // Reset timer for the new question
        setTimeLeft(examQuestionMs);
    } else {
        // Practice/Timed: random with replacement, minus the point just asked,
        // which could otherwise be drawn twice in a row.
        nextTargetIndex = pickIndexExcluding(activePoints.length, lastTargetIndexRef.current);
    }

    lastTargetIndexRef.current = nextTargetIndex;
    setTargetPoint(activePoints[nextTargetIndex]);

    // 2. Determine Rotation (For all Challenge modes - Timed or Exam)
    if (gameMode !== 'practice') {
        const randomRot = Math.floor(Math.random() * 360);
        setRotation(randomRot);
    } else {
        setRotation(0);
    }

  }, [gameMode, examDeck, endGame, examQuestionMs]);

  const startGame = (mode: GameMode, type: GameType, runPlan: SessionPlan = plan) => {
    setGameMode(mode);
    setGameType(type);
    setPlan(runPlan);
    setStats(prev => ({ ...prev, score: 0, totalAttempts: 0 }));

    // We need to access points immediately, but state update for gameType might be async in next render.
    // So we use local var or the new type passed in.
    const activePoints = pointsFor(type, runPlan);
    runPointsRef.current = activePoints;

    // The plan's timer is the exam's per-question clock. Practice and timed
    // attack are sixty-second runs rather than per-question ones, so they take
    // no clock from the plan.
    const perQuestion = runPlan.perQuestionMs ?? EXAM_QUESTION_DURATION_MS;
    setExamQuestionMs(perQuestion);

    if (mode === 'exam') {
        const deck = buildDeck(activePoints, runPlan);
        setExamDeck(deck);
        setQuestionsTotal(deck.length);
        setTimeLeft(perQuestion);

        // Manual first round init
        const firstDeck = [...deck];
        const firstIdx = firstDeck.pop()!;
        setExamDeck(firstDeck);
        setTargetPoint(activePoints[firstIdx]);
        setClickedIndex(null);
        // Apply rotation for exam mode (Compass OR Relative)
        setRotation(Math.floor(Math.random() * 360));
        setGameState('playing');
    } else {
        setTimeLeft(GLOBAL_GAME_DURATION_MS);
        setGameState('playing');
        setClickedIndex(null);
        // A fresh run has no previous point to exclude.
        const targetIdx = pickIndexExcluding(activePoints.length, null);
        lastTargetIndexRef.current = targetIdx;
        setTargetPoint(activePoints[targetIdx]);
        // Apply rotation for timed mode (Compass OR Relative)
        setRotation((mode !== 'practice') ? Math.floor(Math.random() * 360) : 0);
    }
  };

  // Launched from a category screen: go straight into the run it configured.
  // A layout effect rather than a plain one, so the drill's own menu never
  // paints for a frame first.
  const plannedStartRef = useRef(false);
  useLayoutEffect(() => {
    if (!start || plannedStartRef.current) return;
    plannedStartRef.current = true;
    startGame(start.mode, focus === 'relative' ? 'relative' : 'compass', start.plan);
  // startGame is re-created every render; the ref is what makes this run once.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start]);

  // --- Timer ---
  useEffect(() => {
    if (gameState === 'playing') {
      let lastTime = performance.now();

      const loop = (time: number) => {
        const delta = time - lastTime;
        lastTime = time;

        setTimeLeft(prev => {
            const newTime = prev - delta;

            if (newTime <= 0) {
                if (gameMode === 'exam') {
                    // Timeout handled by separate effect
                    return 0;
                } else {
                    endGame();
                    return 0;
                }
            }
            return newTime;
        });

        if (gameState === 'playing') {
            timerRef.current = requestAnimationFrame(loop);
        }
      };

      timerRef.current = requestAnimationFrame(loop);
    }
    return () => {
        if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [gameState, endGame, gameMode]);

  // Handle Exam Timeout Effect
  const handledTimeoutRef = useRef(false);

  useEffect(() => {
    if (gameState === 'playing' && gameMode === 'exam' && timeLeft <= 0 && !handledTimeoutRef.current) {
        handledTimeoutRef.current = true;
        setClickedIndex(-1); // Visual trigger for reveal/failure

        timeoutRef.current = window.setTimeout(() => {
             generateRound();
             handledTimeoutRef.current = false;
        }, 1500);
    }
  }, [timeLeft, gameState, gameMode, generateRound]);


  // --- Interaction ---
  const handlePointClick = (index: number) => {
    if (gameState !== 'playing' || clickedIndex !== null) return;
    if (gameMode === 'exam' && timeLeft <= 0) return;

    setClickedIndex(index);

    const isCorrect = index === targetPoint?.index;

    if (isCorrect) {
        setStats(prev => ({ ...prev, score: prev.score + 1 }));
    }

    // Recorded against the syllabus card this rose belongs to, which is what
    // fills its mastery bar on the hub. Storage is best-effort, so a failure
    // here cannot interrupt the run.
    recordAnswer(
      gameType,
      isCorrect,
      targetPoint ? itemIdForPoint(gameType, targetPoint.abbr) : null
    );

    const delay = gameMode === 'exam' ? 1000 : (isCorrect ? 500 : 1000);

    timeoutRef.current = window.setTimeout(() => {
        handledTimeoutRef.current = false;
        generateRound();
    }, delay);
  };

  // Cleanup
  useEffect(() => {
      return () => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
  }, []);

  // ── RENDER ──
  //
  // The rose keeps its own dark ground in both themes - it is drawn in white,
  // grey and signal colours and would disappear on the parchment - so it sits
  // in the shared .ct-instrument panel, the same treatment the colregs
  // diagrams get.

  if (gameState === 'idle') {
    return (
      <ControlPanel
        gameState={gameState}
        targetPoint={targetPoint}
        stats={stats}
        timeLeft={timeLeft}
        gameMode={gameMode}
        gameType={gameType}
        onStart={startGame}
        onQuit={resetToMenu}
      />
    );
  }

  if (gameState === 'finished') {
    return (
      <ControlPanel
        gameState={gameState}
        targetPoint={targetPoint}
        stats={stats}
        timeLeft={timeLeft}
        gameMode={gameMode}
        gameType={gameType}
        onStart={startGame}
        onQuit={resetToMenu}
        examTotal={questionsTotal}
      />
    );
  }

  return (
    <section style={{ padding: '24px 0 0' }}>
      <div className="ct-rosebody">
        <div className="ct-instrument">
          <div className="ct-instrument-label">
            {gameType === 'compass' ? 'Rose' : 'Own ship'}
          </div>
          <CompassRose
            targetPoint={targetPoint}
            gameState={gameState}
            onPointClick={handlePointClick}
            clickedIndex={clickedIndex}
            rotation={rotation}
            gameMode={gameMode}
            gameType={gameType}
          />
        </div>

        <ControlPanel
          gameState={gameState}
          targetPoint={targetPoint}
          stats={stats}
          timeLeft={timeLeft}
          gameMode={gameMode}
          gameType={gameType}
          onStart={startGame}
          onQuit={resetToMenu}
          examProgress={
            gameMode === 'exam'
              ? { current: questionsTotal - examDeck.length, total: questionsTotal }
              : undefined
          }
        />
      </div>
    </section>
  );
}
