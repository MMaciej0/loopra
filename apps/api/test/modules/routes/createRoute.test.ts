import { it, describe, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { sql } from 'drizzle-orm';
import { useApp } from '../../helpers/app.js';
import { useAuthenticatedUser } from '../../helpers/auth.js';
import { uploadToS3 } from '../../../src/utils/s3.js';
import { buildFileUpload } from '../../helpers/multipart.js';

vi.mock('../../../src/utils/s3.js');

const namedFixture = readFileSync(new URL('../../fixtures/route.gpx', import.meta.url));
const unnamedFixture = readFileSync(new URL('../../fixtures/route-unnamed.gpx', import.meta.url));
const multisegmentFixture = readFileSync(
  new URL('../../fixtures/route-multisegment.gpx', import.meta.url),
);

describe('POST /routes', () => {
  const appRef = useApp();
  const auth = useAuthenticatedUser(appRef);

  beforeEach(() => vi.clearAllMocks());

  const upload = async (body: Buffer, filename = 'warsaw-loop.gpx', token = auth.accessToken) => {
    const encoded = await buildFileUpload(body, filename);

    return appRef.app.inject({
      method: 'POST',
      url: '/routes',
      ...encoded,
      cookies: { accessToken: token },
    });
  };

  it('returns 403 when user email is not verified', async () => {
    const unverifiedToken = appRef.app.jwt.sign({ sub: auth.userId, email_verified: false });

    const response = await upload(namedFixture, 'warsaw-loop.gpx', unverifiedToken);

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({ type: 'EMAIL_NOT_VERIFIED' });
  });

  it('returns 400 when the request is not multipart', async () => {
    const response = await appRef.app.inject({
      method: 'POST',
      url: '/routes',
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ type: 'FILE_REQUIRED' });
  });

  it('returns 400 when the file is not a gpx', async () => {
    const response = await upload(Buffer.from('not a gpx'), 'notes.txt');

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ type: 'INVALID_GPX' });
    expect(uploadToS3).not.toHaveBeenCalled();
  });

  it('returns 400 when the file is empty', async () => {
    const response = await upload(Buffer.alloc(0));

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ type: 'INVALID_GPX' });
    expect(uploadToS3).not.toHaveBeenCalled();
  });

  it('returns 413 when the file is too large', async () => {
    const response = await upload(Buffer.alloc(11 * 1024 * 1024));

    expect(response.statusCode).toBe(413);
    expect(response.json()).toMatchObject({ type: 'FILE_TOO_LARGE' });
    expect(uploadToS3).not.toHaveBeenCalled();
  });

  it('returns 201 with the parsed metadata', async () => {
    const response = await upload(namedFixture);

    expect(response.statusCode).toBe(201);
    expect(response.json().data).toMatchObject({
      name: 'Test Loop',
      distance_km: '0.33',
      ascent_m: '12.00',
      descent_m: '2.00',
      point_count: 4,
      user_id: auth.userId,
    });
  });

  it('stores the elevation profile as a queryable jsonb array', async () => {
    const response = await upload(namedFixture);

    expect(response.json().data.elevation_profile).toEqual([
      [
        [0, 100],
        [0.11, 105],
        [0.22, 103],
        [0.33, 110],
      ],
    ]);

    const stored = await appRef.app.db.execute(
      sql`select jsonb_typeof(elevation_profile) as kind,
                 jsonb_array_length(elevation_profile) as segments,
                 jsonb_array_length(elevation_profile->0) as points
          from routes where id = ${response.json().data.id}`,
    );

    expect(stored.rows[0]).toEqual({ kind: 'array', segments: 1, points: 4 });
  });

  it('ends the profile at the stated distance', async () => {
    const response = await upload(namedFixture);

    const profile = response.json().data.elevation_profile.at(-1);

    expect(profile.at(0)[0]).toBe(0);
    expect(profile.at(-1)[0]).toBe(Number(response.json().data.distance_km));
  });

  it('keeps segments nested for a multi-segment track', async () => {
    const response = await upload(multisegmentFixture, 'two-segments.gpx');

    expect(response.json().data).toMatchObject({
      name: 'Two Segment Ride',
      distance_km: '0.56',
      ascent_m: '22.00',
      descent_m: '7.00',
      point_count: 7,
    });

    const stored = await appRef.app.db.execute(
      sql`select jsonb_array_length(elevation_profile) as segments,
                 jsonb_array_length(elevation_profile->0) as first_segment,
                 jsonb_array_length(elevation_profile->1) as second_segment
          from routes where id = ${response.json().data.id}`,
    );

    expect(stored.rows[0]).toEqual({ segments: 2, first_segment: 4, second_segment: 3 });
  });

  it('uploads the file under a namespaced key before inserting', async () => {
    const response = await upload(namedFixture);

    const [, , key, contentType] = vi.mocked(uploadToS3).mock.calls[0];

    expect(uploadToS3).toHaveBeenCalledTimes(1);
    expect(key).toMatch(new RegExp(`^routes/${auth.userId}/[0-9a-f-]{36}\\.gpx$`));
    expect(contentType).toBe('application/gpx+xml');

    const stored = await appRef.app.db.execute(
      sql`select s3_key from routes where id = ${response.json().data.id}`,
    );

    expect(stored.rows[0]).toEqual({ s3_key: key });
    expect(response.json().data).not.toHaveProperty('s3_key');
  });

  it('falls back to the uploaded filename when the gpx has no name', async () => {
    const response = await upload(unnamedFixture, 'my-favourite-loop.gpx');

    expect(response.json().data.name).toBe('my-favourite-loop.gpx');
  });

  it('trims and caps an overlong filename', async () => {
    const response = await upload(unnamedFixture, `${'a'.repeat(300)}.gpx`);

    expect(response.json().data.name).toHaveLength(255);
  });
});
