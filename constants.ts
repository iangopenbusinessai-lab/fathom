import { CompassPoint } from './types';

// Helper to categorize point types based on index (0-31)
const getPointType = (index: number): CompassPoint['type'] => {
  if (index % 8 === 0) return 'cardinal'; // N, E, S, W
  if (index % 4 === 0) return 'intercardinal'; // NE, SE, SW, NW
  if (index % 2 === 0) return 'secondary-intercardinal'; // NNE, ENE, etc.
  return 'tertiary-intercardinal'; // NxE, etc.
};

// --- COMPASS POINTS ---
const rawCompassPoints = [
  { abbr: 'N', full: 'North' },
  { abbr: 'NxE', full: 'North by East' },
  { abbr: 'NNE', full: 'North-Northeast' },
  { abbr: 'NExN', full: 'Northeast by North' },
  { abbr: 'NE', full: 'Northeast' },
  { abbr: 'NExE', full: 'Northeast by East' },
  { abbr: 'ENE', full: 'East-Northeast' },
  { abbr: 'ExN', full: 'East by North' },
  { abbr: 'E', full: 'East' },
  { abbr: 'ExS', full: 'East by South' },
  { abbr: 'ESE', full: 'East-Southeast' },
  { abbr: 'SExE', full: 'Southeast by East' },
  { abbr: 'SE', full: 'Southeast' },
  { abbr: 'SExS', full: 'Southeast by South' },
  { abbr: 'SSE', full: 'South-Southeast' },
  { abbr: 'SxE', full: 'South by East' },
  { abbr: 'S', full: 'South' },
  { abbr: 'SxW', full: 'South by West' },
  { abbr: 'SSW', full: 'South-Southwest' },
  { abbr: 'SWxS', full: 'Southwest by South' },
  { abbr: 'SW', full: 'Southwest' },
  { abbr: 'SWxW', full: 'Southwest by West' },
  { abbr: 'WSW', full: 'West-Southwest' },
  { abbr: 'WxS', full: 'West by South' },
  { abbr: 'W', full: 'West' },
  { abbr: 'WxN', full: 'West by North' },
  { abbr: 'WNW', full: 'West-Northwest' },
  { abbr: 'NWxW', full: 'Northwest by West' },
  { abbr: 'NW', full: 'Northwest' },
  { abbr: 'NWxN', full: 'Northwest by North' },
  { abbr: 'NNW', full: 'North-Northwest' },
  { abbr: 'NxW', full: 'North by West' },
];

export const COMPASS_POINTS: CompassPoint[] = rawCompassPoints.map((p, i) => ({
  index: i,
  abbr: p.abbr,
  full: p.full,
  angle: i * 11.25,
  type: getPointType(i),
}));

// --- RELATIVE POINTS ---
// 0 is Dead Ahead. 8 is Stbd Beam. 16 is Dead Astern. 24 is Port Beam.
const rawRelativePoints = [
  { abbr: 'Dead Ahead', full: 'Dead Ahead' },
  { abbr: 'Stbd 1 pt', full: '1 point on Starboard Bow' },
  { abbr: 'Stbd 2 pts', full: '2 points on Starboard Bow' },
  { abbr: 'Stbd 3 pts', full: '3 points on Starboard Bow' },
  { abbr: 'Broad Stbd Bow', full: 'Broad on Starboard Bow' },
  { abbr: '3 pts fwd Stbd Beam', full: '3 points forward of Starboard Beam' },
  { abbr: '2 pts fwd Stbd Beam', full: '2 points forward of Starboard Beam' },
  { abbr: '1 pt fwd Stbd Beam', full: '1 point forward of Starboard Beam' },
  { abbr: 'Stbd Beam', full: 'Starboard Beam' },
  { abbr: '1 pt abaft Stbd Beam', full: '1 point abaft Starboard Beam' },
  { abbr: '2 pts abaft Stbd Beam', full: '2 points abaft Starboard Beam' },
  { abbr: '3 pts abaft Stbd Beam', full: '3 points abaft Starboard Beam' },
  { abbr: 'Broad Stbd Qtr', full: 'Broad on Starboard Quarter' },
  { abbr: 'Stbd 3 pts Qtr', full: '3 points on Starboard Quarter' },
  { abbr: 'Stbd 2 pts Qtr', full: '2 points on Starboard Quarter' },
  { abbr: 'Stbd 1 pt Qtr', full: '1 point on Starboard Quarter' },
  { abbr: 'Dead Astern', full: 'Dead Astern' },
  { abbr: 'Port 1 pt Qtr', full: '1 point on Port Quarter' },
  { abbr: 'Port 2 pts Qtr', full: '2 points on Port Quarter' },
  { abbr: 'Port 3 pts Qtr', full: '3 points on Port Quarter' },
  { abbr: 'Broad Port Qtr', full: 'Broad on Port Quarter' },
  { abbr: '3 pts abaft Port Beam', full: '3 points abaft Port Beam' },
  { abbr: '2 pts abaft Port Beam', full: '2 points abaft Port Beam' },
  { abbr: '1 pt abaft Port Beam', full: '1 point abaft Port Beam' },
  { abbr: 'Port Beam', full: 'Port Beam' },
  { abbr: '1 pt fwd Port Beam', full: '1 point forward of Port Beam' },
  { abbr: '2 pts fwd Port Beam', full: '2 points forward of Port Beam' },
  { abbr: '3 pts fwd Port Beam', full: '3 points forward of Port Beam' },
  { abbr: 'Broad Port Bow', full: 'Broad on Port Bow' },
  { abbr: 'Port 3 pts', full: '3 points on Port Bow' },
  { abbr: 'Port 2 pts', full: '2 points on Port Bow' },
  { abbr: 'Port 1 pt', full: '1 point on Port Bow' },
];

export const RELATIVE_POINTS: CompassPoint[] = rawRelativePoints.map((p, i) => ({
  index: i,
  abbr: p.abbr,
  full: p.full,
  angle: i * 11.25,
  type: getPointType(i),
}));

export const ERROR_MESSAGES = [
  "Off course!",
  "Adrift!",
  "Lost!",
];

export const SUCCESS_MESSAGES = [
  "Dead ahead!",
  "True!",
  "On point!",
];