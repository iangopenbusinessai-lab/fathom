import { DrillConfig } from '../types';
import CompassDrill from './compass';
import ColregsDrill from './colregs';

// The hub is the syllabus index in src/lib/syllabus.ts, not this list. A drill
// here is the engine a syllabus category is routed to (see drillTargetFor),
// which is why there are fewer entries here than cards on the hub.
export const DRILLS: DrillConfig[] = [
  {
    id: 'compass',
    title: 'Compass & Relative Bearings',
    description: 'Master the 32-point compass rose and relative ship bearings.',
    component: CompassDrill,
  },
  {
    id: 'colregs',
    title: 'COLREGS',
    description: 'Navigation lights, sound signals, vessel hierarchy, and day shapes.',
    component: ColregsDrill,
  },
];
