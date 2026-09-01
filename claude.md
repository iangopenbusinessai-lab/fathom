# Fathom

Vite + React + TypeScript app deployed to GitHub Pages at:
https://iangopenbusinessai-lab.github.io/fathom/

## Stack
- Vite 6, React 19, TypeScript 5.8
- The chart-table design system: CSS custom properties + a stylesheet in
  ChartFrame. See "Design system" below.
- Tailwind CSS (CDN in index.html) — now only inside the drill *diagrams*
  (CompassRose, LightDisplay and friends), which were never restyled.
- gh-pages for deployment

## File Structure
```
src/
  main.tsx              ← entry point
  App.tsx               ← the shell: ChartFrame + routes between Hub, a drill, settings
  types.ts              ← DrillConfig, DrillProps, compass types
  lib/
    theme.ts            ← light/dark palettes as CSS custom properties, font stacks
    syllabus.ts         ← CATEGORIES: the four-section syllabus the Hub renders
    prefs.ts            ← app-wide display prefs + PrefsProvider / usePrefs
    progress.ts         ← the answer ledger: per-category mastery + per-item tallies
    session.ts          ← SessionPlan and planQueue: how a run's questions are chosen
    citation.ts         ← reads "Rule 27(a)" back out of an explanation
    shuffle.ts          ← Fisher-Yates, used for option order and deck order
    fonts.ts            ← runtime <link> injection for the webfonts
  components/
    ChartFrame.tsx      ← the chart ground, masthead, soundings, and the ct-* stylesheet
    Hub.tsx             ← the syllabus index, four sections of category cards
    CategoryDetail.tsx  ← one category: weak spots, exercise controls, start buttons
    VisualPanel.tsx     ← the dark instrument panel, drawing the colregs diagrams
    SettingsScreen.tsx  ← generic settings list, rows supplied by App
  drills/
    index.ts            ← DRILLS registry array
    compass/            ← compass & relative bearing drill
      index.tsx
      constants.ts
      CompassRose.tsx   ← the rose itself, unchanged, drawn on a dark instrument panel
      ControlPanel.tsx  ← the drill's menu / readout / result screens
    colregs/            ← COLREGS rules of the road drill
      index.tsx         ← state machine + the question-to-diagram maps
      constants.ts      ← 78 questions across 5 categories
      components/
        ScenarioCard.tsx  ← the answer options and the verdict
        LightDisplay.tsx  ← and the other diagrams, all Tailwind, all unchanged
  __tests__/            ← data-shape tests plus one server-render smoke test
```

## Architecture
- App.tsx is the shell. It wraps everything in PrefsProvider and ChartFrame, so
  the masthead, the ruled ground and the theme are continuous across every
  screen. A `Route` picks between the Hub, one drill, and settings.
- The **Hub is the syllabus**, not the drill list: `src/lib/syllabus.ts`
  describes every category under one of four sections — Navigation, Rules of
  the road, Signals and communication, Aids to navigation — and
  `drillTargetFor()` says which drill answers it. There are more hub cards than
  drills, on purpose.
- A card opens `CategoryDetail`, which is where a run is set up and started.
  It hands the drill a `focus` (which category) and a `start` (which of the
  drill's own modes, and a `SessionPlan`), and the drill goes straight into
  that run. The two shortcut buttons at the top of the hub skip the category
  screen and open a drill's own menu instead, unplanned.
- **The trail** is the navigation signpost: ChartFrame draws a breadcrumb
  under the masthead rule from a `trail: TrailStep[]` App computes per route.
  The hub is always the first step - the current location on the hub itself, a
  labelled "← Chart table" button everywhere else. It replaces the implicit
  "click the wordmark" convention (the wordmark still works), so CategoryDetail
  and SettingsScreen take `onBack` as optional and the shell no longer passes
  one; only the retired chart table drill, which has no trail, still does.
- Theme is set in Settings ("Display → Lighting"), not from the masthead - the
  old `.ct-chip` toggle there is gone. `DEFAULT_PREFS.theme` is `dark`: night
  helm is the first-run default, and `readPrefs` only overrides it for a theme
  that was stored explicitly. `src/__tests__/prefs.test.ts` pins that.
- Drills write to the shared progress ledger as they go; App re-reads it on the
  way back to the hub, which is what fills the mastery bars.
- Adding a drill = new folder + register in src/drills/index.ts + point a
  syllabus category at it in drillTargetFor().

## Sessions, plans and the ledger
- `src/lib/progress.ts` is the one ledger. It keeps a per-category tally
  (mastery, drilled total, last drilled) **and** a per-item tally keyed by
  question id, or by `'<gameType>:<abbr>'` for compass points. Category
  mastery cannot say *which* questions are costing it; the per-item grain is
  what the weak-spot list reads.
- A ledger written before the per-item grain existed reads back with an empty
  `items` and its category figures intact - `coerce()` handles it, and
  `src/__tests__/ledger.test.ts` pins that.
- `weakSpots()` is the report: lowest accuracy first, an item needs
  `WEAK_MIN_ATTEMPTS` answers before it can appear, and anything answered right
  every time is never listed. `isWeakItem()` is the stricter queue filter -
  missed more often than got right - used by "focus on weak spots".
- `src/lib/session.ts` holds `SessionPlan` (count / per-question timer / weak
  spots) and `planQueue()`, the single place a run's questions are chosen.
  **`DEFAULT_PLAN` must always mean "behave exactly as before":** with it,
  `planQueue` is a plain shuffle of the whole pool, no clock is set, and an
  unplanned colregs practice run still draws without end. `isDefaultPlan()` is
  what the drills check, and `src/__tests__/session.test.ts` pins the contract.
- Widening is deliberate: a weak-spots run puts the weak questions first and
  tops the queue up from the rest of the pool, so asking for 20 when only 6 are
  weak still gives 20.
- Exam mode's 15s per question is fixed and a plan does not override it; the
  plan's timer sets up a *timed practice* run instead. On the compass, a count
  applies to the exam only - practice and timed attack are sixty-second runs,
  not decks.

## Design system
The chart table: parchment and navy ink by day, brass on navy at the night helm.

- `src/lib/theme.ts` holds both palettes as CSS custom properties (`--ct-bg`,
  `--ct-ink`, `--ct-brass`, `--ct-stbd`, `--ct-port`, `--ct-line`, …). They are
  custom properties rather than Tailwind classes because the palette is not in
  the Tailwind config, and index.html — where a CDN Tailwind config would have
  to live — is finalized.
- `ChartFrame` puts those properties on its root and ships the one stylesheet
  everything draws from: `.ct-solid` / `.ct-ghost` / `.ct-link` buttons,
  `.ct-card`, `.ct-option`, `.ct-rule` (the dashed rope divider), `.ct-quizbody`
  and `.ct-rosebody` layouts, and `.ct-instrument`. Hover states live there as
  real CSS because inline styles cannot express `:hover`.
- The soundings row along the top edge is chart texture, declared in
  ChartFrame.
- `.ct-instrument` is the dark panel the diagrams sit on. The rose and the
  lights are drawn in white and signal colours and would vanish on the
  parchment, so that panel stays navy in both themes and reads as a lit
  instrument standing on the chart table.
- Fonts (Big Shoulders Stencil, IBM Plex Sans, IBM Plex Mono) are injected at
  runtime by `src/lib/fonts.ts`; every consumer declares a full fallback stack.

## Chart Table
`src/drills/charttable/` was a standalone drill that carried this design. The
design is now the site's, so the drill was retired and then deleted — its
`index.tsx`, `CategoryIndex`, `QuizScreen` and `ResultsScreen` are gone, and
the folder with them; see git history for the originals. Everything worth
keeping had already moved out: the theme, frame, visual panel, settings
screen, syllabus, progress ledger, citation reader and `CategoryDetail` now
live in `src/lib` and `src/components`. The `charttable:` localStorage key
prefixes in `prefs.tsx` and `progress.ts` stay as they are, for the same
reason the `nauticalmaster` namespace does.

## Drill Pattern
Every drill follows this structure:
- Practice / Exam modes
- Question prompt + visual aid + multiple choice answers
- Multiple-choice options are shuffled per draw, never rendered in bank order,
  and correctness is decided on option **text**, never on an index
- Shared scoring and timer logic pattern from compass drill

## Deployment
```
npm run build
npm run deploy
```

Pushing to main deploys automatically - see .github/workflows/ci.yml, which
runs tsc, build and test on every push and then runs this same `deploy` script
on main only. The workflow calls the npm script rather than restating the
gh-pages flags, so the --remove fix below lives in exactly one place. Running
`npm run deploy` by hand still works but is no longer necessary.

`npm run deploy` is `gh-pages -d dist --nojekyll` plus an explicit `--remove`
glob. gh-pages' default remove pattern (`.`) does not match dotfiles, so any
dotfile that ever lands on the gh-pages branch survives every later deploy —
that is how `.claude/settings.local.json` and `.gitignore` stayed publicly
served. The glob wipes stray dotfiles (but not `.git`); `.nojekyll` is
recreated after the remove step. Never deploy with `-d .` or `--dotfiles`.

## Planned Drills
- [x] compass — Compass & Relative Bearing
- [x] colregs — Rules of the Road
  - Navigation lights (visual ID)
  - Sound signals (blast-pattern diagram + Web Audio playback)
  - Vessel hierarchy (give-way scenarios)
  - Day shapes (visual ID)

## Notes
- The project was renamed NauticalMaster → Fathom (repo, Pages URL, Vite base,
  document title). The old /nauticalmaster/ URL is dead by design.
- vite.config.ts is finalized — do not modify it under any circumstances. The
  one authorized edit was the rename of the base path; it is now /fathom/ and
  must not be removed or changed again.
- Do not use @/ path aliases — they are not configured
- index.html is finalized - do not modify it under any circumstances. Its
  <title> still says NauticalMaster; that is deliberate and harmless — the real
  title is set at runtime by installTitle() in src/lib/title.ts, called from
  main.tsx, the same injection pattern used by installFavicon().
- localStorage keys still use the `nauticalmaster` namespace (src/lib/storage.ts)
  on purpose, so existing best scores survive the rename. Do not "fix" it.
- The local working directory is still named nauticalmaster; only the GitHub
  repo was renamed.
- Always run `npm run build` after changes and fix all TS errors before finishing

## PWA / runtime <head> injection
index.html is finalized, so everything that would normally be a tag in <head>
is injected at runtime from main.tsx instead. src/lib/favicon.ts is the original
of the pattern; title.ts and manifest.ts follow it.

- public/manifest.json - name/short_name Fathom, standalone, theme and
  background #0f172a. Every path in it (start_url, scope, icons) is RELATIVE, so
  it resolves against the manifest's own URL and picks up the /fathom/ base
  without hardcoding it. Do not make these absolute.
- public/sw.js - deliberately minimal: a pass-through fetch handler and nothing
  else, present only because installability requires a service worker. There is
  NO offline caching by design; the app still needs a connection to load.
- src/lib/serviceWorker.ts registers it, and skips registration unless
  import.meta.env.PROD - use `npm run preview` to exercise install behaviour
  locally, not `npm run dev`.
- src/vite-env.d.ts exists only to type import.meta.env. tsconfig.json has no
  "include", so it is picked up automatically.

## App icons
- public/icon-sounding-line.svg (shipped) and public/icon-depth-rings.svg are
  two concepts for the Fathom mark; public/icon-maskable.svg is the shipped one
  with a full-bleed background, scaled to 0.7 to stay inside the maskable safe
  zone.
- public/favicon.svg carries the same lead-line mark as the app icon, at
  slightly heavier stroke weights because a tab draws it at 16-32px. If the app
  icon ever changes, change this too - the tab and the installed app should not
  read as two different products. The ship's wheel it replaced is in git
  history.
- PNGs (icon-192, icon-512, icon-maskable-512) are generated by
  `node scripts/generate-icons.mjs [icon-name]`, which shells out to
  `npx sharp-cli` so no rasteriser is a project dependency. The build does not
  run it - regenerate and commit the PNGs whenever an icon SVG changes.
