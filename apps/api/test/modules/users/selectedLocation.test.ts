import { describe, expect, it } from 'vitest';
import { useApp } from '../../helpers/app.js';
import { useAuthenticatedUser } from '../../helpers/auth.js';

const BERLIN = {
  location: { x: 13.40252, y: 52.49883 },
  city: 'Berlin',
  district: 'Kreuzberg',
  municipality: null,
  region: 'Berlin',
  country: 'Germany',
  postal_code: '10997',
};

describe('PUT /users/me/selected-location', () => {
  const appRef = useApp();
  const auth = useAuthenticatedUser(appRef);

  const put = (payload: unknown, accessToken: string | null = auth.accessToken) =>
    appRef.app.inject({
      method: 'PUT',
      url: '/users/me/selected-location',
      cookies: accessToken ? { accessToken } : {},
      payload: payload as object,
    });

  it('returns 401 when not authenticated', async () => {
    const response = await put(BERLIN, null);

    expect(response.statusCode).toBe(401);
  });

  it('stores the first Selected Location', async () => {
    const response = await put(BERLIN);

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ selected_location: BERLIN });

    const me = await appRef.app.inject({
      method: 'GET',
      url: '/users/me',
      cookies: { accessToken: auth.accessToken },
    });
    expect(me.json().user.selected_location).toEqual(BERLIN);
  });

  it('replaces an existing Selected Location, clearing the place names the new place does not carry', async () => {
    await put(BERLIN);

    const response = await put({
      location: { x: 10.13843, y: 46.53829 },
      city: 'Livigno',
      country: 'Italy',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().selected_location).toEqual({
      location: { x: 10.13843, y: 46.53829 },
      city: 'Livigno',
      district: null,
      municipality: null,
      region: null,
      country: 'Italy',
      postal_code: null,
    });
  });

  it.each([
    ['a missing location', { ...BERLIN, location: undefined }],
    ['an out-of-range longitude', { ...BERLIN, location: { x: 181, y: 52 } }],
    ['an out-of-range latitude', { ...BERLIN, location: { x: 13, y: -91 } }],
    ['a missing city', { ...BERLIN, city: undefined }],
    ['an empty country', { ...BERLIN, country: '' }],
  ])('rejects a body with %s', async (_case, payload) => {
    const response = await put(payload);

    expect(response.statusCode).toBe(400);
  });

  it('returns 404 when the account no longer exists', async () => {
    const ghostToken = appRef.app.jwt.sign({
      sub: '00000000-0000-0000-0000-000000000000',
      email_verified: true,
    });

    const response = await put(BERLIN, ghostToken);

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ type: 'USER_NOT_FOUND' });
  });
});
