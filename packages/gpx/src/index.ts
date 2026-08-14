import { DOMParser } from '@xmldom/xmldom';
import { gpx } from '@tmcw/togeojson';
import { length } from '@turf/length';
import type { Geometry, Position } from 'geojson';

const ELEVATION_THRESHOLD_M = 1;

export interface GpxMetadata {
  name: string | null;
  distanceKm: number;
  ascentM: number;
  descentM: number;
  pointCount: number;
}

const round2 = (value: number) => Math.round(value * 100) / 100;

const toSegments = (geometry: Geometry): Position[][] => {
  if (geometry.type === 'LineString') {
    return [geometry.coordinates];
  }

  if (geometry.type === 'MultiLineString') {
    return geometry.coordinates;
  }

  throw new Error('Unsupported geometry type');
};

const countPoints = (segments: Position[][]): number => {
  return segments.reduce((acc, segment) => acc + segment.length, 0);
};

const measureElevation = (segments: Position[][]): { ascentM: number; descentM: number } => {
  let ascentM = 0;
  let descentM = 0;

  for (const segment of segments) {
    let lastMesurement: number | null = null;

    for (const point of segment) {
      const elevation = point[2];

      if (elevation === null || elevation === undefined) {
        continue;
      }

      if (lastMesurement === null) {
        lastMesurement = elevation;
        continue;
      }

      const delta = elevation - lastMesurement;

      if (Math.abs(delta) > ELEVATION_THRESHOLD_M) {
        if (delta > 0) {
          ascentM += delta;
        } else {
          descentM += -delta;
        }

        lastMesurement = elevation;
      }
    }
  }

  return { ascentM: round2(ascentM), descentM: round2(descentM) };
};

export const parseGPX = (gpxString: string): GpxMetadata => {
  const gpxDom = new DOMParser().parseFromString(gpxString, 'text/xml');
  const geojson = gpx(gpxDom);

  const feature = geojson.features[0];

  if (!feature) {
    throw new Error('No feature found');
  }

  const segments = toSegments(feature.geometry);

  if (segments.length === 0) {
    throw new Error('No segments found');
  }

  const { ascentM, descentM } = measureElevation(segments);

  return {
    name: feature.properties?.name || null,
    distanceKm: round2(length(feature, { units: 'kilometers' })),
    pointCount: countPoints(segments),
    ascentM,
    descentM,
  };
};
