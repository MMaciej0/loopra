import { Db } from '../../../db/index.js';
import { parseGPX } from '@loopra/gpx';
import { routes } from '../../../db/schema.js';
import { deleteFromS3, uploadToS3 } from '../../../utils/s3.js';
import { S3Client } from '@aws-sdk/client-s3';
import { InvalidGpxError } from '../errors.js';

const NAME_MAX_LENGTH = 255;
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;

const sanitizeName = (value: string) =>
  value.replace(CONTROL_CHARS, '').trim().slice(0, NAME_MAX_LENGTH).trim();

const toRouteName = (gpxName: string | null, filename: string) =>
  sanitizeName(gpxName ?? '') || sanitizeName(filename) || 'Route';

export const createRoute = async (
  db: Db,
  s3: S3Client,
  buffer: Buffer,
  userId: string,
  filename: string,
) => {
  const s3Key = `routes/${userId}/${crypto.randomUUID()}.gpx`;

  let parsed;
  try {
    parsed = parseGPX(buffer.toString());
  } catch (error) {
    throw new InvalidGpxError(error instanceof Error ? error.message : undefined);
  }

  const { ascentM, descentM, distanceKm, pointCount, name, elevationProfile, path } = parsed;

  await uploadToS3(s3, buffer, s3Key, 'application/gpx+xml');

  try {
    const [newRoute] = await db
      .insert(routes)
      .values({
        s3_key: s3Key,
        ascent_m: ascentM.toString(),
        user_id: userId,
        descent_m: descentM.toString(),
        distance_km: distanceKm.toString(),
        point_count: pointCount,
        name: toRouteName(name, filename),
        elevation_profile: elevationProfile,
        path,
      })
      .returning({
        id: routes.id,
        user_id: routes.user_id,
        name: routes.name,
        distance_km: routes.distance_km,
        ascent_m: routes.ascent_m,
        descent_m: routes.descent_m,
        point_count: routes.point_count,
        elevation_profile: routes.elevation_profile,
      });

    return newRoute;
  } catch (error) {
    try {
      await deleteFromS3(s3, s3Key);
    } catch (deleteError) {
      console.error(`Failed to delete orphaned object ${s3Key}`, deleteError);
    }

    throw error;
  }
};
