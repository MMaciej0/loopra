import { readdirSync, readFileSync } from 'fs';
import { parseGPX } from '@loopra/gpx';
import { MAX_GPX_FILE_SIZE_BYTES } from '@loopra/domain';
import { describe, expect, it } from 'vitest';

const ROUTES_DIR = new URL('../../src/db/staging-routes/', import.meta.url);

const files = readdirSync(ROUTES_DIR).filter((name) => name.endsWith('.gpx'));
const routes = files.map((file) => {
  const content = readFileSync(new URL(file, ROUTES_DIR), 'utf8');
  return { file, size: Buffer.byteLength(content), metadata: parseGPX(content) };
});

describe('staging seed routes', () => {
  it('has about 8 routes', () => {
    expect(files.length).toBeGreaterThanOrEqual(8);
  });

  it.each(routes)('$file has a name, distance, elevation and profile', ({ size, metadata }) => {
    expect(size).toBeLessThanOrEqual(MAX_GPX_FILE_SIZE_BYTES);
    expect(metadata.name).toBeTruthy();
    expect(metadata.distanceKm).toBeGreaterThan(0);
    expect(metadata.ascentM).toBeGreaterThan(0);
    expect(metadata.maxElevationM).not.toBeNull();
    expect(metadata.elevationProfile.flat().length).toBeGreaterThan(1);
    expect(metadata.path.flat().length).toBeGreaterThan(1);
  });

  it('covers short and long, flat and hilly routes', () => {
    const distances = routes.map(({ metadata }) => metadata.distanceKm);
    const climbPerKm = routes.map(({ metadata }) => metadata.ascentM / metadata.distanceKm);

    expect(Math.min(...distances)).toBeLessThan(30);
    expect(Math.max(...distances)).toBeGreaterThan(60);
    expect(Math.min(...climbPerKm)).toBeLessThan(3);
    expect(Math.max(...climbPerKm)).toBeGreaterThan(8);
  });
});
