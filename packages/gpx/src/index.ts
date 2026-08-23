import { DOMParser } from '@xmldom/xmldom';
import { gpx } from '@tmcw/togeojson';
import { length } from '@turf/length';
import { toSegments } from './segments.js';
import { measureElevation } from './elevation.js';
import { countPoints, round2 } from './utils.js';
import { simplifyTrack } from './track-simplifier.js';
import type { Position } from 'geojson';

export interface GpxMetadata {
  name: string | null;
  distanceKm: number;
  ascentM: number;
  descentM: number;
  pointCount: number;
  simplifiedTrack: Position[][];
}

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
  const pointsCount = countPoints(segments);

  return {
    name: feature.properties?.name || null,
    distanceKm: round2(length(feature, { units: 'kilometers' })),
    pointCount: pointsCount,
    ascentM,
    descentM,
    simplifiedTrack: simplifyTrack(segments, pointsCount),
  };
};
