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
npx gh-pages -d dist --nojekyll
```

## Planned Drills
- [x] compass — Compass & Relative Bearing
- [x] colregs — Rules of the Road
  - Navigation lights (visual ID)
  - Sound signals (identify)
  - Vessel hierarchy (give-way scenarios)
  - Day shapes (visual ID)

## Notes
- vite.config.ts is finalized — do not modify it under any circumstances
- base path is /nauticalmaster/ in vite.config.ts — do not remove
- Do not use @/ path aliases — they are not configured
- index.html loads Tailwind from CDN — do not move to PostCSS
- Always run `npm run build` after changes and fix all TS errors before finishing
