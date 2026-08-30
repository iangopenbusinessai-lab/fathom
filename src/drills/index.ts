import { DrillConfig } from '../types';
import CompassDrill from './compass';
import ColregsDrill from './colregs';
import ChartTableDrill from './charttable';

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
  {
    id: 'charttable',
    title: 'Chart Table',
    description: 'Browse the syllabus by category, then drill or sit an exam against the rule.',
    component: ChartTableDrill,
  },
];
