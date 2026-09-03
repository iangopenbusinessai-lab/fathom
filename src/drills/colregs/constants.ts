export type ColregsCategory =
  | 'navigation-lights'
  | 'sound-signals'
  | 'vessel-hierarchy'
  | 'day-shapes'
  | 'vessel-types'
  | 'anchor-types'
  | 'buoyage'
  | 'chart-symbols'
  | 'distress-signals'
  | 'vhf-procedure';

export interface ColregsQuestion {
  id: string;
  category: ColregsCategory;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

// Not everything in this bank is governed by the COLREGS. Anchor types are
// seamanship knowledge and buoyage is a separate international system: there
// is no rule number to cite for either, so those explanations carry a topic
// label instead ("Ground tackle:", "IALA-B:") and the citation format test
// holds them to that shape rather than to "Rule N(x)".
//
// This list is the single place that says which categories are outside the
// rules, so the next one - PFD types, fire safety - is added here and every
// consumer follows. See src/lib/citation.ts and
// src/__tests__/citationFormat.test.ts.
export const NON_COLREGS_CATEGORIES: ColregsCategory[] = [
  'anchor-types',
  'buoyage',
  'chart-symbols',
  'vhf-procedure',
];

// Distress signals are NOT in that list, and the near miss is worth saying out
// loud: Annex IV to the Convention is headed "Distress Signals" and Rule 37
// sends a vessel in distress to it, so that category has a real citation and
// takes the ordinary path. VHF procedure sits beside it in the same section
// and is the opposite case - channel discipline and the three priority calls
// are radio regulation, not COLREGS, and no rule number covers them.

export function isColregsGoverned(question: ColregsQuestion): boolean {
  return !NON_COLREGS_CATEGORIES.includes(question.category);
}

// The topic labels a non-COLREGS explanation may open with, standing where the
// rule citation stands on a governed one. Closed set for the same reason the
// citation is a fixed shape: so a later edit cannot quietly invent a label
// that renders as a badge nobody recognises.
//
// Each names the actual authority the content rests on, which is the whole
// point of the badge - "IALA-B" is the buoyage region the United States lies
// in, "US ATON" is the Coast Guard's own aid-to-navigation practice on top of
// it (the ICW overlay lives there and nowhere in IALA), and the two ground
// tackle labels are seamanship, which has no publication behind it at all.
// "Chart No. 1" is the NOAA and NGA publication every symbol and abbreviation
// in the chart symbols bank is read out of, and "Radio procedure" covers the
// VHF calls, which are governed by radio regulation rather than by the Rules.
export const TOPIC_LABELS = [
  'Ground tackle',
  'Holding ground',
  'IALA-B',
  'US ATON',
  'Chart No. 1',
  'Radio procedure',
] as const;

// --- NAVIGATION LIGHTS (20 questions) ---

const navigationLightsQuestions: ColregsQuestion[] = [
  {
    id: 'nl-01',
    category: 'navigation-lights',
    prompt: 'What color is a vessel\'s starboard sidelight?',
    options: ['Red', 'Green', 'White', 'Yellow'],
    correctAnswer: 'Green',
    explanation:
      'Rule 21: The starboard sidelight is green, showing from dead ahead to 22.5° abaft the beam on the starboard side (112.5° arc).',
  },
  {
    id: 'nl-02',
    category: 'navigation-lights',
    prompt: 'What color is a vessel\'s port sidelight?',
    options: ['Red', 'Green', 'White', 'Yellow'],
    correctAnswer: 'Red',
    explanation:
      'Rule 21: The port sidelight is red, showing from dead ahead to 22.5° abaft the beam on the port side (112.5° arc).',
  },
  {
    id: 'nl-03',
    category: 'navigation-lights',
    prompt: 'What is the arc of visibility for a vessel\'s masthead (steaming) light?',
    options: ['112.5°', '135°', '225°', '360°'],
    correctAnswer: '225°',
    explanation:
      'Rule 21: The masthead light shows an unbroken arc of 225°, from dead ahead to 22.5° abaft the beam on each side.',
  },
  {
    id: 'nl-04',
    category: 'navigation-lights',
    prompt: 'A power-driven vessel underway and making way must display which lights at night?',
    options: [
      'Masthead light, sidelights, and sternlight',
      'Sidelights and sternlight only',
      'Two masthead lights and sidelights',
      'All-round white light and sidelights',
    ],
    correctAnswer: 'Masthead light, sidelights, and sternlight',
    explanation:
      'Rule 23: A power-driven vessel underway shall exhibit a masthead light forward, sidelights, and a sternlight.',
  },
  {
    id: 'nl-05',
    category: 'navigation-lights',
    prompt: 'What lights does a vessel at anchor less than 50 metres in length display at night?',
    options: [
      'One all-round white light',
      'Two all-round white lights (fore and aft)',
      'Red over white all-round lights',
      'Masthead light only',
    ],
    correctAnswer: 'One all-round white light',
    explanation:
      'Rule 30: A vessel less than 50 metres at anchor shows one all-round white light where best seen.',
  },
  {
    id: 'nl-06',
    category: 'navigation-lights',
    prompt: 'What is the arc of visibility for a sternlight?',
    options: ['112.5°', '135°', '225°', '360°'],
    correctAnswer: '135°',
    explanation:
      'Rule 21: The sternlight is white and shows over an arc of 135°, from dead astern to 67.5° on each side.',
  },
  {
    id: 'nl-07',
    category: 'navigation-lights',
    prompt: 'A vessel not under command at night displays which lights?',
    options: [
      'Two all-round red lights in a vertical line',
      'Three all-round red lights in a vertical line',
      'Red over white all-round lights in a vertical line',
      'Two all-round white lights in a vertical line',
    ],
    correctAnswer: 'Two all-round red lights in a vertical line',
    explanation:
      'Rule 27: A vessel not under command shows two all-round red lights in a vertical line where best seen.',
  },
  {
    id: 'nl-08',
    category: 'navigation-lights',
    prompt: 'A vessel engaged in towing where the tow exceeds 200 metres in length must show how many masthead lights?',
    options: ['One', 'Two', 'Three', 'Four'],
    correctAnswer: 'Three',
    explanation:
      'Rule 24: When the length of the tow exceeds 200 metres, the towing vessel shows three masthead lights in a vertical line.',
  },
  {
    id: 'nl-09',
    category: 'navigation-lights',
    prompt: 'What lights does a vessel constrained by her draft display in addition to normal power-driven vessel lights?',
    options: [
      'Three all-round red lights in a vertical line',
      'Three all-round white lights in a vertical line',
      'Red over white over red all-round lights',
      'Two all-round red lights',
    ],
    correctAnswer: 'Three all-round red lights in a vertical line',
    explanation:
      'Rule 28: A vessel constrained by her draft may additionally exhibit three all-round red lights in a vertical line.',
  },
  {
    id: 'nl-10',
    category: 'navigation-lights',
    prompt: 'A vessel engaged in pilotage duty shows which all-round lights?',
    options: [
      'White over red in a vertical line',
      'Red over white in a vertical line',
      'Two all-round white lights',
      'White over green in a vertical line',
    ],
    correctAnswer: 'White over red in a vertical line',
    explanation:
      'Rule 29: A pilot vessel on duty shows an all-round white light over an all-round red light at or near the masthead.',
  },
  {
    id: 'nl-11',
    category: 'navigation-lights',
    prompt: 'A sailing vessel underway displays which lights?',
    options: [
      'Sidelights and a sternlight',
      'Sidelights, a sternlight and one masthead light',
      'Two all-round red lights and sidelights',
      'An all-round white light only',
    ],
    correctAnswer: 'Sidelights and a sternlight',
    explanation:
      'Rule 25(a): A sailing vessel underway exhibits sidelights and a sternlight. She carries no masthead (steaming) light - that light marks a vessel under power.',
  },
  {
    id: 'nl-12',
    category: 'navigation-lights',
    prompt: 'A power-driven vessel of less than 12 metres in length may, instead of the full set, display which lights?',
    options: [
      'An all-round white light and sidelights',
      'An all-round white light alone',
      'A masthead light and a sternlight only',
      'Two all-round white lights in a vertical line',
    ],
    correctAnswer: 'An all-round white light and sidelights',
    explanation:
      'Rule 23(d)(i): A power-driven vessel of less than 12 metres in length may exhibit an all-round white light and sidelights in place of the masthead light, sidelights and sternlight.',
  },
  {
    id: 'nl-13',
    category: 'navigation-lights',
    prompt: 'A sailing vessel of less than 20 metres may combine her sidelights and sternlight in what single fitting?',
    options: [
      'One tricolour lantern at or near the top of the mast',
      'One all-round white light at the masthead',
      'One all-round red light at the masthead',
      'A single combined lantern at the stemhead',
    ],
    correctAnswer: 'One tricolour lantern at or near the top of the mast',
    explanation:
      'Rule 25(b): In a sailing vessel of less than 20 metres the sidelights and sternlight may be combined in one lantern carried at or near the top of the mast. An observer still sees the same three sectors - red, green and white.',
  },
  {
    id: 'nl-14',
    category: 'navigation-lights',
    prompt: 'A vessel engaged in trawling displays which pair of all-round lights in a vertical line?',
    options: [
      'Green over white',
      'Red over white',
      'White over red',
      'Red over green',
    ],
    correctAnswer: 'Green over white',
    explanation:
      'Rule 26(b)(i): A vessel engaged in trawling shows two all-round lights in a vertical line, the upper green and the lower white, plus sidelights and a sternlight when making way through the water.',
  },
  {
    id: 'nl-15',
    category: 'navigation-lights',
    prompt: 'A vessel engaged in fishing OTHER than trawling displays which pair of all-round lights in a vertical line?',
    options: [
      'Red over white',
      'Green over white',
      'White over red',
      'Red over red',
    ],
    correctAnswer: 'Red over white',
    explanation:
      'Rule 26(c)(i): A vessel engaged in fishing other than trawling shows two all-round lights in a vertical line, the upper red and the lower white. Remember it as "red over white, fishing at night".',
  },
  {
    id: 'nl-16',
    category: 'navigation-lights',
    prompt: 'A vessel restricted in her ability to manoeuvre displays which three all-round lights in a vertical line?',
    options: [
      'Red, white, red',
      'Red, red, red',
      'White, red, white',
      'Green, white, green',
    ],
    correctAnswer: 'Red, white, red',
    explanation:
      'Rule 27(b)(i): A vessel restricted in her ability to manoeuvre shows three all-round lights in a vertical line - the highest and lowest red, the middle white. Remember it as "red, white, red - restricted ahead".',
  },
  {
    id: 'nl-17',
    category: 'navigation-lights',
    prompt: 'What light does a towing vessel show above her sternlight?',
    options: [
      'A yellow towing light',
      'A second white sternlight',
      'An all-round red light',
      'A flashing blue light',
    ],
    correctAnswer: 'A yellow towing light',
    explanation:
      'Rule 24(a)(iv): A vessel towing exhibits a yellow towing light in a vertical line above her sternlight. It has the same 135 degree arc as the sternlight it sits above.',
  },
  {
    id: 'nl-18',
    category: 'navigation-lights',
    prompt: 'A vessel at anchor of 50 metres or more in length displays how many anchor lights, and where?',
    options: [
      'Two - one in the fore part and a lower one at or near the stern',
      'One - in the fore part only',
      'Two - both at the masthead in a vertical line',
      'Three - in a vertical line at the masthead',
    ],
    correctAnswer: 'Two - one in the fore part and a lower one at or near the stern',
    explanation:
      'Rule 30(a): A vessel at anchor exhibits an all-round white light in the fore part and, if 50 metres or more in length, a second all-round white light at or near the stern and lower than the forward one.',
  },
  {
    id: 'nl-19',
    category: 'navigation-lights',
    prompt: 'An air-cushion vessel operating in the non-displacement mode exhibits what additional light?',
    options: [
      'An all-round flashing yellow light',
      'An all-round flashing blue light',
      'An all-round flashing red light',
      'A second masthead light',
    ],
    correctAnswer: 'An all-round flashing yellow light',
    explanation:
      'Rule 23(b): An air-cushion vessel operating in the non-displacement mode exhibits, in addition to the lights of a power-driven vessel, an all-round flashing yellow light.',
  },
  {
    id: 'nl-20',
    category: 'navigation-lights',
    prompt: 'Over what arc is each sidelight visible?',
    options: ['112.5 degrees', '135 degrees', '225 degrees', '360 degrees'],
    correctAnswer: '112.5 degrees',
    explanation:
      'Rule 21(b): Each sidelight shows an unbroken light over an arc of 112.5 degrees, from right ahead to 22.5 degrees abaft the beam on its own side. The two sidelights and the 135 degree sternlight together make up the full 360.',
  },
];

// --- SOUND SIGNALS (16 questions) ---

const soundSignalsQuestions: ColregsQuestion[] = [
  {
    id: 'ss-01',
    category: 'sound-signals',
    prompt: 'In sight of one another, what sound signal indicates a vessel is altering course to starboard?',
    options: ['One short blast', 'Two short blasts', 'Three short blasts', 'One prolonged blast'],
    correctAnswer: 'One short blast',
    explanation:
      'Rule 34: One short blast means "I am altering my course to starboard."',
  },
  {
    id: 'ss-02',
    category: 'sound-signals',
    prompt: 'What sound signal indicates a vessel is altering course to port?',
    options: ['One short blast', 'Two short blasts', 'Three short blasts', 'One prolonged blast'],
    correctAnswer: 'Two short blasts',
    explanation:
      'Rule 34: Two short blasts mean "I am altering my course to port."',
  },
  {
    id: 'ss-03',
    category: 'sound-signals',
    prompt: 'What sound signal indicates a vessel\'s engines are going astern?',
    options: ['One short blast', 'Two short blasts', 'Three short blasts', 'One prolonged blast'],
    correctAnswer: 'Three short blasts',
    explanation:
      'Rule 34: Three short blasts mean "I am operating astern propulsion." This does not necessarily mean the vessel is moving astern.',
  },
  {
    id: 'ss-04',
    category: 'sound-signals',
    prompt: 'A power-driven vessel underway in restricted visibility must sound which signal at intervals of not more than 2 minutes?',
    options: [
      'One prolonged blast',
      'Two prolonged blasts',
      'One prolonged followed by two short blasts',
      'Three short blasts',
    ],
    correctAnswer: 'One prolonged blast',
    explanation:
      'Rule 35: A power-driven vessel making way through the water in restricted visibility sounds one prolonged blast at intervals of not more than 2 minutes.',
  },
  {
    id: 'ss-05',
    category: 'sound-signals',
    prompt: 'A power-driven vessel underway but stopped (not making way) in restricted visibility sounds which signal?',
    options: [
      'One prolonged blast',
      'Two prolonged blasts',
      'One prolonged followed by two short blasts',
      'Three short blasts',
    ],
    correctAnswer: 'Two prolonged blasts',
    explanation:
      'Rule 35: A power-driven vessel underway but stopped and making no way through the water sounds two prolonged blasts at intervals of not more than 2 minutes.',
  },
  {
    id: 'ss-06',
    category: 'sound-signals',
    prompt: 'A vessel not under command, restricted in ability to maneuver, constrained by draft, sailing, fishing, or towing sounds which fog signal?',
    options: [
      'One prolonged blast every 2 minutes',
      'Two prolonged blasts every 2 minutes',
      'One prolonged followed by two short blasts every 2 minutes',
      'Three short blasts every 2 minutes',
    ],
    correctAnswer: 'One prolonged followed by two short blasts every 2 minutes',
    explanation:
      'Rule 35: These vessels sound one prolonged followed by two short blasts at intervals of not more than 2 minutes.',
  },
  {
    id: 'ss-07',
    category: 'sound-signals',
    prompt: 'What is the duration of a "short blast"?',
    options: ['About 1 second', 'About 2 seconds', '4 to 6 seconds', '8 to 10 seconds'],
    correctAnswer: 'About 1 second',
    explanation:
      'Rule 32(b): A short blast is a blast of about one second duration.',
  },
  {
    id: 'ss-08',
    category: 'sound-signals',
    prompt: 'A vessel at anchor in restricted visibility rings a bell rapidly for about 5 seconds at intervals of not more than how many minutes?',
    options: ['1 minute', '2 minutes', '3 minutes', '5 minutes'],
    correctAnswer: '1 minute',
    explanation:
      'Rule 35: A vessel at anchor sounds a rapid ringing of the bell for about 5 seconds at intervals of not more than 1 minute.',
  },
  {
    id: 'ss-09',
    category: 'sound-signals',
    prompt: 'What does a signal of at least five short and rapid blasts mean?',
    options: [
      'I doubt whether you are taking sufficient action to avoid collision',
      'I am altering course to starboard',
      'I am aground',
      'I intend to overtake you',
    ],
    correctAnswer: 'I doubt whether you are taking sufficient action to avoid collision',
    explanation:
      'Rule 34(d): When vessels in sight of one another fail to understand each other\'s intentions, or one doubts whether sufficient action is being taken to avoid collision, she sounds at least five short and rapid blasts - the doubt or wake-up signal.',
  },
  {
    id: 'ss-10',
    category: 'sound-signals',
    prompt: 'A vessel nearing a bend where other vessels may be obscured sounds which signal?',
    options: [
      'One prolonged blast',
      'Two prolonged blasts',
      'One short blast',
      'Five short blasts',
    ],
    correctAnswer: 'One prolonged blast',
    explanation:
      'Rule 34(e): A vessel nearing a bend or an area of a channel where other vessels may be obscured sounds one prolonged blast, to be answered with a prolonged blast by any approaching vessel within hearing.',
  },
  {
    id: 'ss-11',
    category: 'sound-signals',
    prompt: 'In a narrow channel, which signal means "I intend to overtake you on your starboard side"?',
    options: [
      'Two prolonged blasts followed by one short blast',
      'Two prolonged blasts followed by two short blasts',
      'One prolonged blast followed by one short blast',
      'Three short blasts',
    ],
    correctAnswer: 'Two prolonged blasts followed by one short blast',
    explanation:
      'Rule 34(c)(i): In a narrow channel or fairway, a vessel intending to overtake sounds two prolonged blasts followed by one short blast to mean "I intend to overtake you on your starboard side".',
  },
  {
    id: 'ss-12',
    category: 'sound-signals',
    prompt: 'In a narrow channel, which signal means "I intend to overtake you on your port side"?',
    options: [
      'Two prolonged blasts followed by two short blasts',
      'Two prolonged blasts followed by one short blast',
      'Two short blasts',
      'One prolonged and two short blasts',
    ],
    correctAnswer: 'Two prolonged blasts followed by two short blasts',
    explanation:
      'Rule 34(c)(i): Two prolonged blasts followed by two short blasts means "I intend to overtake you on your port side". One short for starboard, two short for port - the same convention as the Rule 34(a) manoeuvring signals.',
  },
  {
    id: 'ss-13',
    category: 'sound-signals',
    prompt: 'How does the vessel about to be overtaken signal her agreement to the overtaking?',
    options: [
      'One prolonged, one short, one prolonged and one short blast, in that order',
      'Two prolonged blasts',
      'Three short blasts',
      'Five short and rapid blasts',
    ],
    correctAnswer: 'One prolonged, one short, one prolonged and one short blast, in that order',
    explanation:
      'Rule 34(c)(ii): The vessel about to be overtaken, if in agreement, sounds one prolonged, one short, one prolonged and one short blast in that order. Anything else - in particular five short blasts - is not agreement.',
  },
  {
    id: 'ss-14',
    category: 'sound-signals',
    prompt: 'A vessel at anchor may sound which signal to warn an approaching vessel of her position?',
    options: [
      'One short, one prolonged and one short blast',
      'One prolonged blast',
      'Two prolonged blasts',
      'Three short blasts',
    ],
    correctAnswer: 'One short, one prolonged and one short blast',
    explanation:
      'Rule 35(g): A vessel at anchor may in addition sound three blasts in succession - short, prolonged, short - to give warning of her position and of the possibility of collision to an approaching vessel.',
  },
  {
    id: 'ss-15',
    category: 'sound-signals',
    prompt: 'A vessel aground signals her bell how, in restricted visibility?',
    options: [
      'Three separate strokes before and after the rapid ringing of the bell',
      'Rapid ringing of the bell alone, as if at anchor',
      'Two separate strokes after the rapid ringing only',
      'Continuous ringing for one minute',
    ],
    correctAnswer: 'Three separate strokes before and after the rapid ringing of the bell',
    explanation:
      'Rule 35(h): A vessel aground gives the bell signal of a vessel at anchor and in addition three separate and distinct strokes on the bell immediately before and after the rapid ringing.',
  },
  {
    id: 'ss-16',
    category: 'sound-signals',
    prompt: 'What is the duration of a "prolonged blast"?',
    options: [
      'From four to six seconds',
      'About one second',
      'From two to three seconds',
      'About ten seconds',
    ],
    correctAnswer: 'From four to six seconds',
    explanation:
      'Rule 32(c): A prolonged blast is a blast of from four to six seconds duration. Rule 32(b) defines a short blast as about one second.',
  },
];

// --- VESSEL HIERARCHY (20 questions) ---

const vesselHierarchyQuestions: ColregsQuestion[] = [
  {
    id: 'vh-01',
    category: 'vessel-hierarchy',
    prompt: 'According to the COLREGS stand-on/give-way hierarchy, which vessel type has the highest priority (least burdened)?',
    options: [
      'Vessel not under command',
      'Vessel constrained by her draft',
      'Vessel engaged in fishing',
      'Sailing vessel',
    ],
    correctAnswer: 'Vessel not under command',
    explanation:
      'Rule 18: The vessel not under command (NUC) sits at the top of the hierarchy. All other vessels must keep clear of an NUC vessel.',
  },
  {
    id: 'vh-02',
    category: 'vessel-hierarchy',
    prompt: 'A sailing vessel underway must keep clear of which of the following?',
    options: [
      'A power-driven vessel',
      'A vessel restricted in ability to maneuver',
      'A vessel constrained by her draft',
      'Both a RAM vessel and a vessel constrained by her draft',
    ],
    correctAnswer: 'Both a RAM vessel and a vessel constrained by her draft',
    explanation:
      'Rule 18: A sailing vessel must keep out of the way of vessels not under command, restricted in ability to maneuver, and engaged in fishing. She must also keep clear of a vessel constrained by her draft.',
  },
  {
    id: 'vh-03',
    category: 'vessel-hierarchy',
    prompt: 'In a crossing situation, a power-driven vessel has another vessel on her starboard side. Which vessel is the give-way vessel?',
    options: [
      'The vessel on the starboard side is give-way',
      'The vessel with the other on her starboard side is give-way',
      'The faster vessel is give-way',
      'The larger vessel is stand-on',
    ],
    correctAnswer: 'The vessel with the other on her starboard side is give-way',
    explanation:
      'Rule 15: When two power-driven vessels are crossing, the vessel which has the other on her own starboard side shall keep out of the way.',
  },
  {
    id: 'vh-04',
    category: 'vessel-hierarchy',
    prompt: 'In a head-on situation between two power-driven vessels, what must each vessel do?',
    options: [
      'The stand-on vessel maintains course; the give-way vessel turns to port',
      'Both vessels alter course to starboard',
      'The smaller vessel gives way',
      'The slower vessel gives way',
    ],
    correctAnswer: 'Both vessels alter course to starboard',
    explanation:
      'Rule 14: When two power-driven vessels are meeting head-on, each shall alter her course to starboard so they pass port-to-port.',
  },
  {
    id: 'vh-05',
    category: 'vessel-hierarchy',
    prompt: 'A vessel is considered to be overtaking when she approaches another vessel from a direction more than how many degrees abaft the beam?',
    options: ['22.5°', '45°', '67.5°', '90°'],
    correctAnswer: '22.5°',
    explanation:
      'Rule 13: A vessel is overtaking when she comes up on another vessel from a direction more than 22.5° abaft her beam (i.e., the sternlight sector).',
  },
  {
    id: 'vh-06',
    category: 'vessel-hierarchy',
    prompt: 'In an overtaking situation, which vessel is the give-way vessel?',
    options: [
      'The vessel being overtaken',
      'The overtaking vessel',
      'The slower vessel',
      'The vessel on the port side',
    ],
    correctAnswer: 'The overtaking vessel',
    explanation:
      'Rule 13: Any vessel overtaking any other shall keep out of the way of the vessel being overtaken.',
  },
  {
    id: 'vh-07',
    category: 'vessel-hierarchy',
    prompt: 'What is the stand-on vessel\'s primary obligation when a risk of collision exists?',
    options: [
      'Take immediate avoiding action',
      'Maintain course and speed',
      'Sound five short blasts',
      'Reduce speed to bare steerageway',
    ],
    correctAnswer: 'Maintain course and speed',
    explanation:
      'Rule 17: The stand-on vessel shall keep her course and speed, allowing the give-way vessel to take early and substantial action.',
  },
  {
    id: 'vh-08',
    category: 'vessel-hierarchy',
    prompt: 'Under Rule 17, a stand-on vessel MAY take action when:',
    options: [
      'She determines a risk of collision exists',
      'The give-way vessel has not taken sufficient action and collision appears imminent',
      'She is in a narrow channel',
      'Visibility drops below 0.5 nautical miles',
    ],
    correctAnswer: 'The give-way vessel has not taken sufficient action and collision appears imminent',
    explanation:
      'Rule 17(a)(ii) and 17(b): The stand-on vessel may act when it becomes apparent that the give-way vessel is not taking appropriate action. She SHALL act when collision cannot be avoided by the give-way vessel alone.',
  },
  {
    id: 'vh-09',
    category: 'vessel-hierarchy',
    prompt: 'A vessel engaged in fishing (with gear deployed) has priority over which of the following?',
    options: [
      'A vessel not under command',
      'A vessel restricted in ability to maneuver',
      'A sailing vessel',
      'A vessel constrained by her draft',
    ],
    correctAnswer: 'A sailing vessel',
    explanation:
      'Rule 18: A vessel engaged in fishing shall keep out of the way of NUC and RAM vessels but has priority over sailing vessels and power-driven vessels.',
  },
  {
    id: 'vh-10',
    category: 'vessel-hierarchy',
    prompt: 'Which rule governs responsibilities between vessels and defines the hierarchy of give-way obligations?',
    options: ['Rule 13', 'Rule 15', 'Rule 18', 'Rule 21'],
    correctAnswer: 'Rule 18',
    explanation:
      'Rule 18 ("Responsibilities between vessels") defines the full hierarchy: NUC > RAM > CBD > Fishing > Sailing > Power-driven > Seaplanes.',
  },
  {
    id: 'vh-11',
    category: 'vessel-hierarchy',
    prompt: 'Two sailing vessels are approaching with the wind on different sides. Which one keeps out of the way?',
    options: [
      'The vessel which has the wind on her port side',
      'The vessel which has the wind on her starboard side',
      'The windward vessel',
      'The faster vessel',
    ],
    correctAnswer: 'The vessel which has the wind on her port side',
    explanation:
      'Rule 12(a)(i): When each sailing vessel has the wind on a different side, the one with the wind on her port side keeps out of the way of the other.',
  },
  {
    id: 'vh-12',
    category: 'vessel-hierarchy',
    prompt: 'Two sailing vessels have the wind on the same side. Which one keeps out of the way?',
    options: [
      'The vessel to windward',
      'The vessel to leeward',
      'The vessel on the port tack',
      'The overtaking vessel only',
    ],
    correctAnswer: 'The vessel to windward',
    explanation:
      'Rule 12(a)(ii): When both sailing vessels have the wind on the same side, the vessel to windward keeps out of the way of the vessel to leeward.',
  },
  {
    id: 'vh-13',
    category: 'vessel-hierarchy',
    prompt: 'What is required of the vessel BEING overtaken?',
    options: [
      'Maintain course and speed as the stand-on vessel',
      'Alter course to starboard to open the range',
      'Reduce speed to let the other vessel past',
      'Sound two short blasts and give way',
    ],
    correctAnswer: 'Maintain course and speed as the stand-on vessel',
    explanation:
      'Rules 13 and 17: The overtaking vessel keeps out of the way; the vessel being overtaken is the stand-on vessel and keeps her course and speed. A subsequent change of bearing does not relieve the overtaking vessel of that duty.',
  },
  {
    id: 'vh-14',
    category: 'vessel-hierarchy',
    prompt: 'In a narrow channel, a vessel of less than 20 metres or a sailing vessel must not do what?',
    options: [
      'Impede the passage of a vessel that can navigate only within the channel',
      'Overtake any vessel under any circumstances',
      'Anchor anywhere within five miles of the channel',
      'Cross the channel at any time',
    ],
    correctAnswer: 'Impede the passage of a vessel that can navigate only within the channel',
    explanation:
      'Rule 9(b): A vessel of less than 20 metres in length or a sailing vessel shall not impede the passage of a vessel which can safely navigate only within a narrow channel or fairway.',
  },
  {
    id: 'vh-15',
    category: 'vessel-hierarchy',
    prompt: 'A vessel engaged in fishing in a narrow channel must not impede whom?',
    options: [
      'Any other vessel navigating within the channel',
      'Only vessels constrained by their draft',
      'Only power-driven vessels over 50 metres',
      'Nobody - fishing vessels have right of way in channels',
    ],
    correctAnswer: 'Any other vessel navigating within the channel',
    explanation:
      'Rule 9(c): A vessel engaged in fishing shall not impede the passage of any other vessel navigating within a narrow channel or fairway. Her Rule 18 priority does not carry into the channel.',
  },
  {
    id: 'vh-16',
    category: 'vessel-hierarchy',
    prompt: 'In a traffic separation scheme, a sailing vessel or a vessel of less than 20 metres must not impede whom?',
    options: [
      'A power-driven vessel following a traffic lane',
      'Any vessel engaged in fishing',
      'Only vessels not under command',
      'Nobody - the scheme imposes no such duty',
    ],
    correctAnswer: 'A power-driven vessel following a traffic lane',
    explanation:
      'Rule 10(j): A vessel of less than 20 metres in length or a sailing vessel shall not impede the safe passage of a power-driven vessel following a traffic lane.',
  },
  {
    id: 'vh-17',
    category: 'vessel-hierarchy',
    prompt: 'A power-driven vessel underway must keep out of the way of which of these?',
    options: [
      'A vessel not under command, a RAM vessel, a fishing vessel and a sailing vessel',
      'A sailing vessel only',
      'A vessel not under command only',
      'Any vessel larger than herself',
    ],
    correctAnswer: 'A vessel not under command, a RAM vessel, a fishing vessel and a sailing vessel',
    explanation:
      'Rule 18(a): A power-driven vessel underway keeps out of the way of a vessel not under command, a vessel restricted in her ability to manoeuvre, a vessel engaged in fishing, and a sailing vessel. She sits near the bottom of the order of responsibility.',
  },
  {
    id: 'vh-18',
    category: 'vessel-hierarchy',
    prompt: 'Which vessel is the stand-on vessel between two vessels NOT in sight of one another in restricted visibility?',
    options: [
      'Neither - Rule 19 applies and there is no stand-on vessel',
      'The vessel with the other on her port side',
      'The larger vessel',
      'The vessel making the slower speed',
    ],
    correctAnswer: 'Neither - Rule 19 applies and there is no stand-on vessel',
    explanation:
      'Rule 19: The steering and sailing rules for vessels in sight of one another do not apply in restricted visibility. There is no stand-on vessel; every vessel proceeds at a safe speed and takes avoiding action in accordance with Rule 19(d).',
  },
  {
    id: 'vh-19',
    category: 'vessel-hierarchy',
    prompt: 'What is required of a seaplane on the water?',
    options: [
      'She shall keep well clear of all vessels and avoid impeding their navigation',
      'She is treated as a vessel not under command',
      'She has priority over power-driven vessels',
      'She is treated as a vessel restricted in her ability to manoeuvre',
    ],
    correctAnswer: 'She shall keep well clear of all vessels and avoid impeding their navigation',
    explanation:
      'Rule 18(e): A seaplane on the water shall in general keep well clear of all vessels and avoid impeding their navigation. She sits at the very bottom of the order of responsibility.',
  },
  {
    id: 'vh-20',
    category: 'vessel-hierarchy',
    prompt: 'Risk of collision shall be deemed to exist if which of these is true?',
    options: [
      'The compass bearing of an approaching vessel does not appreciably change',
      'The other vessel is within two miles',
      'The other vessel is closing at more than ten knots',
      'The other vessel is fine on the starboard bow',
    ],
    correctAnswer: 'The compass bearing of an approaching vessel does not appreciably change',
    explanation:
      'Rule 7(d)(i): Risk of collision shall be deemed to exist if the compass bearing of an approaching vessel does not appreciably change. Rule 7(d)(ii) warns that risk may exist even with an appreciable bearing change, as with a very large vessel or a tow at close range.',
  },
];

// --- DAY SHAPES (16 questions) ---

const dayShapesQuestions: ColregsQuestion[] = [
  {
    id: 'ds-01',
    category: 'day-shapes',
    prompt: 'What day shape does a vessel at anchor display?',
    options: [
      'One black ball',
      'Two black balls in a vertical line',
      'One black diamond',
      'One black cone',
    ],
    correctAnswer: 'One black ball',
    explanation:
      'Rule 30: A vessel at anchor displays one black ball in the forepart of the vessel where best seen.',
  },
  {
    id: 'ds-02',
    category: 'day-shapes',
    prompt: 'What day shape does a vessel not under command display?',
    options: [
      'One black ball',
      'Two black balls in a vertical line',
      'One black diamond',
      'Three black balls in a vertical line',
    ],
    correctAnswer: 'Two black balls in a vertical line',
    explanation:
      'Rule 27: A vessel not under command displays two black balls in a vertical line where best seen.',
  },
  {
    id: 'ds-03',
    category: 'day-shapes',
    prompt: 'A sailing vessel proceeding under sail AND being propelled by machinery must display which day shape?',
    options: [
      'One black ball',
      'One black cone, apex downwards',
      'One black diamond',
      'Two black balls',
    ],
    correctAnswer: 'One black cone, apex downwards',
    explanation:
      'Rule 25: A vessel proceeding under sail when also being propelled by machinery shall exhibit forward a black conical shape, apex downwards. (If only sailing, no day shape is required.)',
  },
  {
    id: 'ds-04',
    category: 'day-shapes',
    prompt: 'What day shape does a vessel engaged in towing display when the tow exceeds 200 metres?',
    options: [
      'One black diamond',
      'Two black diamonds in a vertical line',
      'One black ball',
      'A diamond shape where the tow length is marked',
    ],
    correctAnswer: 'One black diamond',
    explanation:
      'Rule 24: When the length of the tow exceeds 200 metres, both the towing vessel and the towed vessel each display a black diamond shape where best seen.',
  },
  {
    id: 'ds-05',
    category: 'day-shapes',
    prompt: 'A vessel restricted in ability to maneuver (RAM) displays which day shape?',
    options: [
      'Ball-diamond-ball in a vertical line',
      'Diamond-ball-diamond in a vertical line',
      'Three black balls in a vertical line',
      'One black cylinder',
    ],
    correctAnswer: 'Ball-diamond-ball in a vertical line',
    explanation:
      'Rule 27: A RAM vessel displays a ball, diamond, and ball in a vertical line where best seen (black shapes).',
  },
  {
    id: 'ds-06',
    category: 'day-shapes',
    prompt: 'A vessel constrained by her draft may display which day shape?',
    options: [
      'One black ball',
      'One black cylinder',
      'Three black balls in a vertical line',
      'Ball-diamond-ball in a vertical line',
    ],
    correctAnswer: 'One black cylinder',
    explanation:
      'Rule 28: A vessel constrained by her draft may exhibit a cylinder (black) where best seen.',
  },
  {
    id: 'ds-07',
    category: 'day-shapes',
    prompt: 'A vessel aground displays which day shape?',
    options: [
      'One black ball',
      'Two black balls in a vertical line',
      'Three black balls in a vertical line',
      'One black cylinder',
    ],
    correctAnswer: 'Three black balls in a vertical line',
    explanation:
      'Rule 30: A vessel aground displays three black balls in a vertical line where best seen.',
  },
  {
    id: 'ds-08',
    category: 'day-shapes',
    prompt: 'A vessel engaged in minesweeping displays, in addition to her steaming lights or shapes, how many black balls?',
    options: ['One', 'Two', 'Three', 'Four'],
    correctAnswer: 'Three',
    explanation:
      'Rule 27: A vessel engaged in minesweeping displays three black balls — one at or near the foremast head and one at each end of the fore yardarm — to indicate that it is dangerous to approach within 1000 metres.',
  },
  {
    id: 'ds-09',
    category: 'day-shapes',
    prompt: 'What day shape does a vessel engaged in fishing display?',
    options: [
      'Two cones with their apexes together, in a vertical line',
      'Two black balls in a vertical line',
      'One black cone, apex downwards',
      'A ball, a diamond and a ball in a vertical line',
    ],
    correctAnswer: 'Two cones with their apexes together, in a vertical line',
    explanation:
      'Rule 26(b)(i): A vessel engaged in fishing displays two cones with their apexes together in a vertical line - the daytime equivalent of her green-over-white or red-over-white lights.',
  },
  {
    id: 'ds-10',
    category: 'day-shapes',
    prompt: 'A fishing vessel with outlying gear extending more than 150 metres horizontally displays what additional shape?',
    options: [
      'A cone, apex upwards, in the direction of the gear',
      'A second pair of cones, apexes together',
      'A black diamond on the side of the gear',
      'Two black balls on the side of the gear',
    ],
    correctAnswer: 'A cone, apex upwards, in the direction of the gear',
    explanation:
      'Rule 26(c)(ii): A vessel engaged in fishing with outlying gear extending more than 150 metres horizontally displays a cone, apex upwards, in the direction of the gear, so others know which side to avoid.',
  },
  {
    id: 'ds-11',
    category: 'day-shapes',
    prompt: 'What day shape is displayed by the vessel BEING TOWED, when the tow exceeds 200 metres?',
    options: [
      'One black diamond',
      'One black ball',
      'Two black balls in a vertical line',
      'None - only the towing vessel displays a shape',
    ],
    correctAnswer: 'One black diamond',
    explanation:
      'Rule 24(e)(iii): A vessel being towed displays a diamond shape when the length of the tow exceeds 200 metres. Both ends of the tow carry the diamond - the towing vessel under Rule 24(a)(v) and the towed vessel under 24(e)(iii).',
  },
  {
    id: 'ds-12',
    category: 'day-shapes',
    prompt: 'Which vessel at anchor is NOT required to exhibit the anchor ball?',
    options: [
      'A vessel of less than 7 metres, not in or near a narrow channel, fairway or anchorage',
      'Any vessel of less than 20 metres, anywhere',
      'Any vessel of less than 50 metres, anywhere',
      'Every vessel at anchor must exhibit it without exception',
    ],
    correctAnswer: 'A vessel of less than 7 metres, not in or near a narrow channel, fairway or anchorage',
    explanation:
      'Rule 30(g): A vessel of less than 7 metres in length, when at anchor and not in or near a narrow channel, fairway or anchorage, or where other vessels normally navigate, is not required to exhibit the anchor light or shape.',
  },
  {
    id: 'ds-13',
    category: 'day-shapes',
    prompt: 'Which vessel aground is NOT required to exhibit the three balls?',
    options: [
      'A vessel of less than 12 metres in length',
      'A vessel of less than 20 metres in length',
      'A vessel of less than 50 metres in length',
      'Every vessel aground must exhibit them without exception',
    ],
    correctAnswer: 'A vessel of less than 12 metres in length',
    explanation:
      'Rule 30(f): A vessel of less than 12 metres in length, when aground, is not required to exhibit the three balls in a vertical line required by Rule 30(d).',
  },
  {
    id: 'ds-14',
    category: 'day-shapes',
    prompt: 'Where on the vessel is the anchor ball displayed?',
    options: [
      'In the fore part',
      'At or near the stern',
      'At the masthead, amidships',
      'On the side facing the channel',
    ],
    correctAnswer: 'In the fore part',
    explanation:
      'Rule 30(a)(i): A vessel at anchor exhibits, where it can best be seen, one ball in the fore part - marking the end she is riding to her anchor from.',
  },
  {
    id: 'ds-15',
    category: 'day-shapes',
    prompt: 'What day shape does a sailing vessel proceeding under sail alone display?',
    options: [
      'None',
      'One black cone, apex downwards',
      'One black ball',
      'Two cones with their apexes together',
    ],
    correctAnswer: 'None',
    explanation:
      'Rule 25: A sailing vessel proceeding under sail alone carries no day shape. The cone apex downwards of Rule 25(e) is required only when she is under sail AND being propelled by machinery, when she counts as a power-driven vessel.',
  },
  {
    id: 'ds-16',
    category: 'day-shapes',
    prompt: 'Under Annex I, what is the minimum diameter of a ball shape on a vessel of 20 metres or more?',
    options: ['0.6 metres', '0.3 metres', '1.0 metres', '1.5 metres'],
    correctAnswer: '0.6 metres',
    explanation:
      'Annex I, section 6: A ball shall have a diameter of not less than 0.6 metres, and where more than one shape is shown they shall be spaced at least 1.5 metres apart. Vessels of less than 20 metres may use correspondingly smaller shapes.',
  },
];

// --- VESSEL TYPES (6 questions) ---
//
// Identify the vessel from what she is showing, with no text label naming the
// type. Each cue is a real COLREGS signal - see VesselProfile.tsx. A
// power-driven vessel is deliberately not asked: underway she carries no day
// shape, so there is nothing to draw that would distinguish her.

const vesselTypesQuestions: ColregsQuestion[] = [
  {
    id: 'vt-01',
    category: 'vessel-types',
    prompt: 'This vessel is showing two black balls in a vertical line. What is she?',
    options: [
      'A vessel not under command',
      'A vessel restricted in her ability to manoeuvre',
      'A vessel at anchor',
      'A vessel aground',
    ],
    correctAnswer: 'A vessel not under command',
    explanation:
      'Rule 27(a)(ii): A vessel not under command displays two black balls in a vertical line. She is unable to manoeuvre through some exceptional circumstance, and every other vessel keeps clear of her.',
  },
  {
    id: 'vt-02',
    category: 'vessel-types',
    prompt: 'This vessel displays a ball, a diamond and a ball in a vertical line. What is she?',
    options: [
      'A vessel restricted in her ability to manoeuvre',
      'A vessel not under command',
      'A vessel constrained by her draft',
      'A vessel engaged in fishing',
    ],
    correctAnswer: 'A vessel restricted in her ability to manoeuvre',
    explanation:
      'Rule 27(b)(ii): A vessel restricted in her ability to manoeuvre displays three shapes in a vertical line - ball, diamond, ball. The work she is engaged in, such as dredging or laying cable, prevents her from keeping out of the way.',
  },
  {
    id: 'vt-03',
    category: 'vessel-types',
    prompt: 'This vessel displays a single black cylinder. What is she?',
    options: [
      'A vessel constrained by her draft',
      'A vessel restricted in her ability to manoeuvre',
      'A vessel engaged in towing',
      'A vessel not under command',
    ],
    correctAnswer: 'A vessel constrained by her draft',
    explanation:
      'Rule 28: A vessel constrained by her draft may display a cylinder. Her draft in relation to the depth and width of navigable water severely restricts her ability to deviate from her course.',
  },
  {
    id: 'vt-04',
    category: 'vessel-types',
    prompt: 'This vessel displays two cones with their apexes together, and has gear streaming astern. What is she?',
    options: [
      'A vessel engaged in fishing',
      'A vessel restricted in her ability to manoeuvre',
      'A vessel engaged in dredging',
      'A vessel constrained by her draft',
    ],
    correctAnswer: 'A vessel engaged in fishing',
    explanation:
      'Rule 26(b)(i): A vessel engaged in fishing displays two cones with their apexes together in a vertical line. Rule 26(c)(ii) adds a cone pointing towards outlying gear extending more than 150 metres horizontally.',
  },
  {
    id: 'vt-05',
    category: 'vessel-types',
    prompt: 'This vessel is under sail and carries no day shape at all. What is she?',
    options: [
      'A sailing vessel under sail alone',
      'A sailing vessel under sail and machinery',
      'A vessel not under command',
      'A vessel engaged in fishing',
    ],
    correctAnswer: 'A sailing vessel under sail alone',
    explanation:
      'Rule 25: A sailing vessel proceeding under sail alone carries no day shape. It is only when she is under sail AND being propelled by machinery that Rule 25(e) requires a cone, apex downwards - she is then treated as a power-driven vessel.',
  },
  {
    id: 'vt-06',
    category: 'vessel-types',
    prompt: 'This vessel displays a single black diamond and has another vessel on a towline astern. What is she?',
    options: [
      'A vessel towing, where the length of the tow exceeds 200 metres',
      'A vessel restricted in her ability to manoeuvre',
      'A vessel constrained by her draft',
      'A vessel engaged in fishing',
    ],
    correctAnswer: 'A vessel towing, where the length of the tow exceeds 200 metres',
    explanation:
      'Rule 24(a)(v): When the length of the tow, measured from the stern of the towing vessel to the after end of the tow, exceeds 200 metres, a diamond shape is displayed. Rule 24(e)(iii) requires the towed vessel to display one as well.',
  },
];

// --- ANCHOR TYPES (13 questions) ---
//
// Seamanship, not COLREGS: no rule governs which anchor you carry, so these
// explanations open with a topic label from SEAMANSHIP_LABELS instead of a
// rule citation. See the note beside NON_COLREGS_CATEGORIES above.
//
// Every type here has a generic name and a trademarked one in real use, and
// both are heard on a dock. The generic term is always the correct answer -
// grading on "Danforth" would mark a candidate wrong for the more formal word -
// and the explanation names the trade name so neither reads as an error.

const anchorTypesQuestions: ColregsQuestion[] = [
  {
    id: 'an-01',
    category: 'anchor-types',
    prompt:
      'This anchor has two broad flat plates hinged at the crown, with a stock laid across it. What type is it?',
    options: ['Fluke anchor', 'Plow anchor', 'Claw anchor', 'Mushroom anchor'],
    correctAnswer: 'Fluke anchor',
    explanation:
      'Ground tackle: The fluke anchor - sold most widely as the Danforth - is built from two broad flat plates hinged at the crown, with a stock across the crown to roll those plates down into the bottom. The large plate area is what gives it its holding power.',
  },
  {
    id: 'an-02',
    category: 'anchor-types',
    prompt:
      'This anchor carries a single plowshare on the end of its shank, two wings rising to either side of one point. What type is it?',
    options: ['Plow anchor', 'Fluke anchor', 'Grapnel', 'Claw anchor'],
    correctAnswer: 'Plow anchor',
    explanation:
      'Ground tackle: The plow anchor is named for the plowshare on the end of the shank, which cuts in and buries the way a plough turns soil. The two long-running patterns are the CQR and the Delta; both are plows, and both are known by their trade names as often as by the generic one.',
  },
  {
    id: 'an-03',
    category: 'anchor-types',
    prompt:
      'This anchor is a single casting with three heavy curved tines off one crown, a short shank and no stock. What type is it?',
    options: ['Claw anchor', 'Fluke anchor', 'Plow anchor', 'Mushroom anchor'],
    correctAnswer: 'Claw anchor',
    explanation:
      'Ground tackle: The claw anchor - usually called a Bruce, after the original maker - is cast in one piece with three curved tines, no stock and no hinge. It sets quickly and at almost any angle of approach, which is what earned it its place as a bower.',
  },
  {
    id: 'an-04',
    category: 'anchor-types',
    prompt:
      'This anchor has several thin hooked tines spaced around a long bare shaft. What type is it?',
    options: ['Grapnel', 'Claw anchor', 'Fluke anchor', 'Plow anchor'],
    correctAnswer: 'Grapnel',
    explanation:
      'Ground tackle: The grapnel carries multiple curved tines around a central shaft and holds by hooking onto something rather than by burying itself. It is small-craft gear - dinghies, tenders and kayaks - and folding patterns are made to stow flat.',
  },
  {
    id: 'an-05',
    category: 'anchor-types',
    prompt:
      'This anchor is an inverted bowl on a plain shank, with no fluke, point or tine anywhere on it. What type is it?',
    options: ['Mushroom anchor', 'Claw anchor', 'Plow anchor', 'Grapnel'],
    correctAnswer: 'Mushroom anchor',
    explanation:
      'Ground tackle: The mushroom anchor has nothing on it that can dig in. It holds by its own weight and by silting gradually into a soft bottom over weeks and months, which is why it is laid for permanent moorings rather than carried as working gear.',
  },
  {
    id: 'an-06',
    category: 'anchor-types',
    prompt:
      'You are anchoring on a firm sand bottom and want the most holding power you can get for the weight of gear you are able to handle. Which type is the strongest choice?',
    options: ['Fluke anchor', 'Grapnel', 'Mushroom anchor', 'Claw anchor'],
    correctAnswer: 'Fluke anchor',
    explanation:
      'Holding ground: The fluke anchor (Danforth) gives the highest holding power for its weight of the common types in sand and mud, because once buried its two wide plates present a large area against the pull. That advantage belongs to bottoms it can dig into and nowhere else.',
  },
  {
    id: 'an-07',
    category: 'anchor-types',
    prompt: 'A fluke anchor is at its best in sand and mud. On which bottom is it least reliable?',
    options: ['Rock', 'Soft mud', 'Firm sand', 'Silt'],
    correctAnswer: 'Rock',
    explanation:
      'Holding ground: A fluke anchor holds by burying its plates, and on rock there is nothing to bury them in - it skates across, or jams by luck and then has to be broken out. A bottom like that wants an anchor that hooks instead of one that digs.',
  },
  {
    id: 'an-08',
    category: 'anchor-types',
    prompt:
      'You are lying to one anchor overnight and expect wind and tide to swing the boat right around. Which type is best known for resetting itself when the pull comes from a new direction?',
    options: ['Plow anchor', 'Grapnel', 'Mushroom anchor', 'Fluke anchor'],
    correctAnswer: 'Plow anchor',
    explanation:
      'Holding ground: The plow (CQR or Delta) is the type most trusted to reset through a shift: as the pull comes round, the share is dragged out and ploughs straight back in on the new heading. That behaviour, with good holding on most bottoms, is what makes it an all-round bower.',
  },
  {
    id: 'an-09',
    category: 'anchor-types',
    prompt: 'A plow anchor holds well on most bottoms. Which one is its known weak point?',
    options: ['Thick grass', 'Firm sand', 'Soft mud', 'Gravel'],
    correctAnswer: 'Thick grass',
    explanation:
      'Holding ground: Thick grass and weed are where the plow struggles - the share skids over the mat of vegetation instead of cutting through to the holding ground underneath. The claw has the same difficulty in heavy grass.',
  },
  {
    id: 'an-10',
    category: 'anchor-types',
    prompt: 'The CQR and the Delta are both plow anchors. What distinguishes one from the other?',
    options: [
      'The CQR has a hinged shank; the Delta\'s shank is fixed',
      'The CQR has two plowshares; the Delta has one',
      'The CQR is a stocked anchor; the Delta is stockless',
      'The CQR is cast in one piece; the Delta is hinged at the crown',
    ],
    correctAnswer: 'The CQR has a hinged shank; the Delta\'s shank is fixed',
    explanation:
      'Ground tackle: Both are plows and both are trade names. The CQR pivots on a hinge where the shank meets the share, which lets the share stay where it is as the boat swings above it; the Delta carries the same kind of share on a fixed shank. Calling either one a plow anchor is correct.',
  },
  {
    id: 'an-11',
    category: 'anchor-types',
    prompt:
      'Which type sets quickly at almost any angle of approach and is a dependable choice on rock and on mixed bottoms?',
    options: ['Claw anchor', 'Fluke anchor', 'Mushroom anchor', 'Plow anchor'],
    correctAnswer: 'Claw anchor',
    explanation:
      'Holding ground: The claw (Bruce) sets fast and handles rock and mixed bottoms well, its tines finding purchase where a burying anchor has nothing to bury into. Its weakness is the plow\'s weakness too: thick grass, which it slides over.',
  },
  {
    id: 'an-12',
    category: 'anchor-types',
    prompt:
      'A dinghy needs to anchor over a rocky, debris-strewn bottom where the anchor has to catch in a crevice rather than bury itself. Which type is made for that?',
    options: ['Grapnel', 'Fluke anchor', 'Mushroom anchor', 'Plow anchor'],
    correctAnswer: 'Grapnel',
    explanation:
      'Holding ground: The grapnel is the hooking anchor - its tines catch on rock, coral and debris, and it is sized for small craft. In sand or mud it is a poor choice: there is nothing to hook, and thin tines have no area to hold with. A claw also works on rock, but on a larger boat and by burying as well as catching.',
  },
  {
    id: 'an-13',
    category: 'anchor-types',
    prompt:
      'Why is a mushroom anchor unsuitable as the working anchor for an overnight stop?',
    options: [
      'It holds by weight and by silting in slowly, so it has little grip on the night it is dropped',
      'It sets so hard that it cannot be broken out again',
      'It can only be used on rock and coral bottoms',
      'It holds well but is too light to carry enough chain',
    ],
    correctAnswer:
      'It holds by weight and by silting in slowly, so it has little grip on the night it is dropped',
    explanation:
      'Ground tackle: A mushroom develops its hold as it settles and silts into a soft bottom, a process measured in weeks. Dropped fresh it is doing nothing but lying on the bottom under its own weight, so it belongs on a permanent mooring and not in the anchor locker.',
  },
];

// --- BUOYAGE (18 questions) ---
//
// Not COLREGS: the buoyage system is IALA's, and the ICW overlay on top of it
// is the US Coast Guard's, so these explanations open with a topic label from
// TOPIC_LABELS rather than a rule number. See NON_COLREGS_CATEGORIES above.
//
// Everything here is written for IALA Region B, the region the United States
// lies in, because that is the water this app is studied for. Region A is not
// footnoted into every answer - it is drilled head-on in the last two
// questions instead, which is where a boater who has chartered abroad needs
// it. The one thing that must never be blurred is which parts differ: the
// LATERAL marks reverse between the regions and nothing else does.
//
// A note on shapes. "Can" and "nun" are what a mark's shape is called on this
// coast; IALA writes them as cylindrical and conical. Both are accepted usage
// and the explanations name both, so a candidate who learned the formal words
// does not read the answer as wrong.

const buoyageQuestions: ColregsQuestion[] = [
  {
    id: 'by-01',
    category: 'buoyage',
    prompt:
      'Entering a channel from seaward in the United States, you see a flat-topped cylindrical buoy painted solid green. What is it?',
    options: [
      'A port-hand lateral mark',
      'A starboard-hand lateral mark',
      'A special mark',
      'A safe water mark',
    ],
    correctAnswer: 'A port-hand lateral mark',
    explanation:
      'IALA-B: A solid green can (cylindrical) buoy is the port-hand lateral mark of Region B - leave it to port when returning from seaward. It carries a green light if lit, and odd numbers that increase as you come upstream.',
  },
  {
    id: 'by-02',
    category: 'buoyage',
    prompt:
      'Entering a channel from seaward in the United States, you see a buoy that tapers to a blunt point at the top and is painted solid red. What is it?',
    options: [
      'A starboard-hand lateral mark',
      'A port-hand lateral mark',
      'An isolated danger mark',
      'A special mark',
    ],
    correctAnswer: 'A starboard-hand lateral mark',
    explanation:
      'IALA-B: A solid red nun (conical) buoy is the starboard-hand lateral mark of Region B - leave it to starboard when returning from seaward. Red light if lit, and even numbers that increase upstream.',
  },
  {
    id: 'by-03',
    category: 'buoyage',
    prompt: 'What does the phrase "red right returning" actually instruct you to do?',
    options: [
      'Keep the red marks on your starboard side when returning from seaward toward a harbour or upstream',
      'Keep the red marks on your starboard side whenever they are in sight, whichever way you are heading',
      'Keep the red marks on your port side when leaving a harbour for the sea',
      'Keep the red marks on your starboard side only in the Intracoastal Waterway',
    ],
    correctAnswer:
      'Keep the red marks on your starboard side when returning from seaward toward a harbour or upstream',
    explanation:
      'US ATON: The saying only works in the returning direction - coming in from sea, or going upstream. Head back out and every mark swaps sides, which is why the conventional direction of buoyage is defined for a waterway rather than left to the helmsman to guess.',
  },
  {
    id: 'by-04',
    category: 'buoyage',
    prompt:
      'A pillar buoy is painted black above yellow and carries two black cones one above the other, both pointing upward. What is it?',
    options: [
      'A north cardinal mark',
      'A south cardinal mark',
      'An east cardinal mark',
      'An isolated danger mark',
    ],
    correctAnswer: 'A north cardinal mark',
    explanation:
      'IALA-B: Two cones pointing up, black band above yellow, is the north cardinal. The cones point to the black: for north the black is on top, so the cones point up. Pass to the north of it - that is the side the safe water is on.',
  },
  {
    id: 'by-05',
    category: 'buoyage',
    prompt:
      'A pillar buoy is painted yellow above black and carries two black cones one above the other, both pointing downward. What is it?',
    options: [
      'A south cardinal mark',
      'A north cardinal mark',
      'A west cardinal mark',
      'A special mark',
    ],
    correctAnswer: 'A south cardinal mark',
    explanation:
      'IALA-B: Two cones pointing down, yellow band above black, is the south cardinal - the black band is at the bottom and the cones point to it. Safe water lies to the south of the mark.',
  },
  {
    id: 'by-06',
    category: 'buoyage',
    prompt:
      'A pillar buoy is painted black, yellow, black in horizontal bands and carries two black cones mounted base to base. What is it?',
    options: [
      'An east cardinal mark',
      'A west cardinal mark',
      'An isolated danger mark',
      'A north cardinal mark',
    ],
    correctAnswer: 'An east cardinal mark',
    explanation:
      'IALA-B: Cones base to base - the wide ends meeting, the outline of an egg - is the east cardinal, black with a single yellow band. Pass to the east of it. The old memory hook is that the shape between the cones is an E on its side.',
  },
  {
    id: 'by-07',
    category: 'buoyage',
    prompt:
      'A pillar buoy is painted yellow, black, yellow in horizontal bands and carries two black cones mounted point to point. What is it?',
    options: [
      'A west cardinal mark',
      'An east cardinal mark',
      'A south cardinal mark',
      'A safe water mark',
    ],
    correctAnswer: 'A west cardinal mark',
    explanation:
      'IALA-B: Cones point to point - the apexes meeting, the outline of a wine glass - is the west cardinal, yellow with a single black band. Pass to the west of it. "Wine glass for west" is the hook that survives an exam.',
  },
  {
    id: 'by-08',
    category: 'buoyage',
    prompt: 'What is a cardinal mark telling you?',
    options: [
      'The named side of the mark is where the safe water is',
      'The named side of the mark is where the danger is',
      'The mark lies on the named side of the channel',
      'The mark bears that direction from the harbour entrance',
    ],
    correctAnswer: 'The named side of the mark is where the safe water is',
    explanation:
      'IALA-B: A cardinal is named for the quadrant you should pass in, not for where the danger sits. A north cardinal means keep to the north of it - so the hazard is on the far side, to the south. Reading it the other way round puts you on the danger, which is why this is the question cardinals are failed on.',
  },
  {
    id: 'by-09',
    category: 'buoyage',
    prompt:
      'A buoy is painted black with one broad red horizontal band and carries two black spheres one above the other. What is it?',
    options: [
      'An isolated danger mark',
      'A north cardinal mark',
      'A safe water mark',
      'A starboard-hand lateral mark',
    ],
    correctAnswer: 'An isolated danger mark',
    explanation:
      'IALA-B: Black with one or more red bands, and two black spheres in a vertical line, is the isolated danger mark. The two spheres are its own topmark and belong to nothing else in the system.',
  },
  {
    id: 'by-10',
    category: 'buoyage',
    prompt: 'What does an isolated danger mark tell you about the water around it?',
    options: [
      'It is moored on or near a danger of limited extent that has navigable water all around it',
      'It marks the outer edge of a large shoal that must be given a wide berth on one side',
      'It marks the safe centre of a channel with danger on both sides',
      'It marks a wreck that has not yet been surveyed and has no safe side',
    ],
    correctAnswer:
      'It is moored on or near a danger of limited extent that has navigable water all around it',
    explanation:
      'IALA-B: The isolated danger mark is placed on or above a small, well-defined hazard - a rock, a wreck, a shoal patch - with clear water on every side of it. You can pass on any side; what you cannot do is run over the mark itself.',
  },
  {
    id: 'by-11',
    category: 'buoyage',
    prompt:
      'A buoy is painted in red and white vertical stripes and carries a single red sphere as a topmark. What is it?',
    options: [
      'A safe water mark',
      'An isolated danger mark',
      'A special mark',
      'A port-hand lateral mark',
    ],
    correctAnswer: 'A safe water mark',
    explanation:
      'IALA-B: Red and white VERTICAL stripes with a single red spherical topmark is the safe water mark - a fairway, mid-channel or landfall buoy, with navigable water all round it. The stripes running vertically are what separate it at a distance from the horizontal bands of a cardinal or an isolated danger.',
  },
  {
    id: 'by-12',
    category: 'buoyage',
    prompt:
      'A can buoy is painted solid yellow and carries a single yellow X-shaped topmark. What is it?',
    options: [
      'A special mark',
      'A safe water mark',
      'A port-hand lateral mark',
      'A cardinal mark',
    ],
    correctAnswer: 'A special mark',
    explanation:
      'IALA-B: All yellow, with a single yellow cross topmark if it carries one, is the special mark. Yellow belongs to no lateral or cardinal role in the system, which is what leaves it free for this one.',
  },
  {
    id: 'by-13',
    category: 'buoyage',
    prompt: 'What is a special mark there to indicate?',
    options: [
      'A special area or feature described in the chart or the Notices to Mariners, not a navigational channel side',
      'A hazard that is dangerous on every side and must not be approached',
      'The side of the channel you should pass on in a traffic separation scheme',
      'The point at which one buoyage region ends and the other begins',
    ],
    correctAnswer:
      'A special area or feature described in the chart or the Notices to Mariners, not a navigational channel side',
    explanation:
      'IALA-B: A special mark carries no navigational meaning of its own - it points at something written down elsewhere: a spoil ground, a cable or pipeline, a military exercise area, an anchorage, a recreation zone. The chart is what tells you which, so a special mark you cannot account for is a reason to look it up.',
  },
  {
    id: 'by-14',
    category: 'buoyage',
    prompt:
      'A buoy on the Intracoastal Waterway carries a yellow triangle painted on it. Which side do you leave it on, following the ICW in the conventional direction?',
    options: [
      'Your starboard side',
      'Your port side',
      'Either side - the triangle marks the channel centre',
      'Whichever side the buoy\'s own colour indicates',
    ],
    correctAnswer: 'Your starboard side',
    explanation:
      'US ATON: On the ICW a yellow TRIANGLE means starboard side, following the waterway in its conventional direction - southward along the Atlantic coast and westward along the Gulf. Triangle for starboard is the same pairing as the nun buoy, which is the way to remember it.',
  },
  {
    id: 'by-15',
    category: 'buoyage',
    prompt:
      'A buoy on the Intracoastal Waterway carries a yellow square painted on it. Which side do you leave it on, following the ICW in the conventional direction?',
    options: [
      'Your port side',
      'Your starboard side',
      'Either side - the square marks an anchorage',
      'Whichever side the buoy\'s own colour indicates',
    ],
    correctAnswer: 'Your port side',
    explanation:
      'US ATON: On the ICW a yellow SQUARE means port side, following the waterway in its conventional direction. Square for port pairs with the can buoy, the flat-topped one, the way the triangle pairs with the nun.',
  },
  {
    id: 'by-16',
    category: 'buoyage',
    prompt:
      'You are running the ICW and come to a red nun buoy with a yellow SQUARE painted on it. How do you pass it?',
    options: [
      'Leave it to port, because the yellow square governs while you are following the ICW',
      'Leave it to starboard, because a red nun is always left to starboard',
      'Leave it to starboard, because the yellow square applies only to unlit marks',
      'Either side - the two markings contradict each other, so the mark carries no instruction',
    ],
    correctAnswer:
      'Leave it to port, because the yellow square governs while you are following the ICW',
    explanation:
      'US ATON: Where the ICW runs along another marked waterway, a mark serves both, and the two can disagree. The yellow overlay is read on its own: square to port, triangle to starboard, whatever the hull under it is painted. It is exactly this case - a red buoy telling an ICW boat to pass it on the port side - that the yellow shapes exist for.',
  },
  {
    id: 'by-17',
    category: 'buoyage',
    prompt:
      'You have chartered in Europe, which buoys under IALA Region A. What is different there from the system used in the United States?',
    options: [
      'The lateral marks are reversed: red is left to port entering from seaward, and green to starboard',
      'The cardinal marks are reversed, and the lateral marks are the same',
      'The lateral marks are the same, but red and green lights swap meanings',
      'Nothing is reversed - only the numbering of the marks runs the other way',
    ],
    correctAnswer:
      'The lateral marks are reversed: red is left to port entering from seaward, and green to starboard',
    explanation:
      'IALA-B: The LATERAL marks are the whole of the difference between the two regions. In Region A - Europe, Africa, most of Asia and Australasia - red cans are left to port coming in and green cones to starboard, the exact reverse of the United States. "Red right returning" is a Region B saying and will put you on the bank in Region A.',
  },
  {
    id: 'by-18',
    category: 'buoyage',
    prompt:
      'Which marks mean exactly the same thing in IALA Region A as they do in IALA Region B?',
    options: [
      'Cardinal, isolated danger, safe water and special marks',
      'Lateral and cardinal marks',
      'Only the safe water mark',
      'None of them - the whole system is mirrored between the regions',
    ],
    correctAnswer: 'Cardinal, isolated danger, safe water and special marks',
    explanation:
      'IALA-B: Four of the five mark types are worldwide. A north cardinal is black over yellow with two cones up in every port on earth; so are the two black spheres of an isolated danger, the vertical red and white stripes of safe water, and the plain yellow of a special mark. Only the laterals change sides at the region boundary, which is why they are the ones to check on arrival.',
  },
];

// --- CHART SYMBOLS (17 questions) ---
//
// Not COLREGS either: these are read out of U.S. Chart No. 1, the NOAA and NGA
// publication of symbols, abbreviations and terms, so the explanations open
// with that label. See NON_COLREGS_CATEGORIES above.
//
// These questions carry NO diagram, and that is a decision rather than an
// omission. What is being tested is what a printed abbreviation stands for -
// "Iso", "PA", "Fl(2+1) R 6s" - and the abbreviation is already the picture.
// Drawing a chart extract around it would add scenery to a reading exercise
// and would have to invent a plausible piece of coastline to do it. The few
// entries that are genuinely graphic - the underlined sounding, the magenta
// flare - are described in words for the same reason: what a candidate has to
// carry to the chart table is the rule, not one rendering of it.
//
// The whole bank is written for US charts. Depth units are the case that
// matters: a NOAA chart may be in feet, fathoms or metres and says which in
// its title block, so no question here assumes one.

const chartSymbolsQuestions: ColregsQuestion[] = [
  {
    id: 'cs-01',
    category: 'chart-symbols',
    prompt: 'A lighted buoy on the chart is annotated "Fl G 4s". What does that describe?',
    options: [
      'A green light flashing once every 4 seconds',
      'A green light flashing 4 times in quick succession',
      'A green light visible for 4 nautical miles',
      'A green light 4 feet above the water',
    ],
    correctAnswer: 'A green light flashing once every 4 seconds',
    explanation:
      'Chart No. 1: A light description reads as character, colour, period, and then height and range where they are given. "Fl" is flashing, "G" is green, and "4s" is the period - the time for one complete cycle, so one flash every four seconds. Timing that period with a watch is how a light is identified at night.',
  },
  {
    id: 'cs-02',
    category: 'chart-symbols',
    prompt: 'What does the light character "Q" mean on a chart?',
    options: [
      'Quick flashing - a rapid, continuous flash of about 60 per minute',
      'Quenched - a light that has been reported extinguished',
      'Quarantine anchorage light',
      'A light whose character has not been established',
    ],
    correctAnswer: 'Quick flashing - a rapid, continuous flash of about 60 per minute',
    explanation:
      'Chart No. 1: "Q" is quick flashing, around 50 to 79 flashes a minute, and "VQ" is very quick, around 80 to 159. The quick rhythms belong mostly to cardinal marks, where the number of flashes in the group is what names the quadrant.',
  },
  {
    id: 'cs-03',
    category: 'chart-symbols',
    prompt: 'What does the light character "Iso" mean?',
    options: [
      'Isophase - equal periods of light and darkness',
      'Isolated - a light on a danger with clear water all round it',
      'A light of the same colour as the one before it in the sequence',
      'An intermittent light of no fixed period',
    ],
    correctAnswer: 'Isophase - equal periods of light and darkness',
    explanation:
      'Chart No. 1: Isophase means the light is on exactly as long as it is off. It is the middle of the three steady rhythms - flashing is mostly dark, occulting is mostly lit, isophase is even - and telling them apart by eye is what the period is timed for.',
  },
  {
    id: 'cs-04',
    category: 'chart-symbols',
    prompt: 'What does the light character "Occ" mean?',
    options: [
      'Occulting - the light is on longer than it is off',
      'Occulting - the light is off longer than it is on',
      'Occasional - a light exhibited only when shipping is expected',
      'A light obscured over part of its arc',
    ],
    correctAnswer: 'Occulting - the light is on longer than it is off',
    explanation:
      'Chart No. 1: An occulting light is a steady light interrupted by short eclipses - lit for longer than it is dark. It is the exact opposite of a flashing light, which is dark for longer than it is lit, and reversing the two is the commonest error on this page.',
  },
  {
    id: 'cs-05',
    category: 'chart-symbols',
    prompt: 'What does "F" mean when it opens a light description, as in "F R"?',
    options: [
      'Fixed - a steady light that does not flash at all',
      'Flashing, when no period is given',
      'Fog light, exhibited only in reduced visibility',
      'Floating - the light is on a buoy rather than a structure',
    ],
    correctAnswer: 'Fixed - a steady light that does not flash at all',
    explanation:
      'Chart No. 1: "F" is fixed - continuous and unchanging. "F R" is a fixed red light. Flashing is "Fl", with the l, and a fixed light with a flash worked into it is written "F Fl".',
  },
  {
    id: 'cs-06',
    category: 'chart-symbols',
    prompt: 'A buoy is charted as "Mo(A) W 8s". What is the light doing, and what kind of mark is it?',
    options: [
      'Flashing Morse code A - short then long - which is the light of a safe water mark',
      'Flashing Morse code A - long then short - which warns of an isolated danger',
      'Showing a single flash every 8 seconds, marking an anchorage',
      'Showing an alternating white light, marking the start of a traffic scheme',
    ],
    correctAnswer:
      'Flashing Morse code A - short then long - which is the light of a safe water mark',
    explanation:
      'Chart No. 1: "Mo(A)" is a light flashing the Morse letter A, a short flash followed by a long one, repeating every 8 seconds here. That rhythm belongs to the safe water mark - the red and white striped fairway, mid-channel and landfall buoys - so hearing it described is enough to name the mark.',
  },
  {
    id: 'cs-07',
    category: 'chart-symbols',
    prompt: 'A buoy is charted as "Fl(2+1) R 6s". What does the (2+1) grouping tell you?',
    options: [
      'It is a composite group flashing light, the character of a preferred-channel junction mark',
      'It flashes twice, then once more only in reduced visibility',
      'It carries two lights on one structure, one of them a spare',
      'It flashes three times every 6 seconds with no significance to the grouping',
    ],
    correctAnswer:
      'It is a composite group flashing light, the character of a preferred-channel junction mark',
    explanation:
      'Chart No. 1: A composite group - two flashes, a pause, then one - is the rhythm reserved for preferred-channel marks, the red-and-green banded buoys at a junction. The colour of the light matches the colour of the topmost band, which is the band that says which channel is the main one.',
  },
  {
    id: 'cs-08',
    category: 'chart-symbols',
    prompt: 'A sounding on the chart is annotated "Cy". What is the bottom there?',
    options: ['Clay', 'Coral', 'Cobbles', 'Chalk'],
    correctAnswer: 'Clay',
    explanation:
      'Chart No. 1: "Cy" is clay. The nature-of-the-bottom abbreviations are what an anchorage is chosen on, and the short ones are worth knowing cold: S sand, M mud, Rk rock, Sh shells, G gravel, Wd weed.',
  },
  {
    id: 'cs-09',
    category: 'chart-symbols',
    prompt:
      'You are looking for somewhere to anchor and the soundings in the bay are annotated "Co". Why is that a poor choice of berth?',
    options: [
      'Co is coral - a bottom that holds badly, cuts rode, and is damaged by anchoring',
      'Co is cobbles - the anchor will bury too deep to break out again',
      'Co is a cable area, where anchoring is prohibited',
      'Co is a coastguard zone, closed to anchoring without permission',
    ],
    correctAnswer:
      'Co is coral - a bottom that holds badly, cuts rode, and is damaged by anchoring',
    explanation:
      'Chart No. 1: "Co" is coral. A submarine cable area is charted as its own symbol with the word spelled out, not as this abbreviation. Coral gives an anchor little to bite, chafes through rode, and anchoring on it is restricted or banned in much of the water it is found in.',
  },
  {
    id: 'cs-10',
    category: 'chart-symbols',
    prompt: 'A figure on the chart is printed underlined, as "3". What does the underline mean?',
    options: [
      'It is a drying height - the feature uncovers at low water, and the figure is how far it stands above chart datum',
      'It is a sounding taken from an older survey and not since confirmed',
      'It is a charted depth that has been reported as shoaler than shown',
      'It is a height above mean high water rather than above chart datum',
    ],
    correctAnswer:
      'It is a drying height - the feature uncovers at low water, and the figure is how far it stands above chart datum',
    explanation:
      'Chart No. 1: An underlined figure is a drying height, not a depth. The ground it sits on is covered and uncovered by the tide, and the number is how far it dries ABOVE chart datum - so the water over it is the height of tide minus that figure, and at datum there is none.',
  },
  {
    id: 'cs-11',
    category: 'chart-symbols',
    prompt: 'How do you know whether the soundings on a chart are in feet, fathoms or metres?',
    options: [
      'The chart says so in its title block, and often in the margin as well',
      'All charts issued for United States waters are in feet',
      'All charts issued since the 1980s are in metres',
      'It is inferred from the scale - large-scale charts are in feet, small-scale in fathoms',
    ],
    correctAnswer: 'The chart says so in its title block, and often in the margin as well',
    explanation:
      'Chart No. 1: The unit of depth is stated on the chart itself, in the title block, and it varies from chart to chart in US waters - feet, fathoms, and metres are all in issue. Assuming the unit rather than reading it is how a fathoms chart gets navigated as though it were feet.',
  },
  {
    id: 'cs-12',
    category: 'chart-symbols',
    prompt: 'A charted rock carries the note "PA". What is being said?',
    options: [
      'Position approximate - the feature exists, but where it is shown cannot be relied on',
      'Position accurate - the feature has been fixed by a recent survey',
      'Partly awash - the rock covers and uncovers with the tide',
      'Prohibited anchorage in the area around it',
    ],
    correctAnswer:
      'Position approximate - the feature exists, but where it is shown cannot be relied on',
    explanation:
      'Chart No. 1: "PA" is position approximate. Its neighbours on the page are "PD", position doubtful, and "ED", existence doubtful, where even whether the thing is there is unsettled. All three are reasons to give a wide berth rather than to pass close on the charted position.',
  },
  {
    id: 'cs-13',
    category: 'chart-symbols',
    prompt: 'What does the abbreviation "Wk" mark?',
    options: [
      'A wreck',
      'A weed-covered bottom',
      'A working area, such as a dredging operation',
      'A wharf',
    ],
    correctAnswer: 'A wreck',
    explanation:
      'Chart No. 1: "Wk" is a wreck. Which wreck symbol it is drawn with says how much water is over it - a dangerous wreck, a wreck with a known depth over it, or a hull showing - and the sounding beside it, where there is one, is the least depth found over the wreck itself.',
  },
  {
    id: 'cs-14',
    category: 'chart-symbols',
    prompt: 'An aid to navigation is charted as "Bn". What kind of aid is it?',
    options: [
      'A beacon - a fixed aid built on the bottom or on shore, not a floating one',
      'A bell buoy, which sounds on the swell',
      'A bearing line printed on the chart for a range',
      'A basin marker at the entrance to a harbour',
    ],
    correctAnswer: 'A beacon - a fixed aid built on the bottom or on shore, not a floating one',
    explanation:
      'Chart No. 1: "Bn" is a beacon, a fixed structure. The distinction from a buoy is the one that matters to a piloting fix: a beacon does not move, so a bearing on it is worth taking, where a buoy can drag, drift off station, or be shifted without notice.',
  },
  {
    id: 'cs-15',
    category: 'chart-symbols',
    prompt: 'A magenta circle on the chart is labelled "Racon(B)". What is at that spot?',
    options: [
      'A radar transponder beacon, which paints the Morse letter B outward from its position on your radar',
      'A radio beacon transmitting the letter B for direction finding',
      'A radar reflector fitted to an unlit buoy',
      'A reporting point where traffic calls in on VHF',
    ],
    correctAnswer:
      'A radar transponder beacon, which paints the Morse letter B outward from its position on your radar',
    explanation:
      'Chart No. 1: A racon answers your radar pulse, so a coded flash - here Morse B, long-short-short-short - appears on the screen as a line running outward from the racon along its bearing. It is what makes a bridge pier or a landfall buoy identifiable on radar in poor visibility.',
  },
  {
    id: 'cs-16',
    category: 'chart-symbols',
    prompt: 'Lights, buoy light flares, restricted areas and recommended tracks are all printed in magenta. Why that colour?',
    options: [
      'It is the colour reserved for information the mariner must not miss, and it stays readable under a red night light',
      'It is the colour reserved for features added since the chart was first printed',
      'It marks everything that is privately maintained rather than federally maintained',
      'It marks everything whose position is approximate',
    ],
    correctAnswer:
      'It is the colour reserved for information the mariner must not miss, and it stays readable under a red night light',
    explanation:
      'Chart No. 1: Magenta is the chart\'s emphasis colour - lights and their flares, radar beacons, restricted and prohibited areas, recommended tracks and traffic schemes. It was chosen because it survives being read under the red light of a darkened wheelhouse, where an ordinary red print would vanish into the paper.',
  },
  {
    id: 'cs-17',
    category: 'chart-symbols',
    prompt: 'What is "U.S. Chart No. 1"?',
    options: [
      'The NOAA and NGA publication listing the symbols, abbreviations and terms used on US charts',
      'The largest-scale chart of the approaches to New York, the first ever issued by NOAA',
      'The index chart from which all other US chart numbers are allocated',
      'The Coast Guard publication listing every lighted aid to navigation in US waters',
    ],
    correctAnswer:
      'The NOAA and NGA publication listing the symbols, abbreviations and terms used on US charts',
    explanation:
      'Chart No. 1: Despite the name it is a booklet, not a chart - the joint NOAA and NGA key to every symbol, abbreviation and term used on paper and electronic navigational charts. The lighted aids in a region are listed in the Coast Guard\'s Light List instead, which is a different book for a different question.',
  },
];

// --- DISTRESS SIGNALS (16 questions) ---
//
// These ARE COLREGS. Annex IV to the 1972 Convention is headed "Distress
// Signals" and lists them, and Rule 37 is the rule that sends a vessel in
// distress to that list. So this category goes through the ordinary citation
// path with every other governed one - "Annex IV:" opens the explanations that
// are about what a signal means, and "Rule 37" opens the one that is about the
// obligation to use them. It is NOT in NON_COLREGS_CATEGORIES and must not be
// given a topic label: there is a real citation here, and inventing a label
// where a citation exists is the same error as inventing a citation where one
// does not.
//
// Colour is doing work in this category that shape does elsewhere. Red is what
// makes a flare a distress signal and orange is what makes the smoke one, so a
// question that asks what colour the signal must be gets no diagram - the
// diagram would be the answer. See QUESTION_DISTRESS in ../index.tsx.

const distressSignalsQuestions: ColregsQuestion[] = [
  {
    id: 'di-01',
    category: 'distress-signals',
    prompt:
      'You see a bright red light burning as it descends slowly beneath a small canopy. What are you looking at?',
    options: [
      'A rocket parachute flare - a distress signal',
      'A white anti-collision flare, warning you that you have not been seen',
      'A flare used to mark a position for a helicopter, carrying no distress meaning',
      'A signal that the vessel is engaged in fishing with gear out',
    ],
    correctAnswer: 'A rocket parachute flare - a distress signal',
    explanation:
      'Annex IV: A rocket parachute flare showing a red light is a listed distress signal. Fired to around 300 metres and hanging under its canopy for close to a minute, it is the signal meant to be seen from beyond the horizon, which is why it is the one fired first when help is not already in sight.',
  },
  {
    id: 'di-02',
    category: 'distress-signals',
    prompt:
      'A person on the deck of a small boat is holding up a burning red light at the end of a short case. What are they signalling?',
    options: [
      'Distress - a hand flare showing a red light',
      'That the vessel is under sail and about to alter course',
      'That the vessel is on pilotage duty and has a pilot aboard',
      'That the vessel is anchored and showing a temporary light',
    ],
    correctAnswer: 'Distress - a hand flare showing a red light',
    explanation:
      'Annex IV: A hand flare showing a red light is listed alongside the rocket parachute flare. It burns for about a minute and is seen only a few miles, so it is the one held back until a searching vessel or aircraft is close enough to fix your position by it.',
  },
  {
    id: 'di-03',
    category: 'distress-signals',
    prompt: 'A dense orange plume is rising from a small canister floating on the water. What is it?',
    options: [
      'A distress signal - a smoke signal giving off orange-coloured smoke',
      'A marker showing the boundary of an area closed to navigation',
      'A signal that the vessel nearby is engaged in dredging',
      'A signal that the vessel nearby is carrying dangerous cargo',
    ],
    correctAnswer: 'A distress signal - a smoke signal giving off orange-coloured smoke',
    explanation:
      'Annex IV: Orange smoke is the daylight signal on the list. It shows up against sea and sky where a flare in sunshine will not, and it lies on the water long enough for an aircraft to run down on it, which is why it is carried alongside the flares rather than instead of them.',
  },
  {
    id: 'di-04',
    category: 'distress-signals',
    prompt:
      'A rocket climbs from a vessel and bursts into several separate red stars. Fired again a short while later, what is it?',
    options: [
      'A distress signal - rockets or shells throwing red stars, fired one at a time at short intervals',
      'A line-throwing rocket, sent across to pass a towline',
      'A signal that the vessel is about to alter course to starboard',
      'A green star shell, used to acknowledge that a signal has been seen',
    ],
    correctAnswer:
      'A distress signal - rockets or shells throwing red stars, fired one at a time at short intervals',
    explanation:
      'Annex IV: Rockets or shells throwing red stars, fired one at a time at short intervals, are a distress signal in their own right and separate from the parachute flare. Several stars from one burst, repeated, is what tells them apart at a distance from one light hanging under a canopy.',
  },
  {
    id: 'di-05',
    category: 'distress-signals',
    prompt:
      'A vessel hoists two code flags on one halyard: a blue and white chequered flag above a flag of five horizontal stripes, blue, white, red, white, blue. What is she saying?',
    options: [
      'She is in distress and requires assistance - the code signal November over Charlie',
      'She requires a pilot',
      'She is dragging her anchor',
      'She is about to weigh anchor and get under way',
    ],
    correctAnswer:
      'She is in distress and requires assistance - the code signal November over Charlie',
    explanation:
      'Annex IV: The International Code signal of distress is November over Charlie - the chequered flag above the five-striped one. It is on the list precisely because it needs no radio, no pyrotechnics and no power: two flags out of the locker, hoisted where they can be seen.',
  },
  {
    id: 'di-06',
    category: 'distress-signals',
    prompt:
      'A vessel has hoisted a plain square flag with a round black shape immediately above it. What does the pairing mean?',
    options: [
      'Distress - a square flag with a ball, or anything resembling a ball, above or below it',
      'That she is at anchor and has a second anchor down',
      'That she is not under command and cannot manoeuvre',
      'That she has a pilot on board and is under his direction',
    ],
    correctAnswer:
      'Distress - a square flag with a ball, or anything resembling a ball, above or below it',
    explanation:
      'Annex IV: A square flag with a ball above or below it is a distress signal, and "anything resembling a ball" is the wording - a fender, a bucket, a coiled warp. It is on the list as the improvised signal, for a vessel with nothing aboard that was made to be a signal.',
  },
  {
    id: 'di-07',
    category: 'distress-signals',
    prompt:
      'A person on a boat is slowly and repeatedly raising both outstretched arms to each side and lowering them again. What are they doing?',
    options: [
      'Making a distress signal - slowly and repeatedly raising and lowering arms outstretched to each side',
      'Signalling that they have seen you and need no assistance',
      'Signalling that their vessel is about to get under way',
      'Waving a greeting, which carries no meaning under the Rules',
    ],
    correctAnswer:
      'Making a distress signal - slowly and repeatedly raising and lowering arms outstretched to each side',
    explanation:
      'Annex IV: Arms outstretched to each side, raised and lowered slowly and repeatedly, is a listed distress signal. The slowness and the repetition are the whole of it - one wave is a greeting, and reading it as one is a mistake made from a distance every season.',
  },
  {
    id: 'di-08',
    category: 'distress-signals',
    prompt: 'What does a vessel showing flames on board, as from a burning tar barrel, indicate?',
    options: [
      'Distress - flames on the vessel are a listed distress signal',
      'That she is discharging or loading a flammable cargo',
      'That she is engaged in mineclearance and others must keep clear',
      'That she is burning waste and requires a wide berth',
    ],
    correctAnswer: 'Distress - flames on the vessel are a listed distress signal',
    explanation:
      'Annex IV: Flames on the vessel, as from a burning tar barrel or oil barrel, is on the list. It is one of the older entries and it survives for the same reason the square flag and the ball do: it can be made from what is aboard when everything manufactured for the purpose has been used up.',
  },
  {
    id: 'di-09',
    category: 'distress-signals',
    prompt:
      'A gun or other explosive signal is being fired as a distress signal. At what interval must it be fired?',
    options: [
      'At intervals of about a minute',
      'At intervals of about five seconds',
      'At intervals of about ten minutes',
      'Continuously, with no interval',
    ],
    correctAnswer: 'At intervals of about a minute',
    explanation:
      'Annex IV: A gun or other explosive signal fired at intervals of about a minute is a distress signal. The interval is the signal - a single report is a report, and it is the deliberate repetition at about a minute that separates distress from any other bang heard over water.',
  },
  {
    id: 'di-10',
    category: 'distress-signals',
    prompt: 'What does a continuous sounding with any fog-signalling apparatus mean?',
    options: [
      'Distress - it is a listed distress signal',
      'That the vessel is under way in restricted visibility and making way',
      'That the vessel doubts the intentions of another and is signalling so',
      'That the vessel is aground in restricted visibility',
    ],
    correctAnswer: 'Distress - it is a listed distress signal',
    explanation:
      'Annex IV: A continuous sounding with any fog-signalling apparatus is a distress signal. Every other use of a fog signal is a rhythm of separated blasts with a gap between them, so a sound that simply does not stop is unmistakable even to someone who cannot see the vessel making it.',
  },
  {
    id: 'di-11',
    category: 'distress-signals',
    prompt:
      'A signal is being made as three short, three long and three short, by flashing light. What is it, and how may it be sent?',
    options: [
      'The group SOS - a distress signal, and it may be made by any signalling method',
      'The group SOS - a distress signal, but valid only when sent by radiotelegraphy',
      'The letter O repeated, a warning that a vessel is manoeuvring',
      'An acknowledgement that a distress signal has been received',
    ],
    correctAnswer:
      'The group SOS - a distress signal, and it may be made by any signalling method',
    explanation:
      'Annex IV: The signal is the Morse group SOS, and it is listed as a distress signal made by any signalling method - a lamp, a torch, a mirror, a whistle, a hand on a hull. That is what makes it the last signal available to a vessel that has lost everything else.',
  },
  {
    id: 'di-12',
    category: 'distress-signals',
    prompt: 'What is the listed distress signal sent by radiotelephony?',
    options: [
      'The spoken word "Mayday"',
      'The spoken word "Pan-Pan"',
      'The spoken word "Seelonce"',
      'The spoken word "Securite"',
    ],
    correctAnswer: 'The spoken word "Mayday"',
    explanation:
      'Annex IV: The distress signal by radiotelephony is the spoken word Mayday. The other three words are real radio procedure, but they are urgency, radio silence and safety respectively - none of them is the distress signal, and using one of them for distress is a call that will be answered as something less than it is.',
  },
  {
    id: 'di-13',
    category: 'distress-signals',
    prompt:
      'A crew member activates the vessel\'s EPIRB. Is that a distress signal in the same sense as a flare?',
    options: [
      'Yes - signals transmitted by emergency position-indicating radio beacons are on the same list',
      'No - an EPIRB is a locating device and is not itself a distress signal',
      'Yes, but only once it has been confirmed by a spoken distress call',
      'No - an EPIRB signal counts as a distress signal only outside territorial waters',
    ],
    correctAnswer:
      'Yes - signals transmitted by emergency position-indicating radio beacons are on the same list',
    explanation:
      'Annex IV: Signals transmitted by emergency position-indicating radio beacons are listed, as are approved signals transmitted by radiocommunication systems including survival craft radar transponders. The list was extended to them for exactly the reason it holds a burning tar barrel: it takes whatever the vessel actually has.',
  },
  {
    id: 'di-14',
    category: 'distress-signals',
    prompt:
      'You would like to use a red parachute flare to attract the attention of a friend ashore. What does the Convention say?',
    options: [
      'It is prohibited - these signals may not be used for anything except to indicate distress, nor may signals that could be confused with them',
      'It is permitted, so long as no other vessel is in sight at the time',
      'It is permitted, so long as the coastguard is informed beforehand',
      'It is prohibited only for rockets, and hand flares may be used freely',
    ],
    correctAnswer:
      'It is prohibited - these signals may not be used for anything except to indicate distress, nor may signals that could be confused with them',
    explanation:
      'Annex IV: The use or exhibition of any of these signals except to indicate distress and need of assistance is prohibited, and so is the use of any signal that may be confused with them. The reason is the cost of the answer: a lifeboat launched, a helicopter flown and a crew put at risk for a flare fired to say hello.',
  },
  {
    id: 'di-15',
    category: 'distress-signals',
    prompt: 'What do the Rules require of a vessel in distress that requires assistance?',
    options: [
      'That she use or exhibit the signals set out in the annex on distress signals',
      'That she sound the manoeuvring and warning signals until answered',
      'That she exhibit the lights and shapes of a vessel not under command',
      'That she anchor and wait to be found, if she is able to anchor',
    ],
    correctAnswer: 'That she use or exhibit the signals set out in the annex on distress signals',
    explanation:
      'Rule 37 is one sentence: a vessel in distress and requiring assistance shall use or exhibit the signals described in Annex IV. The rule itself lists nothing - it points at the annex, which is why the annex and not the rule is what has to be learned signal by signal.',
  },
  {
    id: 'di-16',
    category: 'distress-signals',
    prompt: 'Which of these is NOT a distress signal?',
    options: [
      'A white flare',
      'A hand flare showing a red light',
      'A smoke signal giving off orange-coloured smoke',
      'The International Code signal November over Charlie',
    ],
    correctAnswer: 'A white flare',
    explanation:
      'Annex IV: Every distress pyrotechnic on the list is red, or orange in the case of smoke. A white flare is not on it - white is used to say "I am here, I have seen you", most often to warn a vessel closing on a collision course that she has not been seen. Firing white where red was meant will be read as no distress at all.',
  },
];

// --- VHF PROCEDURE (17 questions) ---
//
// Not COLREGS. What may be said on a marine VHF set, and on which channel, is
// radio regulation - the FCC in US waters, the ITU internationally - and there
// is no rule number to cite, so these explanations open with the topic label
// "Radio procedure". The distress signals category next door is the opposite
// case and carries a real Annex IV citation; the two must not be confused.
//
// Text questions throughout, and no diagram: a radio call is words in an
// order. What a candidate is examined on is which of the three priority calls
// a situation deserves and what is said in what sequence, and a picture of a
// handset would be scenery around that.
//
// The three calls are spelled here as they are spoken - Mayday, Pan-Pan,
// Securite - and each is said three times at the head of the call. The
// repetition is not emphasis: it is what lets a listener who caught only the
// tail of the first word know what is coming.

const vhfProcedureQuestions: ColregsQuestion[] = [
  {
    id: 'vf-01',
    category: 'vhf-procedure',
    prompt:
      'Which call is made when a vessel or a person is in grave and imminent danger and requires immediate assistance?',
    options: ['Mayday', 'Pan-Pan', 'Securite', 'Seelonce'],
    correctAnswer: 'Mayday',
    explanation:
      'Radio procedure: Mayday is the distress call, and the threshold for it is grave and imminent danger requiring immediate assistance. Nothing outranks it - every other station on the channel stops transmitting for it.',
  },
  {
    id: 'vf-02',
    category: 'vhf-procedure',
    prompt:
      'Which call is made for an urgent message about the safety of a vessel or a person, where nobody is in immediate danger of losing their life?',
    options: ['Pan-Pan', 'Mayday', 'Securite', 'Seelonce'],
    correctAnswer: 'Pan-Pan',
    explanation:
      'Radio procedure: Pan-Pan is the urgency call, one step below distress. It is the call for a situation that is serious and getting worse but has not yet become a matter of life - and it is the call most often skipped by people who think it is not bad enough yet to use the radio at all.',
  },
  {
    id: 'vf-03',
    category: 'vhf-procedure',
    prompt:
      'Which call announces a message about navigational safety or an important meteorological warning?',
    options: ['Securite', 'Pan-Pan', 'Mayday', 'Seelonce'],
    correctAnswer: 'Securite',
    explanation:
      'Radio procedure: Securite, spoken say-cure-ee-tay, is the safety call - the lowest of the three priorities. Coast stations use it to open a gale warning or a navigational warning, and a vessel may use it too, to report a hazard she has just seen.',
  },
  {
    id: 'vf-04',
    category: 'vhf-procedure',
    prompt: 'On which VHF channel are all three of those calls made?',
    options: ['Channel 16', 'Channel 13', 'Channel 22A', 'Channel 9'],
    correctAnswer: 'Channel 16',
    explanation:
      'Radio procedure: Channel 16 is the international distress, safety and calling channel, and the three priority calls are made there. In US waters the announcement is often made on 16 and the message itself passed on 22A once the Coast Guard answers, which is why 16 has to be kept clear.',
  },
  {
    id: 'vf-05',
    category: 'vhf-procedure',
    prompt: 'How many times is the word "Mayday" spoken at the start of a distress call?',
    options: ['Three times', 'Once', 'Twice', 'Continuously until answered'],
    correctAnswer: 'Three times',
    explanation:
      'Radio procedure: Three times - "Mayday, Mayday, Mayday". Pan-Pan and Securite are given three times too. A listener who caught only the end of the first word still hears the next two, and knows in about two seconds what kind of call this is.',
  },
  {
    id: 'vf-06',
    category: 'vhf-procedure',
    prompt: 'What immediately follows "Mayday, Mayday, Mayday" in a distress call?',
    options: [
      '"This is" followed by the vessel\'s name, spoken three times',
      'Your position, given as latitude and longitude',
      'The nature of the distress',
      'The number of persons on board',
    ],
    correctAnswer: '"This is" followed by the vessel\'s name, spoken three times',
    explanation:
      'Radio procedure: "This is" and then the vessel\'s name three times, so that a station straining to hear gets three chances at who is calling. The call sign follows the name where the vessel has one. Everything else in the call comes after you have been identified.',
  },
  {
    id: 'vf-07',
    category: 'vhf-procedure',
    prompt:
      'Having said "Mayday" once more and given your vessel\'s name, what is the next thing you pass?',
    options: [
      'Your position',
      'The number of persons on board',
      'The nature of the distress',
      'The kind of assistance you want',
    ],
    correctAnswer: 'Your position',
    explanation:
      'Radio procedure: Position comes first of the details, because it is the one piece of the call that everything else depends on - a rescue that knows what is wrong but not where you are cannot start. Give it as latitude and longitude, or as a bearing and distance from a charted mark.',
  },
  {
    id: 'vf-08',
    category: 'vhf-procedure',
    prompt: 'After the position, what else does a distress call have to carry?',
    options: [
      'The nature of the distress, the assistance you want, and the number of persons on board',
      'The nature of the distress and your intended destination',
      'The number of persons on board and the vessel\'s registration number',
      'The name of your insurer and the vessel\'s home port',
    ],
    correctAnswer:
      'The nature of the distress, the assistance you want, and the number of persons on board',
    explanation:
      'Radio procedure: Nature of the distress, assistance required, and persons on board - then anything else that would help, such as what the vessel looks like and whether she is being abandoned. The head count is what the search is still working from hours later, so it is never left out.',
  },
  {
    id: 'vf-09',
    category: 'vhf-procedure',
    prompt:
      'There is a fire in your engine compartment. It is spreading, you cannot control it, and you are preparing to abandon. Which call do you make?',
    options: ['Mayday', 'Pan-Pan', 'Securite', 'A routine call to the marina on a working channel'],
    correctAnswer: 'Mayday',
    explanation:
      'Radio procedure: A fire out of control on board, with the crew about to take to the water, is grave and imminent danger - Mayday, without hesitating over whether it is bad enough. A call made early can be downgraded later; one made late cannot be made earlier.',
  },
  {
    id: 'vf-10',
    category: 'vhf-procedure',
    prompt:
      'Your engine has failed and you are drifting slowly toward a rocky shore about a mile downwind. Nobody is hurt and the boat is sound. Which call do you make?',
    options: ['Pan-Pan', 'Mayday', 'Securite', 'No call - wait until you are closer to the rocks'],
    correctAnswer: 'Pan-Pan',
    explanation:
      'Radio procedure: This is the textbook urgency call - the vessel is in trouble and the trouble is getting worse, but nobody is yet in danger of their life. Pan-Pan now brings a tow before the situation turns into the Mayday it would otherwise become.',
  },
  {
    id: 'vf-11',
    category: 'vhf-procedure',
    prompt:
      'You pass a half-submerged shipping container drifting in a busy fairway. Which call do you make?',
    options: ['Securite', 'Pan-Pan', 'Mayday', 'None - report it by telephone once ashore'],
    correctAnswer: 'Securite',
    explanation:
      'Radio procedure: A hazard to navigation that threatens nobody at this moment is a safety message - Securite, then the position and description of what you saw. The next boat down the channel may be smaller, faster, or looking the other way.',
  },
  {
    id: 'vf-12',
    category: 'vhf-procedure',
    prompt:
      'A coast station is about to broadcast a gale warning. Which word will open the announcement?',
    options: ['Securite', 'Mayday', 'Pan-Pan', 'Seelonce'],
    correctAnswer: 'Securite',
    explanation:
      'Radio procedure: Meteorological warnings and navigational warnings are safety traffic, so a coast station opens with Securite on 16 and then names the channel the broadcast itself will be made on.',
  },
  {
    id: 'vf-13',
    category: 'vhf-procedure',
    prompt:
      'You hear a Mayday from a vessel some distance away. You are not in a position to help. What do you do?',
    options: [
      'Keep silent on the channel, listen, and write down what you hear',
      'Answer at once to say that you cannot help',
      'Switch off the radio so you do not add to the traffic',
      'Change to a working channel and carry on with your own business',
    ],
    correctAnswer: 'Keep silent on the channel, listen, and write down what you hear',
    explanation:
      'Radio procedure: Silence and a written note. If nobody nearer answers, what you wrote down may be all anyone has. The station in distress, or a station handling the traffic, can impose silence on the channel with "Seelonce Mayday", and that binds every set within range.',
  },
  {
    id: 'vf-14',
    category: 'vhf-procedure',
    prompt:
      'You can see a boat in serious trouble, and you have heard her try to call for help on a radio that is clearly not transmitting. What do you send?',
    options: [
      'A Mayday Relay, giving her position and what you can see',
      'A Mayday, as though the distress were your own',
      'A Pan-Pan, because your own vessel is not in danger',
      'Nothing on the radio - close her and take the crew off first',
    ],
    correctAnswer: 'A Mayday Relay, giving her position and what you can see',
    explanation:
      'Radio procedure: "Mayday Relay" is the call for a distress that is not your own - a vessel whose radio has failed, or one you have heard whose call nobody answered. You give her position and situation, and identify your own vessel as the station relaying, so nobody comes looking for the wrong boat.',
  },
  {
    id: 'vf-15',
    category: 'vhf-procedure',
    prompt: 'You want to arrange a berth with a marina on VHF. How is the channel used?',
    options: [
      'Call briefly on 16, agree a working channel, and pass the whole message there',
      'Pass the whole message on 16, since that is the calling channel',
      'Call on 16 and wait there until the marina is ready to deal with you',
      'Use 16 only if the marina does not answer on a working channel',
    ],
    correctAnswer: 'Call briefly on 16, agree a working channel, and pass the whole message there',
    explanation:
      'Radio procedure: 16 is for calling and for the three priority calls, not for conversation. Establish contact, agree a working channel, and go there - the boat whose Mayday comes thirty seconds later needs the channel you would otherwise be filling with a berthing chat.',
  },
  {
    id: 'vf-16',
    category: 'vhf-procedure',
    prompt: 'What is the difference between "Over" and "Out"?',
    options: [
      'Over invites a reply; Out ends the exchange, and the two are never said together',
      'Over ends the exchange; Out invites a reply',
      'They mean the same thing, and "Over and out" is the correct full form',
      'Over is used on 16 and Out is used on working channels',
    ],
    correctAnswer: 'Over invites a reply; Out ends the exchange, and the two are never said together',
    explanation:
      'Radio procedure: Over hands the channel to the other station and expects an answer. Out says the exchange is finished and no answer is expected. "Over and out" is the two contradicting each other in one breath, which is why it exists in films and not on the water.',
  },
  {
    id: 'vf-17',
    category: 'vhf-procedure',
    prompt: 'You have sent a DSC distress alert from your radio. What do you do next?',
    options: [
      'Follow it immediately with a spoken Mayday call on Channel 16',
      'Wait silently for an acknowledgement before transmitting anything',
      'Send the alert again every minute until someone answers',
      'Switch to a working channel and call for help there',
    ],
    correctAnswer: 'Follow it immediately with a spoken Mayday call on Channel 16',
    explanation:
      'Radio procedure: The digital alert carries your identity and, if the set knows it, your position - it does not carry what is wrong or how many people are aboard. The spoken Mayday on 16 is what makes it a call anyone can act on. An alert sent by accident is cancelled, out loud on 16, and never simply switched off and ignored.',
  },
];

// --- COMBINED EXPORT ---

export const COLREGS_QUESTIONS: ColregsQuestion[] = [
  ...navigationLightsQuestions,
  ...soundSignalsQuestions,
  ...vesselHierarchyQuestions,
  ...dayShapesQuestions,
  ...vesselTypesQuestions,
  ...anchorTypesQuestions,
  ...buoyageQuestions,
  ...chartSymbolsQuestions,
  ...distressSignalsQuestions,
  ...vhfProcedureQuestions,
];

export const COLREGS_QUESTIONS_BY_CATEGORY: Record<ColregsCategory, ColregsQuestion[]> = {
  'navigation-lights': navigationLightsQuestions,
  'sound-signals': soundSignalsQuestions,
  'vessel-hierarchy': vesselHierarchyQuestions,
  'day-shapes': dayShapesQuestions,
  'vessel-types': vesselTypesQuestions,
  'anchor-types': anchorTypesQuestions,
  'buoyage': buoyageQuestions,
  'chart-symbols': chartSymbolsQuestions,
  'distress-signals': distressSignalsQuestions,
  'vhf-procedure': vhfProcedureQuestions,
};

export const CATEGORY_LABELS: Record<ColregsCategory, string> = {
  'navigation-lights': 'Navigation Lights',
  'sound-signals': 'Sound Signals',
  'vessel-hierarchy': 'Vessel Hierarchy',
  'day-shapes': 'Day Shapes',
  'vessel-types': 'Vessel Types',
  'anchor-types': 'Anchor Types',
  'buoyage': 'Buoyage',
  'chart-symbols': 'Chart Symbols',
  'distress-signals': 'Distress Signals',
  'vhf-procedure': 'VHF Procedure',
};
