# Fathom

Vite + React + TypeScript app deployed to GitHub Pages at:
https://iangopenbusinessai-lab.github.io/fathom/

## Stack
- The chart-table design system: CSS custom properties + a stylesheet in
  ChartFrame. See "Design system" below.
- Tailwind CSS (CDN in index.html) — now only inside the drill *diagrams*
  (CompassRose, LightDisplay and friends), which were never restyled.

## Architecture
- App.tsx is the shell. It wraps everything in PrefsProvider and ChartFrame, so
  the masthead, the ruled ground and the theme are continuous across every
  screen. A `Route` picks between the Hub, a section, a category, one drill,
  About and Settings.
- The **Hub is a welcome screen**, not the whole index: intro, stats, the two
  drill shortcuts, then **one card per SECTION**. `src/lib/syllabus.ts`
  describes every category under one of five sections — Navigation, Rules of
  the road, Signals and communication, Aids to navigation, Seamanship — and
  `sections()` is what the hub and About both read, so adding a sixth to
  SECTION_ORDER adds a card and an About line with no other edit. Nothing
  hardcodes the section count.
- A section card opens `SectionScreen`, that section's own category list.
  `drillTargetFor()` says which drill answers a category, and there are more
  cards than drills, on purpose.
- A category card opens `CategoryDetail`, which is where a run is set up and
  started.
  It hands the drill a `focus` (which category) and a `start` (which of the
  drill's own modes, and a `SessionPlan`), and the drill goes straight into
  that run. The two shortcut buttons at the top of the hub skip both the
  section and the category screen and open a drill's own menu, unplanned.
- **The trail** is the navigation signpost: ChartFrame draws a breadcrumb
  under the masthead rule from a `trail: TrailStep[]` App computes per route.
  It goes four deep - Chart table / Section / Category / Drill - and every
  step but the last is clickable. The hub is always the first step: the
  current location on the hub itself, a labelled "Chart table" button
  everywhere else. It replaces the implicit
  "click the wordmark" convention (the wordmark still works), so CategoryDetail
  and SettingsScreen take `onBack` as optional and the shell no longer passes
  one; only the retired chart table drill, which has no trail, still does.
- The masthead carries a three-button group: About, Settings, Feedback. The
  feedback link is `FEEDBACK_FORM_URL` in `src/lib/links.ts` and nowhere else;
  while it still contains the PLACEHOLDER sentinel, `feedbackReady()` is false
  and the button renders as unavailable rather than as a dead link. Swapping in
  the real form URL is that one line.
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
- Fonts (Big Shoulders Stencil, Fraunces, IBM Plex Sans, IBM Plex Mono) are
  injected at runtime by `src/lib/fonts.ts`; every consumer declares a full
  fallback stack.
- **`STENCIL` is the FATHOM wordmark and nothing else.** Every heading that
  used to be stencilled - section headers, screen titles, card titles - is
  `DISPLAY` (Fraunces), set through the `.ct-display` class. Screen titles are
  sentence case now: the uppercase and the wide letterspacing were there to
  suit a condensed stencil. `renderSmoke.test.tsx` pins the wordmark to the
  stencil face so a later sweep cannot take it too.
- The sheet is responsive: 760px, stepping to 960 / 1180 / 1280 at 1024 /
  1440 / 1800. Card grids (`.ct-cardgrid`) gain columns with it; prose caps
  itself at `.ct-measure`, and the quiz and rose bodies cap at 1000px so a
  wide window makes the diagram bigger rather than the option text longer.

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

PWA plumbing (manifest, service worker, runtime <head> injection) and the app
icon/favicon workflow live in the `fathom-assets` skill, not here.

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
