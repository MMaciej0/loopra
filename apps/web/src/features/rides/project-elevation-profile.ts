export type ElevationPoint = [number, number];

export interface ElevationPath {
  stroke: string;
  fill: string;
}

export interface ElevationFrame {
  width: number;
  height: number;
  bandTop: number;
  bandBottom: number;
}

interface ElevationRange {
  min: number;
  max: number;
}

const FLAT_RATIO = 0.5;

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function isFinitePoint(point: ElevationPoint) {
  return Number.isFinite(point[0]) && Number.isFinite(point[1]);
}

function getElevationRange(profile: ElevationPoint[][]): ElevationRange | null {
  let min = Infinity;
  let max = -Infinity;

  for (const segment of profile) {
    for (const point of segment) {
      if (!isFinitePoint(point)) continue;

      const elevation = point[1];
      if (elevation < min) min = elevation;
      if (elevation > max) max = elevation;
    }
  }

  return min === Infinity ? null : { min, max };
}

export function projectElevationProfile(
  profile: ElevationPoint[][],
  distanceKm: number,
  frame: ElevationFrame,
): ElevationPath[] {
  const range = getElevationRange(profile);

  if (!range || !Number.isFinite(distanceKm) || distanceKm <= 0) return [];

  const span = range.max - range.min;
  const paths: ElevationPath[] = [];

  for (const segment of profile) {
    const projected = segment.filter(isFinitePoint).map(([distance, elevation]) => {
      const progress = Math.min(Math.max(distance / distanceKm, 0), 1);
      const height = span === 0 ? FLAT_RATIO : (elevation - range.min) / span;

      return [
        round(progress * frame.width),
        round(frame.bandBottom - height * (frame.bandBottom - frame.bandTop)),
      ];
    });

    if (projected.length < 2) continue;

    const stroke = `M ${projected.map(([x, y]) => `${x} ${y}`).join(' L ')}`;
    const firstX = projected[0][0];
    const lastX = projected[projected.length - 1][0];

    paths.push({
      stroke,
      fill: `${stroke} L ${lastX} ${frame.height} L ${firstX} ${frame.height} Z`,
    });
  }

  return paths;
}
