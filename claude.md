# Fathom

Vite + React + TypeScript app deployed to GitHub Pages at:
https://iangopenbusinessai-lab.github.io/fathom/

## Stack
- Vite 6, React 19, TypeScript 5.8
- Tailwind CSS (CDN in index.html)
- lucide-react for icons
- gh-pages for deployment

## File Structure
```
src/
  main.tsx              ← entry point
  App.tsx               ← routes between Hub and active drill
  types.ts              ← shared types including DrillConfig
  drills/
    index.ts            ← DRILLS registry array
    compass/            ← compass & relative bearing drill
      index.tsx
      constants.ts
      CompassRose.tsx
      ControlPanel.tsx
    colregs/            ← COLREGS rules of the road drill
      index.tsx
      constants.ts      ← 36 questions across 4 categories
      components/
        ScenarioCard.tsx
        LightDisplay.tsx
        VesselScenario.tsx
  components/
    Hub.tsx             ← main menu, renders drill cards
```

## Architecture
- App.tsx holds `activeDrill: DrillConfig | null` — null = Hub, non-null = active drill
- DrillConfig: { id, title, description, component }
- Each drill is fully self-contained in its own folder
- Adding a drill = new folder + register in src/drills/index.ts

## Drill Pattern
Every drill follows this structure:
- Practice / Exam modes
- Question prompt + visual aid + multiple choice answers
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
