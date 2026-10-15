import { S3Client } from '@aws-sdk/client-s3';
import { eq } from 'drizzle-orm';
import { Db } from '../../../db/index.js';
import { rides, routes } from '../../../db/schema.js';
import { getDownloadUrl } from '../../../utils/s3.js';
import { RideNotFoundError, RouteNotFoundError } from '../errors.js';

export const getRouteDownloadUrl = async (db: Db, s3: S3Client, rideId: string) => {
  const [row] = await db
    .select({ route: { s3_key: routes.s3_key, name: routes.name } })
    .from(rides)
    .leftJoin(routes, eq(routes.id, rides.route_id))
    .where(eq(rides.id, rideId));

  if (!row) {
    throw new RideNotFoundError();
  }

  if (!row.route) {
    throw new RouteNotFoundError();
  }

  return getDownloadUrl(s3, row.route.s3_key, `${row.route.name}.gpx`, 'application/gpx+xml');
};
