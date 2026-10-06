import { readFileSync } from 'fs';
import { describe, expect, it } from 'vitest';
import { parseGPX } from '../src/index.js';

type TrackPoint = { lat: number; lon: number; ele?: number };

const readAsset = (name: string) =>
  readFileSync(new URL(`../assets/${name}`, import.meta.url), 'utf8');

const buildGpx = (segments: TrackPoint[][]) => {
  const trkpt = ({ lat, lon, ele }: TrackPoint) =>
    `<trkpt lat="${lat}" lon="${lon}">${ele === undefined ? '' : `<ele>${ele}</ele>`}</trkpt>`;

  const trksegs = segments
    .map((segment) => `<trkseg>${segment.map(trkpt).join('')}</trkseg>`)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="loopra-test" xmlns="http://www.topografix.com/GPX/1/1">
  <trk><name>Test</name>${trksegs}</trk>
</gpx>`;
};

const straightLine = (count: number): TrackPoint[] =>
  Array.from({ length: count }, (_, i) => ({ lat: 52.23, lon: 21 + i * 0.001, ele: 100 }));

const decimals = (value: number) => value.toString().split('.')[1]?.length ?? 0;

describe('parseGPX path', () => {
  it('collapses a straight line to its ends', () => {
    const { path } = parseGPX(buildGpx([straightLine(50)]));

    expect(path).toEqual([
      [
        [21, 52.23],
        [21.049, 52.23],
      ],
    ]);
  });

  it('keeps a sharp turn', () => {
    const east = Array.from({ length: 20 }, (_, i) => ({ lat: 52.23, lon: 21 + i * 0.001 }));
    const north = Array.from({ length: 20 }, (_, i) => ({ lat: 52.231 + i * 0.001, lon: 21.019 }));

    const { path } = parseGPX(buildGpx([[...east, ...north]]));

    expect(path).toEqual([
      [
        [21, 52.23],
        [21.019, 52.23],
        [21.019, 52.25],
      ],
    ]);
  });

  it('returns [lon, lat] pairs', () => {
    const { path } = parseGPX(
      buildGpx([
        [
          { lat: 52.1, lon: 21.2 },
          { lat: 52.3, lon: 21.4 },
        ],
      ]),
    );

    expect(path).toEqual([
      [
        [21.2, 52.1],
        [21.4, 52.3],
      ],
    ]);
  });

  it('gives a real route clearly fewer points than its input', () => {
    const { path, pointCount } = parseGPX(readAsset('route-real.gpx'));
    const pathPointCount = path.reduce((acc, segment) => acc + segment.length, 0);

    expect(pointCount).toBe(951);
    expect(pathPointCount).toBeGreaterThan(10);
    expect(pathPointCount).toBeLessThan(pointCount / 2);
  });

  it('keeps the first and last point of a real route', () => {
    const { path } = parseGPX(readAsset('route-real.gpx'));
    const segment = path[0]!;

    expect(segment[0]).toEqual([20.04989, 50.05126]);
    expect(segment[segment.length - 1]).toEqual([20.09606, 50.01397]);
  });

  it('rounds coordinates to at most 5 decimals', () => {
    const { path } = parseGPX(readAsset('route-real.gpx'));

    for (const point of path.flat()) {
      expect(point).toHaveLength(2);
      expect(decimals(point[0])).toBeLessThanOrEqual(5);
      expect(decimals(point[1])).toBeLessThanOrEqual(5);
    }
  });

  it('builds a path from a GPX with no elevation', () => {
    const points = [
      { lat: 52.23, lon: 21 },
      { lat: 52.24, lon: 21.01 },
      { lat: 52.23, lon: 21.02 },
    ];

    const { path, elevationProfile } = parseGPX(buildGpx([points]));

    expect(elevationProfile).toEqual([]);
    expect(path).toEqual([
      [
        [21, 52.23],
        [21.01, 52.24],
        [21.02, 52.23],
      ],
    ]);
  });

  it('gives one array per segment for a multisegment GPX', () => {
    const { path } = parseGPX(readAsset('route-multisegment.gpx'));

    expect(path).toEqual([
      [
        [21.01, 52.23],
        [21.01, 52.233],
      ],
      [
        [21.01, 52.25],
        [21.01, 52.252],
      ],
    ]);
  });
});

describe('parseGPX elevation profile', () => {
  it('is unchanged for a multisegment GPX', () => {
    const { name, distanceKm, ascentM, descentM, pointCount, elevationProfile } = parseGPX(
      readAsset('route-multisegment.gpx'),
    );

    expect({ name, distanceKm, ascentM, descentM, pointCount }).toEqual({
      name: 'Two Segment Ride',
      distanceKm: 0.56,
      ascentM: 22,
      descentM: 7,
      pointCount: 7,
    });
    expect(elevationProfile).toEqual([
      [
        [0, 100],
        [0.11, 105],
        [0.22, 103],
        [0.33, 110],
      ],
      [
        [0.33, 200],
        [0.44, 210],
        [0.56, 205],
      ],
    ]);
  });

  it('is unchanged for a real route', () => {
    const { distanceKm, ascentM, descentM, elevationProfile } = parseGPX(
      readAsset('route-real.gpx'),
    );

    expect({ distanceKm, ascentM, descentM }).toEqual({
      distanceKm: 44.52,
      ascentM: 642.04,
      descentM: 637.69,
    });
    expect(elevationProfile.map((profile) => profile.length)).toEqual([449]);
  });
});

describe('parseGPX elevation extremes', () => {
  it('returns the highest and lowest point in whole metres', () => {
    const { maxElevationM, minElevationM } = parseGPX(
      buildGpx([
        [
          { lat: 52.23, lon: 21, ele: 120.4 },
          { lat: 52.231, lon: 21, ele: 98.6 },
          { lat: 52.232, lon: 21, ele: 341.5 },
          { lat: 52.233, lon: 21, ele: 200 },
        ],
      ]),
    );

    expect({ maxElevationM, minElevationM }).toEqual({ maxElevationM: 342, minElevationM: 99 });
  });

  it('takes the extremes across all segments of a multisegment GPX', () => {
    const { maxElevationM, minElevationM } = parseGPX(readAsset('route-multisegment.gpx'));

    expect({ maxElevationM, minElevationM }).toEqual({ maxElevationM: 210, minElevationM: 100 });
  });

  it('reads the extremes of a real route from its raw points', () => {
    const { maxElevationM, minElevationM } = parseGPX(readAsset('route-real.gpx'));

    expect({ maxElevationM, minElevationM }).toEqual({ maxElevationM: 412, minElevationM: 194 });
  });

  it('returns null for both when the GPX has no elevation', () => {
    const { maxElevationM, minElevationM } = parseGPX(
      buildGpx([
        [
          { lat: 52.23, lon: 21 },
          { lat: 52.24, lon: 21.01 },
        ],
      ]),
    );

    expect({ maxElevationM, minElevationM }).toEqual({ maxElevationM: null, minElevationM: null });
  });
});
