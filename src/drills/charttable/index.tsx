import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChartFrame } from '../../components/ChartFrame';
import { CategoryIndex } from './components/CategoryIndex';
import { CategoryDetail } from '../../components/CategoryDetail';
import { AnswerRecord, QuizScreen } from './components/QuizScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { SettingGroup, SettingsScreen } from '../../components/SettingsScreen';
import { ThemeName } from '../../lib/theme';
import { CATEGORIES, LIVE_CATEGORIES, categoryById } from '../../lib/syllabus';
import { DEFAULT_EXAM_LENGTH, EXAM_LENGTHS } from '../../lib/prefs';
import { COLREGS_QUESTIONS_BY_CATEGORY, ColregsQuestion } from '../colregs/constants';
import { citationOf } from '../../lib/citation';
import {
  Progress,
  clearProgress,
  masteryPct,
  readProgress,
  recordAnswer,
} from '../../lib/progress';
import { readJSON, writeJSON } from '../../lib/storage';

type Screen = 'hub' | 'category' | 'quiz' | 'results' | 'settings';
type Mode = 'practice' | 'exam';

// A question paired with the chart-table category it was drawn from, so the
// results screen and the progress ledger can attribute it without a lookup.
interface QueuedQuestion {
  question: ColregsQuestion;
  categoryId: string;
  // Options in the order this run presents them.
  //
  // The bank lists the correct answer first in 73% of its 78 questions (all 6
  // vessel-type questions, and option D is correct only once in the whole
  // bank), so drilling them in source order can be beaten by always pressing
  // A. Shuffling once per queued question fixes that without touching the
  // content. It is settled when the queue is built, not per render, so the
  // options do not reorder underneath the answer.
  options: string[];
}

const PREFS_KEY = 'charttable:prefs';
// Exam mode reveals nothing and moves on by itself; this is the beat the
// design leaves on the chosen answer before advancing.
const EXAM_ADVANCE_MS = 420;

interface Prefs {
  theme: ThemeName;
  colorblind: boolean;
  haptics: boolean;
  showCitations: boolean;
  examLength: number;
}

const DEFAULT_PREFS: Prefs = {
  theme: 'light',
  colorblind: false,
  haptics: false,
  showCitations: true,
  examLength: DEFAULT_EXAM_LENGTH,
};

function readPrefs(): Prefs {
  const raw = readJSON<unknown>(PREFS_KEY, DEFAULT_PREFS);
  if (typeof raw !== 'object' || raw === null) return DEFAULT_PREFS;
  const r = raw as Record<string, unknown>;
  return {
    theme: r.theme === 'dark' ? 'dark' : 'light',
    colorblind: r.colorblind === true,
    haptics: r.haptics === true,
    showCitations: r.showCitations !== false,
    examLength:
      typeof r.examLength === 'number' && EXAM_LENGTHS.includes(r.examLength)
        ? r.examLength
        : DEFAULT_EXAM_LENGTH,
  };
}

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function poolFor(categoryIds: string[]): QueuedQuestion[] {
  const pool: QueuedQuestion[] = [];
  for (const id of categoryIds) {
    const cat = categoryById(id);
    if (!cat || cat.status !== 'live' || !cat.source) continue;
    for (const question of COLREGS_QUESTIONS_BY_CATEGORY[cat.source]) {
      pool.push({ question, categoryId: id, options: shuffle(question.options) });
    }
  }
  return pool;
}

function formatClock(seconds: number): string {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function ChartTableDrill() {
  const [prefs, setPrefs] = useState<Prefs>(readPrefs);
  const [progress, setProgress] = useState<Progress>(readProgress);

  const [screen, setScreen] = useState<Screen>('hub');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('practice');
  const [queue, setQueue] = useState<QueuedQuestion[]>([]);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [results, setResults] = useState<AnswerRecord[]>([]);
  const [elapsed, setElapsed] = useState(0);

  // Cleared on unmount and whenever a run ends, so an abandoned exam cannot
  // advance a run that has already been replaced.
  const advanceRef = useRef<number | null>(null);

  const savePrefs = useCallback((next: Prefs) => {
    setPrefs(next);
    writeJSON(PREFS_KEY, next);
  }, []);

  // The clock only runs on the quiz screen.
  useEffect(() => {
    if (screen !== 'quiz') return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [screen]);

  useEffect(
    () => () => {
      if (advanceRef.current !== null) window.clearTimeout(advanceRef.current);
    },
    []
  );

  const begin = useCallback(
    (categoryIds: string[], nextMode: Mode, limit: number | null, focus: string | null) => {
      const pool = shuffle(poolFor(categoryIds));
      if (pool.length === 0) return;
      setQueue(limit ? pool.slice(0, limit) : pool);
      setMode(nextMode);
      setCategoryId(focus);
      setQi(0);
      setPicked(null);
      setResults([]);
      setElapsed(0);
      setScreen('quiz');
    },
    []
  );

  const current = queue[qi];

  const goNext = useCallback(() => {
    setPicked(null);
    setQi((i) => {
      const next = i + 1;
      if (next >= queue.length) {
        setScreen('results');
        return i;
      }
      return next;
    });
  }, [queue.length]);

  const handlePick = useCallback(
    (option: string) => {
      if (picked !== null || !current) return;

      const right = option === current.question.correctAnswer;
      setPicked(option);
      setResults((rs) => [
        ...rs,
        {
          questionId: current.question.id,
          categoryId: current.categoryId,
          prompt: current.question.prompt,
          cite: citationOf(current.question),
          right,
        },
      ]);
      setProgress(recordAnswer(current.categoryId, right));

      if (!right && prefs.haptics && typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(60);
        } catch {
          // Vibration is a nicety and is refused outright on some platforms.
        }
      }

      if (mode === 'exam') {
        advanceRef.current = window.setTimeout(goNext, EXAM_ADVANCE_MS);
      }
    },
    [current, goNext, mode, picked, prefs.haptics]
  );

  const goHub = useCallback(() => {
    if (advanceRef.current !== null) window.clearTimeout(advanceRef.current);
    setScreen('hub');
  }, []);

  // Weakest three live categories by mastery. Never drilled counts as weakest,
  // which is what makes this useful on a fresh install.
  const weakestIds = useMemo(() => {
    return [...LIVE_CATEGORIES]
      .sort((a, b) => masteryPct(progress, a.id) - masteryPct(progress, b.id))
      .slice(0, 3)
      .map((c) => c.id);
  }, [progress]);

  const exportProgress = useCallback(() => {
    try {
      const rows = [['category', 'answered', 'correct', 'mastery_pct', 'last_drilled_iso']];
      for (const cat of CATEGORIES) {
        const c = progress.cats[cat.id];
        if (!c) continue;
        rows.push([
          cat.name,
          String(c.answered),
          String(c.correct),
          String(masteryPct(progress, cat.id)),
          c.last ? new Date(c.last).toISOString() : '',
        ]);
      }
      const csv = rows.map((r) => r.map((f) => `"${f.replace(/"/g, '""')}"`).join(',')).join('\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fathom-progress.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // A blocked download is not worth breaking the settings screen over.
    }
  }, [progress]);

  const settingGroups: SettingGroup[] = useMemo(() => {
    const toggle = (
      key: 'colorblind' | 'haptics' | 'showCitations',
      label: string,
      help: string
    ) => ({
      key,
      label,
      help,
      ctrlLabel: prefs[key] ? 'On' : 'Off',
      tone: (prefs[key] ? 'on' : 'off') as 'on' | 'off',
      onActivate: () => savePrefs({ ...prefs, [key]: !prefs[key] }),
    });

    return [
      {
        name: 'Display',
        rows: [
          {
            key: 'theme',
            label: 'Night helm',
            help: 'Warm brass instrument lighting on navy, to preserve night vision at the wheel.',
            ctrlLabel: prefs.theme === 'dark' ? 'On' : 'Off',
            tone: (prefs.theme === 'dark' ? 'on' : 'off') as 'on' | 'off',
            onActivate: () =>
              savePrefs({ ...prefs, theme: prefs.theme === 'dark' ? 'light' : 'dark' }),
          },
          toggle(
            'colorblind',
            'Colourblind marks',
            'Adds text labels wherever port red and starboard green carry meaning.'
          ),
        ],
      },
      {
        name: 'Drilling',
        rows: [
          {
            key: 'examLength',
            label: 'Exam length',
            help: 'Questions drawn for a mixed exam. A category exam is capped at the questions it has.',
            ctrlLabel: `${prefs.examLength} Q`,
            tone: 'off' as const,
            onActivate: () => {
              const i = EXAM_LENGTHS.indexOf(prefs.examLength);
              savePrefs({ ...prefs, examLength: EXAM_LENGTHS[(i + 1) % EXAM_LENGTHS.length] });
            },
          },
          toggle(
            'showCitations',
            'Rule citations',
            'Show the rule a question is drawn from beside the verdict and in the review.'
          ),
          toggle(
            'haptics',
            'Haptic feedback',
            'Short pulse on an incorrect answer. Mobile only, where the browser allows it.'
          ),
        ],
      },
      {
        name: 'Data',
        rows: [
          {
            key: 'reset',
            label: 'Reset progress',
            help: 'Clears mastery, drilled totals and the streak for every category. Cannot be undone.',
            ctrlLabel: 'Reset',
            tone: 'danger' as const,
            onActivate: () => {
              clearProgress();
              setProgress(readProgress());
            },
          },
          {
            key: 'export',
            label: 'Export progress',
            help: 'Download per-category answered, correct and mastery figures as CSV.',
            ctrlLabel: 'Export',
            tone: 'off' as const,
            onActivate: exportProgress,
          },
        ],
      },
    ];
  }, [exportProgress, prefs, savePrefs]);

  const activeCategory = categoryId ? categoryById(categoryId) : undefined;

  let body: React.ReactNode = null;

  if (screen === 'hub') {
    body = (
      <CategoryIndex
        progress={progress}
        examLength={prefs.examLength}
        onOpenCategory={(id) => {
          setCategoryId(id);
          setScreen('category');
        }}
        onStartMixedExam={() =>
          begin(LIVE_CATEGORIES.map((c) => c.id), 'exam', prefs.examLength, null)
        }
        onStartWeakest={() => begin(weakestIds, 'practice', 6, null)}
      />
    );
  } else if (screen === 'category' && activeCategory) {
    body = (
      <CategoryDetail
        category={activeCategory}
        progress={progress}
        onBack={goHub}
        // The shared CategoryDetail hands back a mode and a plan now. The
        // retired drill maps the one field it can honour - the count - onto
        // its own begin().
        onStart={(mode, plan) =>
          begin(
            [activeCategory.id],
            mode === 'exam' ? 'exam' : 'practice',
            plan.count ??
              (mode === 'exam'
                ? Math.min(poolFor([activeCategory.id]).length, prefs.examLength)
                : null),
            activeCategory.id
          )
        }
      />
    );
  } else if (screen === 'quiz' && current) {
    const budget = queue.length * 60;
    const clock =
      mode === 'exam'
        ? `${formatClock(elapsed)} / ${formatClock(budget)}`
        : formatClock(elapsed);

    body = (
      <QuizScreen
        question={current.question}
        options={current.options}
        categoryName={categoryById(current.categoryId)?.name ?? ''}
        index={qi}
        total={queue.length}
        results={results}
        picked={picked}
        mode={mode}
        clock={clock}
        colorblind={prefs.colorblind}
        showCitations={prefs.showCitations}
        onPick={handlePick}
        onNext={goNext}
        onQuit={() => {
          if (advanceRef.current !== null) window.clearTimeout(advanceRef.current);
          setScreen(categoryId ? 'category' : 'hub');
        }}
      />
    );
  } else if (screen === 'results') {
    body = (
      <ResultsScreen
        header={`${mode === 'exam' ? 'Exam result' : 'Practice result'} · ${
          activeCategory ? activeCategory.name : 'Mixed bank'
        }`}
        results={results}
        clock={formatClock(elapsed)}
        showCitations={prefs.showCitations}
        hasMisses={results.some((r) => !r.right)}
        onRetryMisses={() => {
          const missed = Array.from(
            new Set(results.filter((r) => !r.right).map((r) => r.categoryId))
          );
          if (missed.length === 0) return;
          begin(missed, 'practice', null, missed.length === 1 ? missed[0] : null);
        }}
        onGoHub={goHub}
      />
    );
  } else if (screen === 'settings') {
    body = <SettingsScreen groups={settingGroups} onBack={goHub} />;
  } else {
    // Any state that cannot render its screen falls back to the index rather
    // than showing an empty chart.
    body = (
      <CategoryIndex
        progress={progress}
        examLength={prefs.examLength}
        onOpenCategory={(id) => {
          setCategoryId(id);
          setScreen('category');
        }}
        onStartMixedExam={() =>
          begin(LIVE_CATEGORIES.map((c) => c.id), 'exam', prefs.examLength, null)
        }
        onStartWeakest={() => begin(weakestIds, 'practice', 6, null)}
      />
    );
  }

  return (
    <ChartFrame
      theme={prefs.theme}
      onToggleTheme={() =>
        savePrefs({ ...prefs, theme: prefs.theme === 'dark' ? 'light' : 'dark' })
      }
      onGoHub={goHub}
      onGoSettings={() => setScreen('settings')}
    >
      {body}
    </ChartFrame>
  );
}
