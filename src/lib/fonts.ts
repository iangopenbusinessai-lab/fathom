// Attaches the webfonts the Chart Table drill is drawn in, at runtime, because
// index.html is finalized and cannot carry the <link> tags itself. Same shape
// as installFavicon() in ./favicon and installManifest() in ./manifest.
//
// Three families, all from Google Fonts:
//   Big Shoulders Stencil - the FATHOM wordmark, and nothing else
//   Fraunces              - section headers, screen titles and card titles
//   IBM Plex Sans         - body copy
//   IBM Plex Mono         - the instrument/label voice, and the soundings row
//
// Fraunces is a variable font; the opsz axis is requested across its full
// 9..144 range so the browser can pick an optical size to suit a 46px screen
// title and a 15px card title from the one file.
//
// Every consumer declares a full fallback stack, so a blocked or slow font
// service degrades to system faces rather than leaving the drill unstyled.

const PRECONNECTS: ReadonlyArray<{ href: string; crossOrigin?: string }> = [
  { href: 'https://fonts.googleapis.com' },
  { href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
];

const STYLESHEET =
  'https://fonts.googleapis.com/css2' +
  '?family=Big+Shoulders+Stencil:wght@400;600;700' +
  '&family=Fraunces:opsz,wght@9..144,400..700' +
  '&family=IBM+Plex+Sans:wght@400;500;600' +
  '&family=IBM+Plex+Mono:wght@400;500;600' +
  '&display=swap';

// Marks what this module injected, so a second call is a no-op rather than
// stacking duplicate links (StrictMode double-invokes effects in dev).
const MARKER = 'data-fathom-fonts';

export function installFonts(): void {
  try {
    if (typeof document === 'undefined') return;
    if (document.head.querySelector(`[${MARKER}]`)) return;

    for (const { href, crossOrigin } of PRECONNECTS) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      if (crossOrigin) link.crossOrigin = crossOrigin;
      link.setAttribute(MARKER, '');
      document.head.appendChild(link);
    }

    const sheet = document.createElement('link');
    sheet.rel = 'stylesheet';
    sheet.href = STYLESHEET;
    sheet.setAttribute(MARKER, '');
    document.head.appendChild(sheet);
  } catch {
    // Fonts are cosmetic - never let them stop the app from mounting.
  }
}
