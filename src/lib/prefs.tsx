import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ThemeName } from './theme';
import { readJSON, writeJSON } from './storage';

// App-wide display preferences. These used to be the Chart Table drill's own
// prefs; the chart table is the whole site's design now, so they are read once
// at the root and handed down rather than being re-read per drill.
//
// The storage key keeps its original `charttable:` name, in the same spirit as
// the `nauticalmaster` namespace in ./storage - a rename would silently reset
// the preferences of anyone who has already set them.
const PREFS_KEY = 'charttable:prefs';

export const EXAM_LENGTHS = [5, 10, 15, 20, 25];
export const DEFAULT_EXAM_LENGTH = 10;

export interface Prefs {
  theme: ThemeName;
  colorblind: boolean;
  haptics: boolean;
  showCitations: boolean;
  examLength: number;
}

export const DEFAULT_PREFS: Prefs = {
  theme: 'light',
  colorblind: false,
  haptics: false,
  showCitations: true,
  examLength: DEFAULT_EXAM_LENGTH,
};

// Hand-edited or older-shaped storage reads as the default rather than
// crashing the root render.
export function readPrefs(): Prefs {
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

interface PrefsValue {
  prefs: Prefs;
  savePrefs: (next: Prefs) => void;
}

// Defaults rather than a null check, so a component rendered outside the
// provider (a test, a Storybook-style harness) still renders correctly instead
// of throwing.
const PrefsContext = createContext<PrefsValue>({
  prefs: DEFAULT_PREFS,
  savePrefs: () => undefined,
});

export const PrefsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefs, setPrefs] = useState<Prefs>(readPrefs);

  const savePrefs = useCallback((next: Prefs) => {
    setPrefs(next);
    writeJSON(PREFS_KEY, next);
  }, []);

  const value = useMemo(() => ({ prefs, savePrefs }), [prefs, savePrefs]);
  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
};

export function usePrefs(): PrefsValue {
  return useContext(PrefsContext);
}
