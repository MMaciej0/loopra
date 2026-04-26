import { beforeEach, describe, expect, it } from 'vitest';
import { useApp } from '../../helpers/app.js';
import { createMultipleRandomEvents, newEvent } from '../../helpers/events.js';
import { events } from '../../../src/db/schema.js';
import { useAuthenticatedUser } from '../../helpers/auth.js';

describe('GET /events', () => {
  const appRef = useApp();
  const auth = useAuthenticatedUser(appRef);
  const LIMIT = 20;

  it('returns first 20 records (limit) when cursor is not defined', async () => {
    await createMultipleRandomEvents(appRef.app.db, LIMIT + 1, auth.userId);

    const response = await appRef.app.inject({
      method: 'GET',
      url: '/events',
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.length).toBe(LIMIT);
    expect(response.json().nextCursor).toBeDefined();
  });

  it('returns next 20 records (limit) when cursor is defined', async () => {
    await createMultipleRandomEvents(appRef.app.db, LIMIT * 2, auth.userId);

    const initialResponse = await appRef.app.inject({
      method: 'GET',
      url: '/events',
      cookies: { accessToken: auth.accessToken },
    });

    const { nextCursor, data } = initialResponse.json();

    expect(data.length).toBe(LIMIT);
    expect(nextCursor).toBeDefined();

    const nextResponse = await appRef.app.inject({
      method: 'GET',
      url: '/events',
      cookies: { accessToken: auth.accessToken },
      query: {
        cursor: nextCursor,
      },
    });

    expect(nextResponse.statusCode).toBe(200);
    expect(nextResponse.json().data.length).toBe(LIMIT);
    expect(nextResponse.json().nextCursor).toBe(null);
  });

  it('returns events near Warsaw when Warsaw lat/long is provided', async () => {
    const warsawEvent1 = newEvent({
      user_id: auth.userId,
      start_location: { x: 21.01178, y: 52.22977 },
    });
    const warsawEvent2 = newEvent({
      user_id: auth.userId,
      start_location: { x: 21.01178, y: 52.22977 },
    });
    const tokyoEvent = newEvent({
      user_id: auth.userId,
      start_location: { x: 139.69171, y: 35.6895 },
    });

    await appRef.app.db.insert(events).values([warsawEvent1, warsawEvent2, tokyoEvent]).returning();

    const response = await appRef.app.inject({
      method: 'GET',
      url: '/events',
      cookies: { accessToken: auth.accessToken },
      query: {
        lat: '52.22977',
        lng: '21.01178',
        radius_km: '1',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.length).toBe(2);
  });
});
