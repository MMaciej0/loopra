export type ElevationPoint = [number, number];

export interface ElevationRange {
  min: number;
  max: number;
}

export interface ElevationPath {
  stroke: string;
  fill: string;
}

export const CHART_WIDTH = 360;
export const CHART_HEIGHT = 96;

const BAND_TOP = 6;
const BAND_BOTTOM = CHART_HEIGHT - 24;
const FLAT_RATIO = 0.5;

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function isFinitePoint(point: ElevationPoint) {
  return Number.isFinite(point[0]) && Number.isFinite(point[1]);
}

export function getElevationRange(profile: ElevationPoint[][]): ElevationRange | null {
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

export function buildElevationPaths(
  profile: ElevationPoint[][],
  distanceKm: number,
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
        round(progress * CHART_WIDTH),
        round(BAND_BOTTOM - height * (BAND_BOTTOM - BAND_TOP)),
      ];
    });

    if (projected.length < 2) continue;

    const stroke = `M ${projected.map(([x, y]) => `${x} ${y}`).join(' L ')}`;
    const firstX = projected[0][0];
    const lastX = projected[projected.length - 1][0];

    paths.push({
      stroke,
      fill: `${stroke} L ${lastX} ${CHART_HEIGHT} L ${firstX} ${CHART_HEIGHT} Z`,
    });
  }

  return paths;
}
