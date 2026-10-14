import { describe, expect, it } from 'vitest';
import { formatLocationLabel, MAX_FAVORITE_LOCATIONS } from '@loopra/domain';
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

const place = (district: string, offset = 0) => ({
  ...KREUZBERG,
  district,
  location: { x: KREUZBERG.location.x + offset * 0.001, y: KREUZBERG.location.y },
});

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

  const remove = (id: string, accessToken: string | null = auth.accessToken) =>
    appRef.app.inject({
      method: 'DELETE',
      url: `/users/me/favorite-locations/${id}`,
      cookies: accessToken ? { accessToken } : {},
    });

  const districts = async () =>
    (await list()).json().favorite_locations.map((f: { district: string }) => f.district);

  it('returns 401 when not authenticated', async () => {
    expect((await list(null)).statusCode).toBe(401);
    expect((await create(KREUZBERG, null)).statusCode).toBe(401);
    expect((await remove(crypto.randomUUID(), null)).statusCode).toBe(401);
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
    expect(favorite_location.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
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
    for (const [step, district] of ['Kreuzberg', 'Mitte', 'Neukölln'].entries()) {
      await create(place(district, step));
    }

    const response = await list();

    expect(response.json().favorite_locations.map((f: { district: string }) => f.district)).toEqual(
      ['Kreuzberg', 'Mitte', 'Neukölln'],
    );
  });

  it(`returns 409 past ${MAX_FAVORITE_LOCATIONS} favourites, saving nothing`, async () => {
    for (let i = 0; i < MAX_FAVORITE_LOCATIONS; i++) {
      expect((await create(place(`District ${i}`, i))).statusCode).toBe(200);
    }

    const response = await create(place('One too many', MAX_FAVORITE_LOCATIONS));

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({ type: 'MAX_FAVORITE_LOCATIONS' });
    expect((await list()).json().favorite_locations).toHaveLength(MAX_FAVORITE_LOCATIONS);
  });

  it('returns 409 when the same coordinates are already saved, saving nothing', async () => {
    await create(KREUZBERG);

    const response = await create({ ...KREUZBERG, postal_code: '10999' });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({ type: 'DUPLICATE_FAVORITE_LOCATION' });
    expect((await list()).json().favorite_locations).toHaveLength(1);
  });

  it('saves two places that share a label at different coordinates', async () => {
    const kwiatowa = {
      ...KREUZBERG,
      city: 'Warsaw',
      district: 'Kwiatowa',
      region: 'Masovian Voivodeship',
      country: 'Poland',
    };
    const mokotow = { ...kwiatowa, location: { x: 21.01197313517332, y: 52.203626158095084 } };
    const praga = { ...kwiatowa, location: { x: 21.069464273750782, y: 52.24034480342886 } };

    expect(formatLocationLabel(praga)).toBe(formatLocationLabel(mokotow));
    expect((await create(mokotow)).statusCode).toBe(200);
    expect((await create(praga)).statusCode).toBe(200);
    expect((await list()).json().favorite_locations).toHaveLength(2);
  });

  it('reports a duplicate at the cap as a duplicate, not as a full list', async () => {
    await create(place('Kreuzberg'));
    for (let i = 1; i < MAX_FAVORITE_LOCATIONS; i++) {
      await create(place(`District ${i}`, i));
    }

    const response = await create(place('Kreuzberg'));

    expect(response.json()).toMatchObject({ type: 'DUPLICATE_FAVORITE_LOCATION' });
  });

  it('saves one row when the same place arrives twice at once', async () => {
    const responses = await Promise.all([create(KREUZBERG), create(KREUZBERG)]);

    expect(responses.map((response) => response.statusCode).sort((a, b) => a - b)).toEqual([
      200, 409,
    ]);
    expect((await list()).json().favorite_locations).toHaveLength(1);
  });

  it(`holds the cap at ${MAX_FAVORITE_LOCATIONS} when saves arrive at once`, async () => {
    const places = Array.from({ length: MAX_FAVORITE_LOCATIONS + 2 }, (_, i) =>
      place(`District ${i}`, i),
    );

    await Promise.all(places.map((payload) => create(payload)));

    expect((await list()).json().favorite_locations).toHaveLength(MAX_FAVORITE_LOCATIONS);
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

  it('deletes a favourite, and a later list no longer carries it', async () => {
    for (const [step, district] of ['Kreuzberg', 'Mitte', 'Neukölln'].entries()) {
      await create(place(district, step));
    }
    const [, mitte] = (await list()).json().favorite_locations;

    const response = await remove(mitte.id);

    expect(response.statusCode).toBe(200);
    expect(response.json().favorite_location).toMatchObject({ id: mitte.id, district: 'Mitte' });
    expect(await districts()).toEqual(['Kreuzberg', 'Neukölln']);
  });

  it('answers a delete with the removed favourite as the wire DTO', async () => {
    const created = (await create(KREUZBERG)).json().favorite_location;

    const response = await remove(created.id);

    expect(response.json()).toEqual({ favorite_location: created });
    expect(created.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('deletes the last remaining favourite', async () => {
    const { favorite_location } = (await create(KREUZBERG)).json();

    expect((await remove(favorite_location.id)).statusCode).toBe(200);
    expect((await list()).json().favorite_locations).toEqual([]);
  });

  it('frees a spot at the cap so the next save is accepted', async () => {
    for (let i = 0; i < MAX_FAVORITE_LOCATIONS; i++) {
      await create(place(`District ${i}`, i));
    }
    const [oldest] = (await list()).json().favorite_locations;

    await remove(oldest.id);

    expect((await create(place('One more', MAX_FAVORITE_LOCATIONS))).statusCode).toBe(200);
  });

  it.each([
    ['an unknown id', crypto.randomUUID()],
    ['an id that is not a uuid', 'not-a-uuid'],
  ])('returns 404 for %s', async (_case, id) => {
    const response = await remove(id);

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ type: 'FAVORITE_LOCATION_NOT_FOUND' });
  });

  it('returns 404 for another rider’s favourite, leaving that row standing', async () => {
    const { favorite_location } = (await create(KREUZBERG)).json();
    const other = await registerUser(appRef.app, 'other@example.com');

    expect((await remove(favorite_location.id, other.accessToken)).statusCode).toBe(404);
    expect((await list()).json().favorite_locations).toHaveLength(1);
  });

  it('leaves the Selected Location untouched when deleting its favourite', async () => {
    const { favorite_location } = (await create(KREUZBERG)).json();
    await appRef.app.inject({
      method: 'PUT',
      url: '/users/me/selected-location',
      cookies: { accessToken: auth.accessToken },
      payload: KREUZBERG,
    });

    await remove(favorite_location.id);

    const me = await appRef.app.inject({
      method: 'GET',
      url: '/users/me',
      cookies: { accessToken: auth.accessToken },
    });

    expect(me.json().user.selected_location).toMatchObject({ district: 'Kreuzberg' });
  });
});
