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

// The label names the state you would switch TO, which is what the design's
// toggle button reads.
export function themeLabel(theme: ThemeName): string {
  return theme === 'dark' ? 'Chart table' : 'Night helm';
}

export const SANS = "'IBM Plex Sans', system-ui, -apple-system, sans-serif";
export const MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace";
export const STENCIL =
  "'Big Shoulders Stencil', 'Big Shoulders Stencil Display', 'IBM Plex Sans', sans-serif";
