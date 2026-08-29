# Fathom

[![CI](https://github.com/iangopenbusinessai-lab/fathom/actions/workflows/ci.yml/badge.svg)](https://github.com/iangopenbusinessai-lab/fathom/actions/workflows/ci.yml)

Fathom is a drilling tool for the parts of seamanship that are pure recall:
the 32-point compass rose, relative bearings, and the COLREGs rules of the
road. It is aimed at anyone working toward a license or trying to get the
lights and shapes back after a few years away from them. The material is
drilled rather than taught.

Live at https://iangopenbusinessai-lab.github.io/fathom/

## What's in it

There are two drills. The compass drill covers the 32-point rose and the
relative bearing scale, both of which are generated from a table of 32 points
rather than a fixed question bank, so questions are drawn from the full circle
each run. You pick which of the two you want, and the points range from the
cardinals down through the by-points (NxE, SWxS, and the rest).

The COLREGs drill is a fixed bank of 78 questions across five categories:

| Category | Questions |
| --- | --- |
| Navigation Lights | 20 |
| Vessel Hierarchy | 20 |
| Sound Signals | 16 |
| Day Shapes | 16 |
| Vessel Types | 6 |

Sound signal questions render the blast pattern and play it back through the
Web Audio API. The light and day shape questions draw the vessel rather than
naming it, so the answer has to come from the display itself.

Practice mode in either drill is open-ended: no clock, questions keep coming,
and you quit when you want. Exam mode works through a fixed deck with 15
seconds on each question and shows your progress through it. The compass drill
adds a third option, Timed Attack, which is a 60-second run for score. Either
way the explanation and its rule citation appear as soon as you answer, in
every mode. Best scores are kept per drill and mode in localStorage, so they
survive a reload but do not follow you to another browser.

## Running it locally

```
npm install
npm run dev
```

The other scripts:

```
npm run build      # production build to dist/
npm run preview    # serve the built output, which is how to exercise PWA install behaviour
npm test           # vitest, single run
npm run test:watch # vitest in watch mode
```

Note that the service worker only registers in production builds, so `npm run
dev` will not show install behavior, so use `npm run preview` for that.

## Stack and deployment

React 19 and TypeScript on Vite 6, with Tailwind pulled from a CDN and
lucide-react for icons. Tests run under Vitest.

The app is installable as a PWA. There is a manifest and a service worker, but
the worker is deliberately minimal. Fathom still needs a connection to load.

Deployment is automatic. Pushing to `main` runs `.github/workflows/ci.yml`,
which installs on Node 22, then runs `npx tsc --noEmit`, `npm run build` and
`npm test` in that order. Only if all three pass does the job publish `dist/`
to the `gh-pages` branch. A failure anywhere above the deploy step means
nothing ships.

## On the rule citations

Questions cite the rule they come from, in the form `Rule 27(a)(ii)`. Those
citations were checked by hand against the USCG Navigation Rules and 33 CFR 83.
That audit was manual, so the test suite verifies only that
citations are well-formed and point at rule numbers that exist, not that a
given rule is the correct authority for its question. If you find a citation
that is shaped correctly but attached to the wrong rule, the tests will not
have caught it.
