import type { Position } from 'geojson';
import simplify from 'simplify-js';
import { PATH_COORDINATE_DECIMALS, PATH_TOLERANCE_M } from './config.js';

const METRES_PER_DEGREE = 111_320;
const TOLERANCE_DEGREES = PATH_TOLERANCE_M / METRES_PER_DEGREE;
const COORDINATE_FACTOR = 10 ** PATH_COORDINATE_DECIMALS;

const roundCoordinate = (value: number) =>
  Math.round(value * COORDINATE_FACTOR) / COORDINATE_FACTOR;

export const createPath = (segments: Position[][]): [number, number][][] => {
  const path: [number, number][][] = [];

  for (const segment of segments) {
    if (segment.length === 0) {
      continue;
    }

    const points = segment.map(([lon, lat]) => {
      if (lon === undefined || lat === undefined) {
        throw new Error('Track point is missing coordinates');
      }

      return { x: lon, y: lat };
    });

    path.push(
      simplify(points, TOLERANCE_DEGREES, true).map(({ x, y }) => [
        roundCoordinate(x),
        roundCoordinate(y),
      ]),
    );
  }

  return path;
};
