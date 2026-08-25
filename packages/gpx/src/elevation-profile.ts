import type { Position } from 'geojson';
import { MAX_ELEVATION_POINTS } from './config.js';
import { calculateDistanceKm } from './distance.js';
import { readPointElevation, round2 } from './utils.js';

export const createElevationProfile = (segments: Position[][]) => {
  const { distanceKm, elevationProfile } = createElevationProfileFromSegments(segments);

  const totalPoints = elevationProfile.reduce((acc, profile) => acc + profile.length, 0);

  if (totalPoints <= MAX_ELEVATION_POINTS) {
    return { distanceKm, elevationProfile };
  }

  return {
    distanceKm,
    elevationProfile: elevationProfile.map((profile) =>
      downsampleProfile(
        profile,
        Math.max(2, Math.round((MAX_ELEVATION_POINTS * profile.length) / totalPoints)),
      ),
    ),
  };
};

const createElevationProfileFromSegments = (segments: Position[][]) => {
  let distanceKm = 0;
  const elevationProfile: [number, number][][] = [];

  for (const segment of segments) {
    let lastPoint: Position | null = null;
    const profile: [number, number][] = [];

    for (const point of segment) {
      if (lastPoint !== null) {
        distanceKm += calculateDistanceKm(lastPoint, point);
      }

      lastPoint = point;

      const elevation = readPointElevation(point);

      if (elevation === null) {
        continue;
      }

      profile.push([round2(distanceKm), Math.round(elevation)]);
    }

    if (profile.length > 0) {
      elevationProfile.push(profile);
    }
  }

  return {
    distanceKm: round2(distanceKm),
    elevationProfile,
  };
};

const downsampleProfile = (profile: [number, number][], maxPoints: number): [number, number][] => {
  if (profile.length <= maxPoints) {
    return profile;
  }

  const bucketCount = Math.max(1, Math.floor(maxPoints / 2));
  const bucketSize = profile.length / bucketCount;

  const downsampled: [number, number][] = [];

  for (let b = 0; b < bucketCount; b += 1) {
    const start = Math.floor(b * bucketSize);
    const end = Math.floor((b + 1) * bucketSize);

    let minIndex = start;
    let maxIndex = start;

    for (let i = start; i < end; i += 1) {
      const elevation = profile[i]![1];

      if (elevation < profile[minIndex]![1]) {
        minIndex = i;
      }

      if (elevation > profile[maxIndex]![1]) {
        maxIndex = i;
      }
    }

    const firstIndex = Math.min(minIndex, maxIndex);
    const secondIndex = Math.max(minIndex, maxIndex);

    const firstPoint = profile[firstIndex];
    if (firstPoint) {
      downsampled.push(firstPoint);
    }

    if (secondIndex !== firstIndex) {
      const secondPoint = profile[secondIndex];
      if (secondPoint) {
        downsampled.push(secondPoint);
      }
    }
  }

  const start = profile[0]!;
  const finish = profile[profile.length - 1]!;

  if (downsampled[0] !== start) {
    downsampled.unshift(start);
  }

  if (downsampled[downsampled.length - 1] !== finish) {
    downsampled.push(finish);
  }

  return downsampled;
};
