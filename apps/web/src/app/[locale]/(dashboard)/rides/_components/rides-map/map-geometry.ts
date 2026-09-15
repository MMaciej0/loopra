const PANEL_CLEARANCE_PX = 24;

type Point = Readonly<{ x: number; y: number }>;
type Rect = Readonly<{ left: number; top: number; right: number; bottom: number; width: number }>;
type LngLat = Readonly<{ lng: number; lat: number }>;
type Bounds = [[number, number], [number, number]];

export function revealOffset(point: Point, panel: Rect, container: Rect): [number, number] | null {
  const isCovered =
    point.x > panel.left - container.left - PANEL_CLEARANCE_PX &&
    point.x < panel.right - container.left + PANEL_CLEARANCE_PX &&
    point.y > panel.top - container.top - PANEL_CLEARANCE_PX &&
    point.y < panel.bottom - container.top + PANEL_CLEARANCE_PX;

  if (!isCovered) return null;

  const isBottomSheet = panel.width >= container.width - 1;
  return isBottomSheet
    ? [0, -(container.bottom - panel.top) / 2]
    : [(panel.right - container.left) / 2, 0];
}

export function boundsOf(points: readonly LngLat[]): Bounds {
  const lngs = points.map(({ lng }) => lng);
  const lats = points.map(({ lat }) => lat);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}

export function anyInView([[west, south], [east, north]]: Bounds, points: readonly LngLat[]) {
  return points.some(({ lng, lat }) => lng >= west && lng <= east && lat >= south && lat <= north);
}
