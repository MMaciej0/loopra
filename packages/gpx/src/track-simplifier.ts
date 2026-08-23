import type { Position } from 'geojson';
import { MAX_SIMPLIFIED_POINTS } from './config.js';
import { readPointElevation, roundPoint } from './utils.js';

const simplifySegment = (points: Position[], budget: number): Position[] => {
  if (points.length <= budget) {
    return points;
  }

  const bucketCount = Math.max(1, Math.floor(budget / 2));
  const bucketSize = points.length / bucketCount;
  const simplified: Position[] = [];

  for (let b = 0; b < bucketCount; b += 1) {
    const start = Math.floor(b * bucketSize);
    const end = Math.floor((b + 1) * bucketSize);

    let minIndex = start;
    let maxIndex = start;

    for (let i = start; i < end; i += 1) {
      const elevation = readPointElevation(points[i]);

      if (elevation === null) {
        continue;
      }

      const lowest = readPointElevation(points[minIndex]);
      const highest = readPointElevation(points[maxIndex]);

      if (lowest === null || elevation < lowest) {
        minIndex = i;
      }

      if (highest === null || elevation > highest) {
        maxIndex = i;
      }
    }

    const firstIndex = Math.min(minIndex, maxIndex);
    const secondIndex = Math.max(minIndex, maxIndex);

    const firstPoint = points[firstIndex];
    if (firstPoint) {
      simplified.push(firstPoint);
    }

    if (secondIndex !== firstIndex) {
      const secondPoint = points[secondIndex];
      if (secondPoint) {
        simplified.push(secondPoint);
      }
    }
  }

  const start = points[0];
  const finish = points[points.length - 1];

  if (start && simplified[0] !== start) {
    simplified.unshift(start);
  }

  if (finish && simplified[simplified.length - 1] !== finish) {
    simplified.push(finish);
  }

  return simplified;
};

export const simplifyTrack = (segments: Position[][], pointCount: number): Position[][] => {
  if (pointCount <= MAX_SIMPLIFIED_POINTS) {
    return segments.map((segment) => segment.map(roundPoint));
  }

  return segments.map((segment) => {
    const budget = Math.max(2, Math.round((MAX_SIMPLIFIED_POINTS * segment.length) / pointCount));

    return simplifySegment(segment, budget).map(roundPoint);
  });
};
