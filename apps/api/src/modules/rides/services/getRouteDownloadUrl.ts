import { S3Client } from '@aws-sdk/client-s3';
import { and, eq } from 'drizzle-orm';
import { Db } from '../../../db/index.js';
import { ride_participants, rides, routes } from '../../../db/schema.js';
import { getDownloadUrl } from '../../../utils/s3.js';
import { ParticipantNotFoundError, RideNotFoundError, RouteNotFoundError } from '../errors.js';

export const getRouteDownloadUrl = async (db: Db, s3: S3Client, userId: string, rideId: string) => {
  const [row] = await db
    .select({
      route: { s3_key: routes.s3_key, name: routes.name },
      participant: { user_id: ride_participants.user_id },
    })
    .from(rides)
    .leftJoin(routes, eq(routes.id, rides.route_id))
    .leftJoin(
      ride_participants,
      and(eq(ride_participants.ride_id, rides.id), eq(ride_participants.user_id, userId)),
    )
    .where(eq(rides.id, rideId));

  if (!row) {
    throw new RideNotFoundError();
  }

  if (!row.participant) {
    throw new ParticipantNotFoundError();
  }

  if (!row.route) {
    throw new RouteNotFoundError();
  }

  return getDownloadUrl(s3, row.route.s3_key, `${row.route.name}.gpx`, 'application/gpx+xml');
};
