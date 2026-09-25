import type { Point } from '../location.js';

export const SEARCH_AREA_MAX_KM = 100;

const KM_PER_DEGREE = (6371.0088 * Math.PI) / 180;
const SIZE_TOLERANCE_KM = 0.001;

export type BBox = Readonly<{ west: number; south: number; east: number; north: number }>;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export const bboxAround = ({ x, y }: Point, sizeKm: number): BBox => {
  const latDelta = sizeKm / 2 / KM_PER_DEGREE;
  const lngDelta = latDelta / Math.cos(toRadians(y));

  return { west: x - lngDelta, south: y - latDelta, east: x + lngDelta, north: y + latDelta };
};

export const bboxSizeKm = ({ west, south, east, north }: BBox): number => {
  const width = (east - west) * KM_PER_DEGREE * Math.cos(toRadians((south + north) / 2));
  const height = (north - south) * KM_PER_DEGREE;

  return Math.max(width, height);
};

export const fitsSearchArea = (bbox: BBox): boolean =>
  bboxSizeKm(bbox) <= SEARCH_AREA_MAX_KM + SIZE_TOLERANCE_KM;

export const formatBBox = ({ west, south, east, north }: BBox): string =>
  [west, south, east, north].join(',');
