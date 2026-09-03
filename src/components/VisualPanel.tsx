import React from 'react';
import {
  QUESTION_LIGHTS,
  QUESTION_SCENARIOS,
  QUESTION_SHAPES,
  QUESTION_SOUNDS,
  QUESTION_SOUND_GAPS,
  QUESTION_VESSEL_TYPES,
  QUESTION_ANCHORS,
  QUESTION_BUOYS,
  QUESTION_DISTRESS,
  QUESTION_PFDS,
  QUESTION_BOAT_PARTS,
} from '../drills/colregs';
import { LightDisplay } from '../drills/colregs/components/LightDisplay';
import { DayShapeDisplay } from '../drills/colregs/components/DayShapeDisplay';
import { VesselProfile } from '../drills/colregs/components/VesselProfile';
import { VesselScenario } from '../drills/colregs/components/VesselScenario';
import { SoundSignalDisplay } from '../drills/colregs/components/SoundSignalDisplay';
import { AnchorDisplay } from '../drills/colregs/components/AnchorDisplay';
import { BuoyDisplay } from '../drills/colregs/components/BuoyDisplay';
import { DistressDisplay } from '../drills/colregs/components/DistressDisplay';
import { PfdDisplay } from '../drills/colregs/components/PfdDisplay';
import { BoatPartDisplay } from '../drills/colregs/components/BoatPartDisplay';

// 75 of the 78 bank questions are answered from a picture rather than from the
// prompt text - "identify this vessel from what she is showing". The canvas
// design had no visual slot because its placeholder bank was all text, so this
// panel is an addition to it. Without one those questions are unanswerable.
//
// The visuals are the colregs drill's own components, reused unchanged. The
// dark ground they need comes from the shared .ct-instrument class in
// ChartFrame, which the compass drill's rose sits on too.

interface VisualPanelProps {
  questionId: string;
  // Gates the parts of a scenario diagram that state the give-way outcome.
  // False until the question is answered, so the picture cannot give away its
  // own answer - the same contract the colregs drill honours.
  revealed: boolean;
}

// One resolver, used by both the panel and the "is there a picture?" question
// the quiz grid asks. They used to be two independent lists - `hasVisual`
// tested `!== undefined` on ten maps while the panel tested each value for
// truthiness - and they agreed only because no map happens to hold a falsy
// value. A single falsy entry would have made `hasVisual` true and the panel
// null: the quiz body would reserve its 260px diagram column and draw nothing
// in it. Deriving one from the other removes that class of drift entirely.
//
// Precedence is the colregs drill's own, so a question carrying more than one
// mapping renders the same visual in both places.
function resolveVisual(questionId: string, revealed: boolean): React.ReactNode {
  const vesselType = QUESTION_VESSEL_TYPES[questionId];
  if (vesselType) return <VesselProfile type={vesselType} label="Vessel" />;

  const lights = QUESTION_LIGHTS[questionId];
  if (lights) return <LightDisplay active={lights} label="Vessel Lights" />;

  const sounds = QUESTION_SOUNDS[questionId];
  if (sounds) {
    return (
      <SoundSignalDisplay
        key={questionId}
        sequence={sounds}
        gapS={QUESTION_SOUND_GAPS[questionId]}
        label="Blast Sequence"
      />
    );
  }

  const shapes = QUESTION_SHAPES[questionId];
  if (shapes) {
    return (
      <DayShapeDisplay
        shapes={shapes.shapes}
        position={shapes.position}
        arrangement={shapes.arrangement}
        label="Day Shapes"
      />
    );
  }

  const scenario = QUESTION_SCENARIOS[questionId];
  if (scenario) return <VesselScenario scenario={scenario} label="Scenario" revealed={revealed} />;

  const anchor = QUESTION_ANCHORS[questionId];
  if (anchor) return <AnchorDisplay type={anchor} label="Anchor" />;

  const buoy = QUESTION_BUOYS[questionId];
  if (buoy) return <BuoyDisplay type={buoy} label="Mark" />;

  const distress = QUESTION_DISTRESS[questionId];
  if (distress) return <DistressDisplay signal={distress} label="Signal" />;

  const pfd = QUESTION_PFDS[questionId];
  if (pfd) return <PfdDisplay form={pfd} label="Device" />;

  const boatPart = QUESTION_BOAT_PARTS[questionId];
  if (boatPart) return <BoatPartDisplay part={boatPart} label="Highlighted" />;

  return null;
}

// Whether this question is answered from a picture. `revealed` cannot change
// the answer - every branch above either has a mapping or does not - so the
// grid can ask this before it knows whether the question has been answered.
export function hasVisual(questionId: string): boolean {
  return resolveVisual(questionId, false) !== null;
}

export const VisualPanel: React.FC<VisualPanelProps> = ({ questionId, revealed }) => {
  const inner = resolveVisual(questionId, revealed);

  // A question with no mapping draws nothing at all. That is necessary but it
  // was not sufficient: this panel and the ScenarioCard beside it are siblings,
  // and while they shared the key `current.id` React stopped unmounting this
  // one, so returning null here still left the previous diagram in the
  // document. The caller keys them apart now - see the note there.
  if (!inner) return null;

  return (
    <div className="ct-instrument">
      <div className="ct-instrument-label">Observed</div>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>{inner}</div>
    </div>
  );
};
