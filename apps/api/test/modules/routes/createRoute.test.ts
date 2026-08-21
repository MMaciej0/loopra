import { it, describe, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { useApp } from '../../helpers/app.js';
import { useAuthenticatedUser } from '../../helpers/auth.js';
import { uploadToS3 } from '../../../src/utils/s3.js';
import { buildFileUpload } from '../../helpers/multipart.js';

vi.mock('../../../src/utils/s3.js');

const namedFixture = readFileSync(new URL('../../fixtures/route.gpx', import.meta.url));
const unnamedFixture = readFileSync(new URL('../../fixtures/route-unnamed.gpx', import.meta.url));

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

  it('uploads the file under a namespaced key before inserting', async () => {
    const response = await upload(namedFixture);

    const [, , key, contentType] = vi.mocked(uploadToS3).mock.calls[0];

    expect(uploadToS3).toHaveBeenCalledTimes(1);
    expect(key).toMatch(new RegExp(`^routes/${auth.userId}/[0-9a-f-]{36}\\.gpx$`));
    expect(contentType).toBe('application/gpx+xml');
    expect(response.json().data.s3_key).toBe(key);
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
