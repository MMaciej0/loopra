import type { Position } from 'geojson';
import { ELEVATION_THRESHOLD_M } from './config.js';
import { readPointElevation, round2 } from './utils.js';

export const measureElevation = (segments: Position[][]): { ascentM: number; descentM: number } => {
  let ascentM = 0;
  let descentM = 0;

  for (const segment of segments) {
    let lastMeasurement: number | null = null;

    for (const point of segment) {
      const elevation = readPointElevation(point);

      if (elevation === null) {
        continue;
      }

      if (lastMeasurement === null) {
        lastMeasurement = elevation;
        continue;
      }

      const delta = elevation - lastMeasurement;

      if (Math.abs(delta) > ELEVATION_THRESHOLD_M) {
        if (delta > 0) {
          ascentM += delta;
        } else {
          descentM += -delta;
        }

        lastMeasurement = elevation;
      }
    }
  }

  return { ascentM: round2(ascentM), descentM: round2(descentM) };
};
