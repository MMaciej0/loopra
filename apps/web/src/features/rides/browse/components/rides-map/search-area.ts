import {
  bboxAround,
  fitsSearchArea,
  SEARCH_AREA_MAX_KM,
  type BBox,
  type Point,
} from '@loopra/domain';
import * as maptilersdk from '@maptiler/sdk';

const TILE_SIZE = 512;

function centerOf(map: maptilersdk.Map): Point {
  const { lng, lat } = map.getCenter();
  return { x: lng, y: lat };
}

export function searchAreaMinZoom(map: maptilersdk.Map): number | null {
  const { clientWidth: width, clientHeight: height } = map.getContainer();
  if (width === 0 || height === 0) return null;

  const { west, south, east, north } = bboxAround(centerOf(map), SEARCH_AREA_MAX_KM);
  const northWest = maptilersdk.MercatorCoordinate.fromLngLat([west, north]);
  const southEast = maptilersdk.MercatorCoordinate.fromLngLat([east, south]);

  const pixelsPerUnit = Math.max(
    width / (southEast.x - northWest.x),
    height / (southEast.y - northWest.y),
  );

  return Math.log2(pixelsPerUnit / TILE_SIZE);
}

export function viewSearchArea(map: maptilersdk.Map): BBox {
  const bounds = map.getBounds();
  const view = {
    west: bounds.getWest(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    north: bounds.getNorth(),
  };

  return fitsSearchArea(view) ? view : bboxAround(centerOf(map), SEARCH_AREA_MAX_KM);
}
