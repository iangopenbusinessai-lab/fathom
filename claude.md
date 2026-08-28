# NauticalMaster

Vite + React + TypeScript app deployed to GitHub Pages at:
https://iangopenbusinessai-lab.github.io/nauticalmaster/

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
- vite.config.ts is finalized — do not modify it under any circumstances
- base path is /nauticalmaster/ in vite.config.ts — do not remove
- Do not use @/ path aliases — they are not configured
- index.html is finalized - do not modify it under any circumstances
- Always run `npm run build` after changes and fix all TS errors before finishing
