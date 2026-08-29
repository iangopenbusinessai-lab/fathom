// Registers the pass-through service worker in public/sw.js, which exists only
// to satisfy PWA installability. Nothing is cached; see that file.
//
// Registration is skipped in dev: a service worker sitting in front of the Vite
// dev server buys nothing and only confuses HMR. `npm run preview` runs a
// production build, so that is where to exercise the install prompt locally.
//
// The script URL is resolved against document.baseURI, which also fixes the
// worker's scope to the app's base path rather than the origin root - the app
// is served from a GitHub Pages subpath and has no business claiming '/'.

const SW_FILE = 'sw.js';

export function registerServiceWorker(): void {
  if (!import.meta.env.PROD) return;
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

  // Wait for load so registration never competes with the first render.
  window.addEventListener('load', () => {
    const url = new URL(SW_FILE, document.baseURI);
    navigator.serviceWorker.register(url.href, { scope: './' }).catch(() => {
      // An unregistered worker just means no install prompt. Not fatal.
    });
  });
}
