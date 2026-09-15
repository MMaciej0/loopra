import * as maptilersdk from '@maptiler/sdk';

const EARTH_RADIUS_KM = 6371.0088;
const CIRCLE_STEPS = 96;
const TILE_SIZE = 512;

type LngLat = readonly [number, number];
type Bounds = [[number, number], [number, number]];

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const toDegrees = (radians: number) => (radians * 180) / Math.PI;

export function nearbyCircle(
  [lng, lat]: LngLat,
  radiusKm: number,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const angular = radiusKm / EARTH_RADIUS_KM;
  const lat1 = toRadians(lat);
  const lng1 = toRadians(lng);

  const ring = Array.from({ length: CIRCLE_STEPS + 1 }, (_, step) => {
    const bearing = (2 * Math.PI * step) / CIRCLE_STEPS;
    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(angular) + Math.cos(lat1) * Math.sin(angular) * Math.cos(bearing),
    );
    const lng2 =
      lng1 +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angular) * Math.cos(lat1),
        Math.cos(angular) - Math.sin(lat1) * Math.sin(lat2),
      );
    return [toDegrees(lng2), toDegrees(lat2)];
  });

  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [ring] },
  };
}

function nearbyBounds([lng, lat]: LngLat, radiusKm: number): Bounds {
  const latDelta = toDegrees(radiusKm / EARTH_RADIUS_KM);
  const lngDelta = latDelta / Math.cos(toRadians(lat));
  return [
    [lng - lngDelta, lat - latDelta],
    [lng + lngDelta, lat + latDelta],
  ];
}

export function nearbyConstraints(
  center: LngLat,
  radiusKm: number,
  viewport: Readonly<{ width: number; height: number }>,
) {
  const [[west, south], [east, north]] = nearbyBounds(center, radiusKm);
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
