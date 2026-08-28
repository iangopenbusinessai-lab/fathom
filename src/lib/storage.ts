// Best-effort localStorage wrapper.
//
// Every entry point swallows its own errors and falls back to "nothing was
// persisted". localStorage can throw rather than return in several ordinary
// situations - Safari private browsing, a full quota, storage disabled by
// policy, or a non-browser context with no window at all - and none of those
// are worth crashing a drill over. Persistence here is a convenience, so the
// app must behave exactly as it did before when storage is unavailable.

const NAMESPACE = 'nauticalmaster';

function namespaced(key: string): string {
  return `${NAMESPACE}:${key}`;
}

// Accessing window.localStorage is itself throwable, so it stays inside try.
function getStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const storage = getStorage();
    if (!storage) return fallback;
    const raw = storage.getItem(namespaced(key));
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    // Unreadable or malformed - treat it as absent rather than propagating.
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    const storage = getStorage();
    if (!storage) return;
    storage.setItem(namespaced(key), JSON.stringify(value));
  } catch {
    // Quota exceeded or storage disabled - drop the write silently.
  }
}

// Key scheme: nauticalmaster:best:<drillId>[:<dimension>...]
//
// The dimensions are whatever makes two bests unrelated within a drill, so a
// Day Shapes exam best cannot overwrite an All-COLREGS exam best. Callers pass
// their own, which keeps this helper from needing to know any drill's shape.
export function bestScoreKey(drillId: string, ...dimensions: string[]): string {
  return ['best', drillId, ...dimensions].join(':');
}

// A persisted best is only trusted if it still looks like a score - anything
// else (hand-edited storage, an older shape) reads as "no best yet".
export function readBestScore(key: string): number {
  const value = readJSON<unknown>(key, 0);
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return 0;
  return Math.floor(value);
}

export function writeBestScore(key: string, score: number): void {
  writeJSON(key, score);
}
