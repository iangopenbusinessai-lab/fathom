import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Anchor } from 'lucide-react';
import { CompassRose } from './components/CompassRose';
import { ControlPanel } from './components/ControlPanel';
import { COMPASS_POINTS, RELATIVE_POINTS } from './constants';
import { CompassPoint, GameState, GameStats, GameMode, GameType } from './types';

// Standalone Application - No External Services

const GLOBAL_GAME_DURATION_MS = 60000; // 60 seconds for Practice/Timed
const EXAM_QUESTION_DURATION_MS = 15000; // 15 seconds per question for Exam

export default function App() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [gameMode, setGameMode] = useState<GameMode>('practice');
  const [gameType, setGameType] = useState<GameType>('compass');
  const [rotation, setRotation] = useState(0);

  // Game Data
  const [targetPoint, setTargetPoint] = useState<CompassPoint | null>(null);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  
  // Exam Specific State
  const [examDeck, setExamDeck] = useState<number[]>([]);
  const [questionsTotal, setQuestionsTotal] = useState(0); 
  
  // Stats
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    bestScore: 0,
    totalAttempts: 0
  });
  const [timeLeft, setTimeLeft] = useState(GLOBAL_GAME_DURATION_MS);

  // Refs
  const timerRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  // --- Helpers ---
  
  // Get active points set based on game type
  const getActivePoints = useCallback(() => {
      return gameType === 'compass' ? COMPASS_POINTS : RELATIVE_POINTS;
  }, [gameType]);

  const shuffleDeck = useCallback(() => {
    const deck = [...Array(32).keys()];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
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

  const resetToMenu = () => {
    setGameState('idle');
    setClickedIndex(null);
    setTargetPoint(null);
    setRotation(0);
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const generateRound = useCallback(() => {
    setClickedIndex(null);
    const activePoints = getActivePoints();

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
        setTimeLeft(EXAM_QUESTION_DURATION_MS);
    } else {
        // Practice/Timed: Random with replacement
        nextTargetIndex = Math.floor(Math.random() * activePoints.length);
    }

    setTargetPoint(activePoints[nextTargetIndex]);

    // 2. Determine Rotation (For all Challenge modes - Timed or Exam)
    if (gameMode !== 'practice') {
        const randomRot = Math.floor(Math.random() * 360);
        setRotation(randomRot);
    } else {
        setRotation(0);
    }

  }, [gameMode, gameType, examDeck, endGame, getActivePoints]);

  const startGame = (mode: GameMode, type: GameType) => {
    setGameMode(mode);
    setGameType(type);
    setStats(prev => ({ ...prev, score: 0, totalAttempts: 0 }));
    
    // We need to access points immediately, but state update for gameType might be async in next render.
    // So we use local var or the new type passed in.
    const activePoints = type === 'compass' ? COMPASS_POINTS : RELATIVE_POINTS;

    if (mode === 'exam') {
        const deck = shuffleDeck();
        setExamDeck(deck);
        setQuestionsTotal(32);
        setTimeLeft(EXAM_QUESTION_DURATION_MS);
        
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
        const targetIdx = Math.floor(Math.random() * activePoints.length);
        setTargetPoint(activePoints[targetIdx]);
        // Apply rotation for timed mode (Compass OR Relative)
        setRotation((mode !== 'practice') ? Math.floor(Math.random() * 360) : 0);
    }
  };

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

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden relative selection:bg-cyan-500/30 font-sans">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-900/10 blur-[120px] rounded-full animate-pulse duration-[10s]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-900/10 blur-[120px] rounded-full animate-pulse duration-[12s]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
      </div>

      {gameState === 'idle' ? (
        // --- TITLE SCREEN LAYOUT ---
        <div className="z-10 w-full max-w-lg flex flex-col items-center justify-center min-h-[60vh] relative animate-in fade-in zoom-in-95 duration-700">
           
           {/* Decorative Background Icon for Title */}
           <div className="absolute -z-10 opacity-5 scale-150 animate-[spin_60s_linear_infinite]">
              <Anchor size={400} />
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
              isTitleScreen={true}
           />
           
           {/* Footer Credits */}
           <div className="absolute bottom-[-10vh] text-slate-600 text-xs tracking-widest uppercase opacity-50">
              By Ian Gopen
           </div>
        </div>
      ) : (
        // --- GAME LAYOUT ---
        <div className="z-10 w-full max-w-6xl flex flex-col md:flex-row items-center gap-8 md:gap-16 animate-in fade-in slide-in-from-right-8 duration-500">
          
          {/* Left: Compass Visual */}
          <div className="flex-1 w-full max-w-[600px] aspect-square flex items-center justify-center">
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

          {/* Right: Controls */}
          <div className="flex-1 w-full max-w-md">
             <ControlPanel 
                gameState={gameState}
                targetPoint={targetPoint}
                stats={stats}
                timeLeft={timeLeft}
                gameMode={gameMode}
                gameType={gameType}
                onStart={startGame}
                onQuit={resetToMenu}
                examProgress={gameMode === 'exam' ? { 
                    current: (32 - examDeck.length), 
                    total: 32 
                } : undefined}
                isTitleScreen={false}
             />
          </div>
        </div>
      )}

    </div>
  );
}