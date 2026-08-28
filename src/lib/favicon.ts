// Attaches the favicon at runtime, because index.html is finalized and cannot
// carry a <link rel="icon">.
//
// The usual public/favicon.ico convention does not work here. A browser's
// automatic request goes to the ORIGIN root - github.io/favicon.ico - while
// this app is served from the /nauticalmaster/ subpath, so anything dropped in
// public/ is published to /nauticalmaster/favicon.ico and never asked for.
// Injecting the link is what makes the file reachable without editing HTML.
//
// The href is resolved against document.baseURI rather than hardcoded, so it
// follows the Vite base in dev and in the built site alike.

const ICON_FILE = 'favicon.svg';

export function installFavicon(): void {
  try {
    if (typeof document === 'undefined') return;

    const href = new URL(ICON_FILE, document.baseURI).href;

    // Reuse an existing icon link if one ever appears in the HTML, so this
    // never ends up fighting a tag added later.
    const existing = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    const link = existing ?? document.createElement('link');

    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = href;

    if (!existing) document.head.appendChild(link);
  } catch {
    // A missing icon is not worth breaking startup over.
  }
}
