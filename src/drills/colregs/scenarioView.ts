// Pure view model for the give-way scenario diagram.
//
// Extracted from VesselScenario.tsx so the answer-leak gating can be asserted
// directly in tests, without rendering a component. The component is now only
// responsible for turning this view into SVG.
//
// THE LEAK RULE - three things state or encode the give-way outcome, and none
// of them may appear before the player has answered:
//   1. the role suffix on a vessel's label ("Fishing (Stand-On)"),
//   2. the caption, which states the rule and its outcome outright, and
//   3. the give-way/stand-on hull colours and the legend decoding them.
// The vessel TYPE half of a label ("Fishing", "RAM") stays visible throughout:
// it frames the question, and without knowing Rule 18 it does not answer it.
//
// buildScenarioView deliberately does NOT return the true role. The view holds
// only what is drawn, so an unrevealed view carries no role information at all
// rather than relying on the component to remember not to render it.

export type ScenarioType =
  | 'head-on'
  | 'crossing-stbd'         // other vessel on own starboard → own vessel is give-way
  | 'crossing-port'         // other vessel on own port → own vessel is stand-on
  | 'overtaking'            // own vessel overtaking another from astern
  | 'being-overtaken'
  | 'standon-may-act'       // give-way vessel is not acting → stand-on may manoeuvre
  | 'priority-nuc'          // Rule 18 — all vessels keep clear of a NUC vessel
  | 'sail-keeps-clear-ram'  // Rule 18 — sailing vessel keeps clear of a RAM vessel
  | 'fishing-over-sailing'  // Rule 18 — sailing vessel keeps clear of a fishing vessel
  | 'hierarchy-ladder'      // Rule 18 — the full responsibilities ordering
  | 'sail-vs-sail'          // Rule 12 — two sailing vessels, wind on different sides
  | 'narrow-channel';       // Rule 9  — keeping to the starboard side of a channel

export type VesselRole = 'give-way' | 'stand-on' | 'neutral';

export interface VesselDef {
  x: number;
  y: number;
  rotation: number;
  role: 'give-way' | 'stand-on' | 'neutral';
  label: string;
  showArrow?: boolean;
  arrowDx?: number;
  arrowDy?: number;
}

const ROLE_SUFFIX: Record<VesselDef['role'], string> = {
  'give-way': ' (Give-Way)',
  'stand-on': ' (Stand-On)',
  'neutral': '',
};

const SCENARIOS: Record<ScenarioType, { vessels: VesselDef[]; caption: string }> = {
  'head-on': {
    caption: 'Head-On — both alter course to starboard (pass port-to-port)',
    vessels: [
      { x: 100, y: 200, rotation: 0,   role: 'neutral', label: 'Own',   showArrow: true, arrowDx: 0,   arrowDy: -28 },
      { x: 100, y: 70,  rotation: 180, role: 'neutral', label: 'Other', showArrow: true, arrowDx: 0,   arrowDy: 28  },
    ],
  },
  'crossing-stbd': {
    caption: 'Crossing — other vessel on own starboard. Own vessel gives way.',
    vessels: [
      { x: 90,  y: 170, rotation: 0,    role: 'give-way',  label: 'Own',  showArrow: true, arrowDx: 0,   arrowDy: -28 },
      { x: 210, y: 110, rotation: -90,  role: 'stand-on',  label: 'Other', showArrow: true, arrowDx: -28, arrowDy: 0   },
    ],
  },
  'crossing-port': {
    caption: 'Crossing — other vessel on own port. Own vessel stands on.',
    vessels: [
      { x: 210, y: 170, rotation: 0,    role: 'stand-on',  label: 'Own', showArrow: true, arrowDx: 0,   arrowDy: -28 },
      { x: 90,  y: 110, rotation: 90,   role: 'give-way',  label: 'Other', showArrow: true, arrowDx: 28,  arrowDy: 0   },
    ],
  },
  'overtaking': {
    caption: 'Overtaking — the vessel coming up from astern must keep clear.',
    vessels: [
      { x: 100, y: 85,  rotation: 0,   role: 'stand-on',  label: 'Ahead',    showArrow: true, arrowDx: 0, arrowDy: -24 },
      { x: 100, y: 195, rotation: 0,   role: 'give-way',  label: 'Overtaking', showArrow: true, arrowDx: 0, arrowDy: -24 },
    ],
  },
  'being-overtaken': {
    caption: 'Being Overtaken — the vessel being overtaken is the stand-on vessel.',
    vessels: [
      { x: 100, y: 85,  rotation: 0,   role: 'give-way',  label: 'Overtaking', showArrow: true, arrowDx: 0, arrowDy: -24 },
      { x: 100, y: 195, rotation: 0,   role: 'stand-on',  label: 'Own',         showArrow: true, arrowDx: 0, arrowDy: -24 },
    ],
  },
  'standon-may-act': {
    caption: 'Give-way vessel is not acting — the stand-on vessel may take avoiding action (Rule 17).',
    vessels: [
      { x: 190, y: 190, rotation: 0,   role: 'stand-on', label: 'Own',   showArrow: true, arrowDx: 0,  arrowDy: -28 },
      { x: 110, y: 120, rotation: 90,  role: 'give-way', label: 'Other', showArrow: true, arrowDx: 28, arrowDy: 0   },
    ],
  },
  'priority-nuc': {
    caption: 'Rule 18 — every other vessel keeps clear of a vessel Not Under Command.',
    vessels: [
      { x: 200, y: 105, rotation: 25, role: 'stand-on', label: 'NUC',    showArrow: false },
      { x: 95,  y: 195, rotation: 0,  role: 'give-way', label: 'Power',  showArrow: true, arrowDx: 0, arrowDy: -28 },
    ],
  },
  'sail-keeps-clear-ram': {
    caption: 'Rule 18 — a sailing vessel keeps clear of a RAM vessel, and must not impede one constrained by her draft.',
    vessels: [
      { x: 205, y: 110, rotation: -90, role: 'stand-on', label: 'RAM',     showArrow: true, arrowDx: -28, arrowDy: 0 },
      { x: 90,  y: 190, rotation: 0,   role: 'give-way', label: 'Sailing', showArrow: true, arrowDx: 0,   arrowDy: -28 },
    ],
  },
  'fishing-over-sailing': {
    caption: 'Rule 18 — a sailing vessel keeps clear of a vessel engaged in fishing.',
    vessels: [
      { x: 95,  y: 110, rotation: 90, role: 'stand-on', label: 'Fishing', showArrow: true, arrowDx: 28, arrowDy: 0 },
      { x: 205, y: 190, rotation: 0,  role: 'give-way', label: 'Sailing', showArrow: true, arrowDx: 0,  arrowDy: -28 },
    ],
  },
  'sail-vs-sail': {
    caption: 'Rule 12 — with the wind on different sides, the vessel with the wind on her port side keeps clear.',
    vessels: [
      { x: 95,  y: 105, rotation: 20,  role: 'give-way', label: 'Wind to Port',  showArrow: true, arrowDx: 14, arrowDy: 26 },
      { x: 205, y: 185, rotation: -20, role: 'stand-on', label: 'Wind to Stbd',  showArrow: true, arrowDx: -14, arrowDy: -26 },
    ],
  },
  'narrow-channel': {
    caption: 'Rule 9 — keep to the starboard side of the channel; small craft and sailing vessels must not impede a vessel that can navigate only within it.',
    vessels: [
      { x: 196, y: 190, rotation: 0,   role: 'stand-on', label: 'Deep Draft', showArrow: true, arrowDx: 0, arrowDy: -30 },
      { x: 118, y: 120, rotation: 0,   role: 'give-way', label: 'Small Craft', showArrow: true, arrowDx: 0, arrowDy: -26 },
    ],
  },
  'hierarchy-ladder': {
    caption: 'Rule 18 order of responsibility — least burdened at the top, most burdened at the bottom.',
    vessels: [
      { x: 150, y: 34,  rotation: 0, role: 'stand-on', label: 'NUC' },
      { x: 150, y: 74,  rotation: 0, role: 'stand-on', label: 'RAM' },
      { x: 150, y: 114, rotation: 0, role: 'neutral',  label: 'CBD' },
      { x: 150, y: 154, rotation: 0, role: 'neutral',  label: 'Fishing' },
      { x: 150, y: 194, rotation: 0, role: 'give-way', label: 'Sailing' },
      { x: 150, y: 234, rotation: 0, role: 'give-way', label: 'Power-Driven' },
    ],
  },
};

export const SCENARIO_TYPES = Object.keys(SCENARIOS) as ScenarioType[];

export interface ScenarioVesselView {
  x: number;
  y: number;
  rotation: number;
  showArrow: boolean;
  arrowDx: number;
  arrowDy: number;
  /** Type-only before the reveal; gains the role suffix after. */
  label: string;
  /** Always 'neutral' before the reveal - never the true role. */
  colorRole: VesselRole;
}

export interface ScenarioView {
  vessels: ScenarioVesselView[];
  /** null until answered - the caption states the outcome. */
  caption: string | null;
  /** The legend decodes the role colours, so it follows the same gate. */
  showLegend: boolean;
}

export function buildScenarioView(scenario: ScenarioType, revealed: boolean): ScenarioView {
  const { vessels, caption } = SCENARIOS[scenario];

  return {
    vessels: vessels.map((v) => ({
      x: v.x,
      y: v.y,
      rotation: v.rotation,
      showArrow: v.showArrow ?? false,
      arrowDx: v.arrowDx ?? 0,
      arrowDy: v.arrowDy ?? 0,
      label: revealed ? `${v.label}${ROLE_SUFFIX[v.role]}` : v.label,
      colorRole: revealed ? v.role : 'neutral',
    })),
    caption: revealed ? caption : null,
    showLegend: revealed,
  };
}
