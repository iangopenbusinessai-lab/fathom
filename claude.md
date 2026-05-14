{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 # NauticalMaster\
\
Vite + React + TypeScript app deployed to GitHub Pages at:\
https://iangopenbusinessai-lab.github.io/nauticalmaster/\
\
## Stack\
- Vite 6, React 19, TypeScript 5.8\
- Tailwind CSS (CDN in index.html)\
- lucide-react for icons\
- gh-pages for deployment\
\
## File Structure\
src/\
  main.tsx              \uc0\u8592  entry point\
  App.tsx               \uc0\u8592  routes between Hub and active drill\
  types.ts              \uc0\u8592  shared types including DrillConfig\
  drills/\
    index.ts            \uc0\u8592  DRILLS registry array\
    compass/            \uc0\u8592  compass & relative bearing drill\
      index.tsx\
      constants.ts\
      CompassRose.tsx\
      ControlPanel.tsx\
  components/\
    Hub.tsx             \uc0\u8592  main menu, renders drill cards\
\
## Architecture\
- App.tsx holds `activeDrill: DrillConfig | null` \'97 null = Hub, non-null = active drill\
- DrillConfig: \{ id, title, description, component \}\
- Each drill is fully self-contained in its own folder\
- Adding a drill = new folder + register in src/drills/index.ts\
\
## Drill Pattern\
Every drill follows this structure:\
- Practice / Timed / Exam modes\
- Question prompt + visual + multiple choice answers\
- Shared scoring and timer logic pattern from compass drill\
\
## Deployment\
npm run build\
npx gh-pages -d dist --nojekyll\
\
## Planned Drills\
- [x] compass \'97 Compass & Relative Bearing\
- [ ] colregs \'97 Rules of the Road\
  - Navigation lights (visual ID)\
  - Sound signals (identify)\
  - Vessel hierarchy (give-way scenarios)\
  - Day shapes (visual ID)\
\
## Notes\
- base path is /nauticalmaster/ in vite.config.ts \'97 do not remove\
- Do not use @/ path aliases \'97 they are not configured\
- index.html loads Tailwind from CDN \'97 do not move to PostCSS\
- Always run `npm run build` after changes and fix all TS errors before finishing}