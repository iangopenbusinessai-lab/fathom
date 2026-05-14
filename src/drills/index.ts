import { DrillConfig } from '../types';
import CompassDrill from './compass';
import ColregsDrill from './colregs';

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
