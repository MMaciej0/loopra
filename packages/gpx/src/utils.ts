import type { Position } from 'geojson';

export const round2 = (value: number) => Math.round(value * 100) / 100;

export const countPoints = (segments: Position[][]): number => {
  return segments.reduce((acc, segment) => acc + segment.length, 0);
};

export const readPointElevation = (point: Position | undefined): number | null => {
  const elevation = point?.[2];

  return elevation === undefined || elevation === null ? null : elevation;
};
