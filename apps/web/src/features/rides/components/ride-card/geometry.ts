import {
  projectElevationProfile,
  type ElevationFrame,
  type ElevationPath,
  type ElevationPoint,
} from '@/features/rides/project-elevation-profile';

export const CHART_WIDTH = 360;
export const CHART_HEIGHT = 96;

const BANNER_FRAME: ElevationFrame = {
  width: CHART_WIDTH,
  height: CHART_HEIGHT,
  bandTop: 6,
  bandBottom: CHART_HEIGHT - 24,
};

export function buildElevationPaths(
  profile: ElevationPoint[][],
  distanceKm: number,
): ElevationPath[] {
  return projectElevationProfile(profile, distanceKm, BANNER_FRAME);
}
