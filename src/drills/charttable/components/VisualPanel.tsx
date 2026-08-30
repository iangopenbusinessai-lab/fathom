import React from 'react';
import {
  QUESTION_LIGHTS,
  QUESTION_SCENARIOS,
  QUESTION_SHAPES,
  QUESTION_SOUNDS,
  QUESTION_SOUND_GAPS,
  QUESTION_VESSEL_TYPES,
} from '../../colregs';
import { LightDisplay } from '../../colregs/components/LightDisplay';
import { DayShapeDisplay } from '../../colregs/components/DayShapeDisplay';
import { VesselProfile } from '../../colregs/components/VesselProfile';
import { VesselScenario } from '../../colregs/components/VesselScenario';
import { SoundSignalDisplay } from '../../colregs/components/SoundSignalDisplay';
import { MONO } from '../theme';

// 75 of the 78 bank questions are answered from a picture rather than from the
// prompt text - "identify this vessel from what she is showing". The canvas
// design had no visual slot because its placeholder bank was all text, so this
// panel is an addition to it. Without one those questions are unanswerable.
//
// The visuals are the colregs drill's own components, reused unchanged. They
// draw white masthead lights, so they need a dark ground and would vanish on
// the parchment. The panel is therefore always dark in both themes, read as a
// lit instrument sitting on the chart table.

const PANEL_BG = '#0a1929';

interface VisualPanelProps {
  questionId: string;
  // Gates the parts of a scenario diagram that state the give-way outcome.
  // False until the question is answered, so the picture cannot give away its
  // own answer - the same contract the colregs drill honours.
  revealed: boolean;
}

// Same precedence the colregs drill uses, so a question with more than one
// mapping renders the same visual in both places.
export function hasVisual(questionId: string): boolean {
  return (
    QUESTION_VESSEL_TYPES[questionId] !== undefined ||
    QUESTION_LIGHTS[questionId] !== undefined ||
    QUESTION_SOUNDS[questionId] !== undefined ||
    QUESTION_SHAPES[questionId] !== undefined ||
    QUESTION_SCENARIOS[questionId] !== undefined
  );
}

export const VisualPanel: React.FC<VisualPanelProps> = ({ questionId, revealed }) => {
  const vesselType = QUESTION_VESSEL_TYPES[questionId];
  const lights = QUESTION_LIGHTS[questionId];
  const sounds = QUESTION_SOUNDS[questionId];
  const shapes = QUESTION_SHAPES[questionId];
  const scenario = QUESTION_SCENARIOS[questionId];

  let inner: React.ReactNode = null;
  if (vesselType) {
    inner = <VesselProfile type={vesselType} label="Vessel" />;
  } else if (lights) {
    inner = <LightDisplay active={lights} label="Vessel Lights" />;
  } else if (sounds) {
    inner = (
      <SoundSignalDisplay
        key={questionId}
        sequence={sounds}
        gapS={QUESTION_SOUND_GAPS[questionId]}
        label="Blast Sequence"
      />
    );
  } else if (shapes) {
    inner = (
      <DayShapeDisplay
        shapes={shapes.shapes}
        position={shapes.position}
        arrangement={shapes.arrangement}
        label="Day Shapes"
      />
    );
  } else if (scenario) {
    inner = <VesselScenario scenario={scenario} label="Scenario" revealed={revealed} />;
  }

  if (!inner) return null;

  return (
    <div
      style={{
        background: PANEL_BG,
        border: '1px solid var(--ct-line)',
        padding: '18px 14px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 9,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'rgba(212,169,74,0.65)',
          alignSelf: 'flex-start',
        }}
      >
        Observed
      </div>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>{inner}</div>
    </div>
  );
};
