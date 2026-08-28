export type ColregsCategory =
  | 'navigation-lights'
  | 'sound-signals'
  | 'vessel-hierarchy'
  | 'day-shapes';

export interface ColregsQuestion {
  id: string;
  category: ColregsCategory;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

// --- NAVIGATION LIGHTS (10 questions) ---

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
];

// --- SOUND SIGNALS (8 questions) ---

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
      'Rule 32: A short blast is a blast of about one second duration.',
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
];

// --- VESSEL HIERARCHY (10 questions) ---

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
];

// --- DAY SHAPES (8 questions) ---

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
    prompt: 'A power-driven vessel proceeding under sail only (engine off) must display which day shape when underway?',
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
];

// --- COMBINED EXPORT ---

export const COLREGS_QUESTIONS: ColregsQuestion[] = [
  ...navigationLightsQuestions,
  ...soundSignalsQuestions,
  ...vesselHierarchyQuestions,
  ...dayShapesQuestions,
];

export const COLREGS_QUESTIONS_BY_CATEGORY: Record<ColregsCategory, ColregsQuestion[]> = {
  'navigation-lights': navigationLightsQuestions,
  'sound-signals': soundSignalsQuestions,
  'vessel-hierarchy': vesselHierarchyQuestions,
  'day-shapes': dayShapesQuestions,
};

export const CATEGORY_LABELS: Record<ColregsCategory, string> = {
  'navigation-lights': 'Navigation Lights',
  'sound-signals': 'Sound Signals',
  'vessel-hierarchy': 'Vessel Hierarchy',
  'day-shapes': 'Day Shapes',
};
