import { DrillConfig } from '../types';
import CompassDrill from './compass';

export const DRILLS: DrillConfig[] = [
  {
    id: 'compass',
    title: 'Compass & Relative Bearings',
    description: 'Master the 32-point compass rose and relative ship bearings.',
    component: CompassDrill,
  },
];
