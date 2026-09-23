import { describe, expect, it } from 'vitest';
import { MAX_FAVORITE_LOCATIONS } from '@loopra/domain';
import { useApp } from '../../helpers/app.js';
import { registerUser, useAuthenticatedUser } from '../../helpers/auth.js';

const KREUZBERG = {
  location: { x: 13.40252, y: 52.49883 },
  city: 'Berlin',
  district: 'Kreuzberg',
  municipality: null,
  region: 'Berlin',
  country: 'Germany',
  postal_code: '10997',
};

const place = (district: string) => ({ ...KREUZBERG, district });

describe('/users/me/favorite-locations', () => {
  const appRef = useApp();
  const auth = useAuthenticatedUser(appRef);

  const list = (accessToken: string | null = auth.accessToken) =>
    appRef.app.inject({
      method: 'GET',
      url: '/users/me/favorite-locations',
      cookies: accessToken ? { accessToken } : {},
    });

  const create = (payload: unknown, accessToken: string | null = auth.accessToken) =>
    appRef.app.inject({
      method: 'POST',
      url: '/users/me/favorite-locations',
      cookies: accessToken ? { accessToken } : {},
      payload: payload as object,
    });

  it('returns 401 when not authenticated', async () => {
    expect((await list(null)).statusCode).toBe(401);
    expect((await create(KREUZBERG, null)).statusCode).toBe(401);
  });

  it('returns an empty list for a rider who has saved none', async () => {
    const response = await list();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ favorite_locations: [] });
  });

  it('returns the saved favourite from the list', async () => {
    const created = await create(KREUZBERG);

    expect(created.statusCode).toBe(200);
    expect(created.json().favorite_location).toMatchObject(KREUZBERG);

    const response = await list();

    expect(response.json().favorite_locations).toEqual([created.json().favorite_location]);
  });

  it('serializes a favourite as the wire DTO', async () => {
    const { favorite_location } = (await create(KREUZBERG)).json();

    expect(Object.keys(favorite_location).sort()).toEqual(
      [
        'city',
        'country',
        'created_at',
        'district',
        'id',
        'location',
        'municipality',
        'postal_code',
        'region',
      ].sort(),
    );
    expect(favorite_location.created_at).toBe(new Date(favorite_location.created_at).toISOString());
  });

  it('fills in the place names the body does not carry', async () => {
    const response = await create({
      location: { x: 10.13843, y: 46.53829 },
      city: 'Livigno',
      country: 'Italy',
    });

    expect(response.json().favorite_location).toMatchObject({
      district: null,
      municipality: null,
      region: null,
      postal_code: null,
    });
  });

  it('lists several favourites oldest first', async () => {
    for (const district of ['Kreuzberg', 'Mitte', 'Neukölln']) {
      await create(place(district));
    }

    const response = await list();

    expect(response.json().favorite_locations.map((f: { district: string }) => f.district)).toEqual(
      ['Kreuzberg', 'Mitte', 'Neukölln'],
    );
  });

  it(`returns 409 past ${MAX_FAVORITE_LOCATIONS} favourites, saving nothing`, async () => {
    for (let i = 0; i < MAX_FAVORITE_LOCATIONS; i++) {
      expect((await create(place(`District ${i}`))).statusCode).toBe(200);
    }

    const response = await create(place('One too many'));

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({ type: 'MAX_FAVORITE_LOCATIONS' });
    expect((await list()).json().favorite_locations).toHaveLength(MAX_FAVORITE_LOCATIONS);
  });

  it('returns 409 when the label is already saved, saving nothing', async () => {
    await create(KREUZBERG);

    const response = await create({ ...KREUZBERG, postal_code: '10999' });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({ type: 'DUPLICATE_FAVORITE_LOCATION' });
    expect((await list()).json().favorite_locations).toHaveLength(1);
  });

  it('reports a duplicate at the cap as a duplicate, not as a full list', async () => {
    await create(place('Kreuzberg'));
    for (let i = 1; i < MAX_FAVORITE_LOCATIONS; i++) {
      await create(place(`District ${i}`));
    }

    const response = await create(place('Kreuzberg'));

    expect(response.json()).toMatchObject({ type: 'DUPLICATE_FAVORITE_LOCATION' });
  });

  it('keeps one rider’s favourites out of another’s list', async () => {
    await create(KREUZBERG);
    const other = await registerUser(appRef.app, 'other@example.com');

    expect((await list(other.accessToken)).json()).toEqual({ favorite_locations: [] });
  });

  it.each([
    ['a missing location', { ...KREUZBERG, location: undefined }],
    ['an out-of-range longitude', { ...KREUZBERG, location: { x: 181, y: 52 } }],
    ['an out-of-range latitude', { ...KREUZBERG, location: { x: 13, y: -91 } }],
    ['a missing city', { ...KREUZBERG, city: undefined }],
    ['an empty country', { ...KREUZBERG, country: '' }],
  ])('rejects a body with %s', async (_case, payload) => {
    const response = await create(payload);

    expect(response.statusCode).toBe(400);
  });

  it('leaves the Selected Location untouched', async () => {
    await create(KREUZBERG);

    const me = await appRef.app.inject({
      method: 'GET',
      url: '/users/me',
      cookies: { accessToken: auth.accessToken },
    });

    expect(me.json().user.selected_location).toBeNull();
  });
});
