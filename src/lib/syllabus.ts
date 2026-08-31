import { ColregsCategory, COLREGS_QUESTIONS_BY_CATEGORY } from '../drills/colregs/constants';

// The chart table indexes the syllabus, not just the question bank, so a
// category can appear here before it has any questions behind it. `status`
// says which of the three it is:
//
//   live    - drilled here, from the real COLREGS bank in ../colregs/constants
//   compass - bearings work, which the separate Compass drill already covers.
//             Those questions are generated from the 32-point tables rather
//             than being cited multiple-choice, so they cannot be run through
//             this drill's quiz screen. The card names where they live.
//   soon    - on the syllabus, no questions written yet
//
// Nothing here hardcodes a question count. A live category's count is read
// from the bank, so it cannot drift from the content.
export type CategoryStatus = 'live' | 'compass' | 'soon';

export interface ChartCategory {
  id: string;
  name: string;
  section: string;
  rule: string;
  status: CategoryStatus;
  blurb: string;
  topics: string[];
  // Only set for status 'live' - the bank category this card drills.
  source?: ColregsCategory;
}

export const CATEGORIES: ChartCategory[] = [
  {
    id: 'compass',
    name: 'Compass bearings',
    section: 'Navigation',
    rule: 'Bearings and points',
    status: 'compass',
    blurb:
      'True, magnetic and compass bearings, the 32-point system, and converting between them without a calculator.',
    topics: [
      'Cardinal and intercardinal points',
      'Variation and deviation',
      'True / magnetic / compass conversion',
      'Reciprocal bearings',
    ],
  },
  {
    id: 'relative',
    name: 'Relative bearings',
    section: 'Navigation',
    rule: 'Rules 7, 13, 14',
    status: 'compass',
    blurb:
      'Reading another vessel off your own head: bearings relative to the bow, constant-bearing situations, and what each means for risk of collision.',
    topics: [
      'Ahead, bow, beam, quarter, astern',
      'Relative vs true bearing',
      'Constant bearing, decreasing range',
      'Head-on, crossing, overtaking',
    ],
  },
  {
    id: 'hierarchy',
    name: 'Vessel hierarchy',
    section: 'Rules of the road',
    rule: 'Rule 18',
    status: 'live',
    source: 'vessel-hierarchy',
    blurb:
      'Who keeps out of whose way. The pecking order from not under command down to seaplanes, and the exceptions in narrow channels and traffic schemes.',
    topics: [
      'Rule 18 order of precedence',
      'Not under command',
      'Restricted in ability to manoeuvre',
      'Constrained by draught',
      'Give-way and stand-on duties',
    ],
  },
  {
    id: 'lights',
    name: 'Navigation lights',
    section: 'Rules of the road',
    rule: 'Rules 20-31',
    status: 'live',
    source: 'navigation-lights',
    blurb:
      'Light identification by night: masthead lights, sidelights, sternlights and the all-round combinations that name a vessel at a glance.',
    topics: [
      'Arcs of visibility',
      'Towing and pushing',
      'Fishing and trawling',
      'NUC, RAM, CBD',
      'Anchored and aground',
    ],
  },
  {
    id: 'types',
    name: 'Vessel types',
    section: 'Rules of the road',
    rule: 'Rules 3, 27',
    status: 'live',
    source: 'vessel-types',
    blurb:
      'Definitions that decide everything else: what counts as a power-driven vessel, a sailing vessel, a vessel engaged in fishing, a WIG craft.',
    topics: [
      'Rule 3 definitions',
      'Towing and dredging',
      'Mineclearance',
      'Pilot vessels',
      'WIG and seaplanes',
    ],
  },
  {
    id: 'shapes',
    name: 'Day shapes',
    section: 'Rules of the road',
    rule: 'Rules 24-30',
    status: 'live',
    source: 'day-shapes',
    blurb:
      'Balls, cones, cylinders and diamonds - the daytime equivalent of the light combinations, and the ones candidates most often reverse.',
    topics: [
      'Anchor ball and aground',
      'Ball-diamond-ball',
      'Cones and hourglass',
      'Cylinder for CBD',
      'Sail under power',
    ],
  },
  {
    id: 'sound',
    name: 'Sound signals',
    section: 'Signals and communication',
    rule: 'Rules 32-35',
    status: 'live',
    source: 'sound-signals',
    blurb:
      'Manoeuvring and warning signals in sight of one another, and the fog signals for every vessel type in restricted visibility.',
    topics: [
      'Short and prolonged blasts',
      'Overtaking in a narrow channel',
      'Doubt signal',
      'Fog signals underway',
      'Anchored and aground signals',
    ],
  },
  {
    id: 'distress',
    name: 'Distress signals',
    section: 'Signals and communication',
    rule: 'Annex IV',
    status: 'soon',
    blurb: 'Recognised distress signals under Annex IV.',
    topics: ['Annex IV signals', 'Flares and EPIRB', 'Misuse of distress signals'],
  },
  {
    id: 'vhf',
    name: 'VHF procedure',
    section: 'Signals and communication',
    rule: 'GMDSS / SMCP',
    status: 'soon',
    blurb: 'Channel discipline, priority calls and standard marine phrases.',
    topics: ['Channel 16 and DSC', 'Mayday / Pan-pan / Securite', 'Standard phrases'],
  },
  {
    id: 'buoyage',
    name: 'Buoyage / IALA marks',
    section: 'Aids to navigation',
    rule: 'IALA A and B',
    status: 'soon',
    blurb:
      'Lateral, cardinal, isolated danger, safe water and special marks in both IALA regions.',
    topics: ['Region A and B laterals', 'Cardinal marks', 'Isolated danger', 'Light rhythms'],
  },
  {
    id: 'chart',
    name: 'Chart symbols',
    section: 'Aids to navigation',
    rule: 'INT 1 / Chart 5011',
    status: 'soon',
    blurb: 'Symbols, abbreviations and terms from Chart 5011.',
    topics: [
      'Depths and drying heights',
      'Seabed and hazards',
      'Light and fog signal notation',
    ],
  },
];

export const SECTION_ORDER: string[] = [
  'Navigation',
  'Rules of the road',
  'Signals and communication',
  'Aids to navigation',
];

export function categoryById(id: string): ChartCategory | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

// Question count for a card, read from the bank rather than stored, so adding
// a question to ../colregs/constants updates the chart table for free.
export function questionCount(cat: ChartCategory): number {
  if (cat.status !== 'live' || !cat.source) return 0;
  return COLREGS_QUESTIONS_BY_CATEGORY[cat.source].length;
}

export const LIVE_CATEGORIES: ChartCategory[] = CATEGORIES.filter(
  (c) => c.status === 'live'
);

// The share of a run that has to be right for it to read as a pass.
export const PASS_MARK = 0.7;

// Where a card on the hub leads. The syllabus is the site's index now, so this
// is the one place that knows which drill answers which category - the hub
// just follows it, and a category that has no drill behind it yet says so by
// returning null rather than by the hub special-casing its status.
export interface DrillTarget {
  drillId: string;
  focus: string;
}

export function drillTargetFor(cat: ChartCategory): DrillTarget | null {
  // Bearings are generated from the 32-point tables rather than being written
  // multiple-choice, so they are drilled by the compass rose. The card id is
  // 'compass' or 'relative', which is exactly the game type that drill takes.
  if (cat.status === 'compass') return { drillId: 'compass', focus: cat.id };
  if (cat.status === 'live' && cat.source) return { drillId: 'colregs', focus: cat.source };
  return null;
}

// The reverse of `source`: which syllabus card a bank category belongs to.
// The drills record progress against syllabus ids, so this is what lets a
// colregs run land on the right card's mastery bar.
export function categoryBySource(source: ColregsCategory): ChartCategory | undefined {
  return CATEGORIES.find((c) => c.source === source);
}
