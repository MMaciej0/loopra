import { DOMParser } from '@xmldom/xmldom';
import { gpx } from '@tmcw/togeojson';
import { toSegments } from './segments.js';
import { measureElevation } from './elevation.js';
import { createElevationProfile } from './elevation-profile.js';
import { countPoints } from './utils.js';

export interface GpxMetadata {
  name: string | null;
  distanceKm: number;
  ascentM: number;
  descentM: number;
  pointCount: number;
  elevationProfile: [number, number][][];
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
  const { distanceKm, elevationProfile } = createElevationProfile(segments);

  return {
    name: feature.properties?.name || null,
    distanceKm,
    ascentM,
    descentM,
    pointCount: countPoints(segments),
    elevationProfile,
  };
};
