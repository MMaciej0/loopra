import type { Position } from 'geojson';
import { COORDINATE_FACTOR } from './config.js';

export const round2 = (value: number) => Math.round(value * 100) / 100;

export const countPoints = (segments: Position[][]): number => {
  return segments.reduce((acc, segment) => acc + segment.length, 0);
};

export const readPointElevation = (point: Position | undefined): number | null => {
  const elevation = point?.[2];

  return elevation === undefined || elevation === null ? null : elevation;
};

export const roundCoordinate = (value: number) =>
  Math.round(value * COORDINATE_FACTOR) / COORDINATE_FACTOR;

export const roundPoint = (point: Position): Position => {
  const [longitude, latitude, elevation] = point;

  if (longitude === undefined || latitude === undefined) {
    return point;
  }

  const rounded: Position = [roundCoordinate(longitude), roundCoordinate(latitude)];

  if (elevation !== undefined && elevation !== null) {
    rounded.push(Math.round(elevation));
  }

  return rounded;
};
