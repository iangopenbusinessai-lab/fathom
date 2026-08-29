// Sets the document title at runtime, because index.html is finalized and its
// <title> cannot be edited. Same approach as installFavicon() in ./favicon.
//
// The HTML ships a stale title, so the browser paints that for an instant
// before the bundle runs; calling this first thing in main.tsx keeps that
// window as short as possible.

const TITLE = 'Fathom';

export function installTitle(): void {
  try {
    if (typeof document === 'undefined') return;
    document.title = TITLE;
  } catch {
    // A title is cosmetic - never let it stop the app from mounting.
  }
}
