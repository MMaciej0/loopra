import { describe, expect, it } from 'vitest';
import { useApp } from '../../helpers/app.js';
import { newRide } from '../../helpers/rides.js';
import { ride_participants, rides } from '../../../src/db/schema.js';
import { registerUser, useAuthenticatedUser } from '../../helpers/auth.js';

describe('GET /rides/mine', () => {
  const appRef = useApp();
  const auth = useAuthenticatedUser(appRef);

  const HOUR = 60 * 60 * 1000;
  const hoursFromNow = (hours: number) => new Date(Date.now() + hours * HOUR);

  const registerOther = (name = 'other') =>
    registerUser(appRef.app, `${name}@example.com`, 'Password123!', `${name}user`);

  const insertRide = async (
    organiserId: string,
    overrides: Record<string, unknown> = {},
    participantIds: string[] = [],
  ) => {
    const [{ id }] = await appRef.app.db
      .insert(rides)
      .values({ ...newRide({ user_id: organiserId }), ...overrides })
      .returning({ id: rides.id });

    await appRef.app.db
      .insert(ride_participants)
      .values([organiserId, ...participantIds].map((user_id) => ({ ride_id: id, user_id })));

    return id;
  };

  const listMineRaw = (query: Record<string, string> = {}, accessToken = auth.accessToken) =>
    appRef.app.inject({
      method: 'GET',
      url: '/rides/mine',
      query,
      cookies: { accessToken },
    });

  const listMine = async (query: Record<string, string> = {}, accessToken = auth.accessToken) => {
    const response = await listMineRaw(query, accessToken);

    expect(response.statusCode).toBe(200);

    return response.json();
  };

  const mineIds = async (query: Record<string, string> = {}, accessToken = auth.accessToken) => {
    const { data } = await listMine(query, accessToken);

    return data.map((ride: { id: string }) => ride.id);
  };

  it('answers 401 without login', async () => {
    const response = await appRef.app.inject({ method: 'GET', url: '/rides/mine' });

    expect(response.statusCode).toBe(401);
  });

  it('returns only rides where the caller is a participant', async () => {
    const other = await registerOther();
    const third = await registerOther('third');
    const organised = await insertRide(auth.userId, { start_time: hoursFromNow(6) });
    const joined = await insertRide(other.userId, { start_time: hoursFromNow(7) }, [auth.userId]);
    await insertRide(other.userId, { start_time: hoursFromNow(8) }, [third.userId]);

    expect(await mineIds()).toEqual([organised, joined]);
    expect(await mineIds({}, third.accessToken)).toHaveLength(1);
  });

  it('includes cancelled and private rides, and leaves out a draft', async () => {
    const other = await registerOther();
    const cancelled = await insertRide(
      other.userId,
      { status: 'cancelled', start_time: hoursFromNow(6) },
      [auth.userId],
    );
    const privateRide = await insertRide(auth.userId, {
      is_private: true,
      start_time: hoursFromNow(7),
    });
    await insertRide(auth.userId, { status: 'draft', start_time: hoursFromNow(8) });
    const pastCancelled = await insertRide(auth.userId, {
      status: 'cancelled',
      start_time: hoursFromNow(-6),
    });
    await insertRide(auth.userId, { status: 'draft', start_time: hoursFromNow(-7) });

    const { data } = await listMine();

    expect(data.map((ride: { id: string }) => ride.id)).toEqual([cancelled, privateRide]);
    expect(data[0].status).toBe('cancelled');
    expect(data[1].is_private).toBe(true);
    expect(await mineIds({ phase: 'past' })).toEqual([pastCancelled]);
  });

  it('returns items with exactly the key set of the Discover list, with the Discover values', async () => {
    const other = await registerOther();
    const rideId = await insertRide(auth.userId, {}, [other.userId]);

    const mine = await listMine();
    const discover = await appRef.app.inject({
      method: 'GET',
      url: '/rides',
      cookies: { accessToken: auth.accessToken },
    });

    expect(Object.keys(mine).sort()).toEqual(['data', 'nextCursor']);
    expect(mine.nextCursor).toBeNull();
    expect(mine.data).toHaveLength(1);
    expect(mine.data[0].id).toBe(rideId);
    expect(mine.data[0].participant_count).toBe(2);
    expect(mine.data[0].creator).toEqual({ id: auth.userId, username: 'testuser' });
    expect(mine.data[0]).toEqual(discover.json().data[0]);
  });

  it('is not answered by the ride-by-id route', async () => {
    const response = await listMineRaw();

    expect(response.statusCode).toBe(200);
    expect(response.json().data).toEqual([]);
  });

  describe('pagination', () => {
    const pageThrough = async (query: Record<string, string>) => {
      const listed: string[] = [];
      let cursor: string | null = null;

      do {
        const page = await listMine({ ...query, limit: '2', ...(cursor && { cursor }) });

        expect(page.data.length).toBeLessThanOrEqual(2);
        listed.push(...page.data.map((ride: { id: string }) => ride.id));
        cursor = page.nextCursor;
      } while (cursor && listed.length < 20);

      return listed;
    };

    it('covers every upcoming ride exactly once, in order', async () => {
      const sameTime = hoursFromNow(7);
      const first = await insertRide(auth.userId, { start_time: hoursFromNow(6) });
      const tied = [
        await insertRide(auth.userId, { start_time: sameTime }),
        await insertRide(auth.userId, { start_time: sameTime }),
        await insertRide(auth.userId, { start_time: sameTime }),
      ].sort();
      const last = await insertRide(auth.userId, { start_time: hoursFromNow(8) });
      await insertRide(auth.userId, { start_time: hoursFromNow(-1) });

      expect(await pageThrough({})).toEqual([first, ...tied, last]);
    });

    it('covers every past ride exactly once, in order', async () => {
      const sameTime = hoursFromNow(-7);
      const newest = await insertRide(auth.userId, { start_time: hoursFromNow(-6) });
      const tied = [
        await insertRide(auth.userId, { start_time: sameTime }),
        await insertRide(auth.userId, { start_time: sameTime }),
        await insertRide(auth.userId, { start_time: sameTime }),
      ]
        .sort()
        .reverse();
      const oldest = await insertRide(auth.userId, { start_time: hoursFromNow(-8) });
      await insertRide(auth.userId, { start_time: hoursFromNow(1) });

      expect(await pageThrough({ phase: 'past' })).toEqual([newest, ...tied, oldest]);
    });

    it('keeps the role filter across pages', async () => {
      const other = await registerOther();
      const joined = [
        await insertRide(other.userId, { start_time: hoursFromNow(6) }, [auth.userId]),
        await insertRide(other.userId, { start_time: hoursFromNow(8) }, [auth.userId]),
        await insertRide(other.userId, { start_time: hoursFromNow(10) }, [auth.userId]),
      ];
      await insertRide(auth.userId, { start_time: hoursFromNow(7) });
      await insertRide(auth.userId, { start_time: hoursFromNow(9) });

      expect(await pageThrough({ role: 'joined' })).toEqual(joined);
    });

    it('rejects a malformed cursor as a bad request', async () => {
      const rideId = await insertRide(auth.userId);
      const malformed = [
        'garbage',
        'not-a-uuid:1760000000000',
        `${rideId}:soon`,
        `${rideId}:`,
        `${rideId}:99999999999999999999`,
        `${rideId}:1760000000000:extra`,
      ];

      for (const cursor of malformed) {
        const response = await listMineRaw({ cursor });

        expect(response.statusCode, cursor).toBe(400);
        expect(response.json().field).toBe('cursor');
      }
    });
  });

  describe('phase', () => {
    it('upcoming is the default and lists rides that have not started, soonest first', async () => {
      const later = await insertRide(auth.userId, { start_time: hoursFromNow(9) });
      const sooner = await insertRide(auth.userId, { start_time: hoursFromNow(1) });
      await insertRide(auth.userId, { start_time: hoursFromNow(-1) });

      expect(await mineIds()).toEqual([sooner, later]);
      expect(await mineIds({ phase: 'upcoming' })).toEqual([sooner, later]);
    });

    it('past lists rides that have started, newest first, with no time limit', async () => {
      const other = await registerOther();
      const lastYear = await insertRide(other.userId, { start_time: hoursFromNow(-24 * 400) }, [
        auth.userId,
      ]);
      const yesterday = await insertRide(auth.userId, { start_time: hoursFromNow(-24) });
      await insertRide(auth.userId, { start_time: hoursFromNow(1) });

      expect(await mineIds({ phase: 'past' })).toEqual([yesterday, lastYear]);
    });

    it('rejects an invalid value as a bad request', async () => {
      const response = await listMineRaw({ phase: 'history' });

      expect(response.statusCode).toBe(400);
      expect(response.json().field).toBe('phase');
    });
  });

  describe('role', () => {
    it('organising returns rides the caller organises, joined returns the others, and no role returns both', async () => {
      const other = await registerOther();
      const organised = await insertRide(auth.userId, { start_time: hoursFromNow(6) }, [
        other.userId,
      ]);
      const joined = await insertRide(other.userId, { start_time: hoursFromNow(7) }, [auth.userId]);

      expect(await mineIds({ role: 'organising' })).toEqual([organised]);
      expect(await mineIds({ role: 'joined' })).toEqual([joined]);
      expect(await mineIds()).toEqual([organised, joined]);
      expect(await mineIds({ role: 'organising' }, other.accessToken)).toEqual([joined]);
      expect(await mineIds({ role: 'joined' }, other.accessToken)).toEqual([organised]);
    });

    it('rejects an invalid value as a bad request', async () => {
      const response = await listMineRaw({ role: 'all' });

      expect(response.statusCode).toBe(400);
      expect(response.json().field).toBe('role');
    });
  });
});
