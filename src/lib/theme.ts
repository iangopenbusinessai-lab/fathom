// The two lighting states from the design: the daylight chart table, and the
// night helm where everything drops to brass on navy to protect night vision.
//
// Both are expressed as CSS custom properties rather than Tailwind classes,
// because the palette is not in the Tailwind config and index.html - which is
// where a CDN Tailwind config would have to live - is finalized.

export type ThemeName = 'light' | 'dark';

export type ThemeVars = Record<string, string>;

export const THEMES: Record<ThemeName, ThemeVars> = {
  light: {
    '--ct-bg': '#ece1c8',
    '--ct-ink': '#1e3a5f',
    '--ct-muted': '#6b7c8f',
    '--ct-brass': '#8a6d3b',
    '--ct-stbd': '#1f6b42',
    '--ct-port': '#a02128',
    '--ct-grid': 'rgba(30,58,95,0.07)',
    '--ct-line': 'rgba(30,58,95,0.2)',
    '--ct-panel': 'rgba(30,58,95,0.04)',
  },
  dark: {
    '--ct-bg': '#0a1929',
    '--ct-ink': '#d4a94a',
    '--ct-muted': '#8a9bb0',
    '--ct-brass': '#d4a94a',
    '--ct-stbd': '#4caf7d',
    '--ct-port': '#e0555c',
    '--ct-grid': 'rgba(212,169,74,0.07)',
    '--ct-line': 'rgba(212,169,74,0.22)',
    '--ct-panel': 'rgba(212,169,74,0.045)',
  },
};

// The name of the lighting you are IN. The masthead toggle that named the
// state you would switch to is gone; the control lives in Settings now, and a
// settings row reads as its current value.
export function themeName(theme: ThemeName): string {
  return theme === 'dark' ? 'Night helm' : 'Chart table';
}

export const SANS = "'IBM Plex Sans', system-ui, -apple-system, sans-serif";
export const MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace";
// STENCIL is now the wordmark's face and nothing else. Every heading that
// used it - section headers, screen titles, card titles - is set in DISPLAY,
// so FATHOM keeps the stencil voice it was drawn in while the rest of the
// site reads as a book rather than as a stencilled crate.
export const STENCIL =
  "'Big Shoulders Stencil', 'Big Shoulders Stencil Display', 'IBM Plex Sans', sans-serif";
export const DISPLAY =
  "'Fraunces', 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif";
