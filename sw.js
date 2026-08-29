// Minimal service worker: it exists so the app is installable, and does
// nothing else on purpose.
//
// There is NO offline asset caching here by design - Fathom still requires a
// connection to load. The fetch handler is a pass-through because an
// installable PWA must have one; it deliberately does not consult or populate
// any cache. Do not grow this into a caching layer without deciding what a
// stale drill bundle should do.

self.addEventListener('install', () => {
  // Take over immediately rather than waiting for every tab to close, so a
  // deployed change is never held back by a worker with nothing to serve.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
