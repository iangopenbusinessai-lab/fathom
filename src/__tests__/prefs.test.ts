import { describe, it, expect, beforeEach } from 'vitest';

// Same stub as the ledger test: src/lib/storage treats a missing
// window.localStorage as "nothing was persisted", which is exactly the
// first-run case here, so the stub is what lets the *stored* cases be checked
// at all.
const store = new Map<string, string>();

const localStorageStub = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: (i: number) => [...store.keys()][i] ?? null,
  get length() {
    return store.size;
  },
} as unknown as Storage;

(globalThis as { window?: unknown }).window = { localStorage: localStorageStub };

const KEY = 'nauticalmaster:charttable:prefs';

const { readPrefs, DEFAULT_PREFS } = await import('../lib/prefs');

describe('the default lighting', () => {
  beforeEach(() => store.clear());

  it('opens at the night helm when nothing has been chosen', () => {
    expect(DEFAULT_PREFS.theme).toBe('dark');
    expect(readPrefs().theme).toBe('dark');
  });

  it('respects a light theme that was chosen explicitly', () => {
    store.set(KEY, JSON.stringify({ ...DEFAULT_PREFS, theme: 'light' }));
    expect(readPrefs().theme).toBe('light');
  });

  it('keeps an explicit dark choice too', () => {
    store.set(KEY, JSON.stringify({ ...DEFAULT_PREFS, theme: 'dark' }));
    expect(readPrefs().theme).toBe('dark');
  });

  // Prefs written before the theme existed, or hand-edited nonsense: never
  // chosen, so the default applies rather than the old light fallback.
  it('treats prefs with no theme at all as never chosen', () => {
    store.set(KEY, JSON.stringify({ colorblind: true }));
    const prefs = readPrefs();
    expect(prefs.theme).toBe('dark');
    expect(prefs.colorblind).toBe(true);
  });

  it('leaves the other preferences alone', () => {
    store.set(KEY, JSON.stringify({ theme: 'light', showCitations: false, haptics: true }));
    const prefs = readPrefs();
    expect(prefs.showCitations).toBe(false);
    expect(prefs.haptics).toBe(true);
  });
});
