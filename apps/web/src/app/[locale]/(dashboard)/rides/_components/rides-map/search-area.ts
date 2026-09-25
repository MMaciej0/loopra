import type { BBox } from '@loopra/domain';
import * as maptilersdk from '@maptiler/sdk';

const TILE_SIZE = 512;

type Bounds = [[number, number], [number, number]];

export function searchAreaPolygon({
  west,
  south,
  east,
  north,
}: BBox): GeoJSON.Feature<GeoJSON.Polygon> {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [west, south],
          [east, south],
          [east, north],
          [west, north],
          [west, south],
        ],
      ],
    },
  };
}

export function searchAreaConstraints(
  { west, south, east, north }: BBox,
  viewport: Readonly<{ width: number; height: number }>,
) {
  const northWest = maptilersdk.MercatorCoordinate.fromLngLat([west, north]);
  const southEast = maptilersdk.MercatorCoordinate.fromLngLat([east, south]);

  const pixelsPerUnit = Math.min(
    viewport.width / (southEast.x - northWest.x),
    viewport.height / (southEast.y - northWest.y),
  );
  const halfWidth = viewport.width / pixelsPerUnit / 2;
  const halfHeight = viewport.height / pixelsPerUnit / 2;
  const midX = (northWest.x + southEast.x) / 2;
  const midY = (northWest.y + southEast.y) / 2;

  const topLeft = new maptilersdk.MercatorCoordinate(
    midX - halfWidth,
    midY - halfHeight,
  ).toLngLat();
  const bottomRight = new maptilersdk.MercatorCoordinate(
    midX + halfWidth,
    midY + halfHeight,
  ).toLngLat();

  return {
    minZoom: Math.log2(pixelsPerUnit / TILE_SIZE),
    maxBounds: [
      [topLeft.lng, bottomRight.lat],
      [bottomRight.lng, topLeft.lat],
    ] satisfies Bounds,
  };
}
