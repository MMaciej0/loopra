import type { Geometry, Position } from 'geojson';

export const toSegments = (geometry: Geometry): Position[][] => {
  if (geometry.type === 'LineString') {
    return [geometry.coordinates];
  }

  if (geometry.type === 'MultiLineString') {
    return geometry.coordinates;
  }

  throw new Error('Unsupported geometry type');
};
