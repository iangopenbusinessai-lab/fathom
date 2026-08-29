// Attaches the web app manifest at runtime, for the same reason the favicon is
// attached that way: index.html is finalized and cannot carry a
// <link rel="manifest">. See ./favicon for the original of this pattern.
//
// The href is resolved against document.baseURI rather than hardcoded, so it
// follows the Vite base in dev and in the built site alike - and every path
// inside manifest.json is in turn relative to the manifest, so start_url,
// scope and the icons all land under the same base without repeating it.

const MANIFEST_FILE = 'manifest.json';

export function installManifest(): void {
  try {
    if (typeof document === 'undefined') return;

    const href = new URL(MANIFEST_FILE, document.baseURI).href;

    // Reuse an existing manifest link if one ever appears in the HTML, so this
    // never ends up fighting a tag added later.
    const existing = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    const link = existing ?? document.createElement('link');

    link.rel = 'manifest';
    link.href = href;

    if (!existing) document.head.appendChild(link);

    // theme-color is a <meta>, not part of the manifest link, and Chrome reads
    // it for the toolbar tint. Kept in step with manifest.json by hand.
    if (!document.querySelector('meta[name="theme-color"]')) {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = '#0f172a';
      document.head.appendChild(meta);
    }
  } catch {
    // Installability is a progressive enhancement - never let it stop the app
    // from mounting.
  }
}
