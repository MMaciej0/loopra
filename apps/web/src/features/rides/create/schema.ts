import { z } from 'zod';
import { APP_ERROR_TYPES } from '@/lib/errors';
import type { Route } from '@loopra/domain';
import {
  BIKE_TYPES,
  DISTANCE_MAX_KM,
  DISTANCE_MIN_KM,
  DROP_POLICIES,
  EXPERIENCE_POLICIES,
  FORMATION_POLICIES,
  LAT_MAX,
  LAT_MIN,
  LNG_MAX,
  LNG_MIN,
  LOCATION_NAME_MAX_LENGTH,
  MIN_LEAD_HOURS,
  PACE_MAX_KMH,
  PACE_MIN_KMH,
  PACE_POLICIES,
  PARTICIPANTS_MAX,
  PARTICIPANTS_MIN,
  RIDE_TYPES,
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH,
} from '@loopra/domain';

const coordsSchema = z.object({
  x: z.number().min(LNG_MIN).max(LNG_MAX),
  y: z.number().min(LAT_MIN).max(LAT_MAX),
});

export const createRideSchema = z
  .object({
    ride_type: z.enum(RIDE_TYPES),
    title: z
      .string()
      .trim()
      .min(TITLE_MIN_LENGTH, APP_ERROR_TYPES.TITLE_TOO_SHORT)
      .max(TITLE_MAX_LENGTH, APP_ERROR_TYPES.TITLE_TOO_LONG),
    description: z.string().trim().optional(),
    start_location: coordsSchema
      .optional()
      .refine((v) => v !== undefined, APP_ERROR_TYPES.START_POINT_REQUIRED),
    start_location_name: z
      .string()
      .trim()
      .min(1, APP_ERROR_TYPES.LOCATION_NAME_REQUIRED)
      .max(LOCATION_NAME_MAX_LENGTH, APP_ERROR_TYPES.LOCATION_NAME_TOO_LONG),
    country: z.string().min(1, APP_ERROR_TYPES.START_POINT_REQUIRED),
    municipality: z.string().min(1, APP_ERROR_TYPES.START_POINT_REQUIRED),
    region: z.string().min(1, APP_ERROR_TYPES.START_POINT_REQUIRED),
    city: z.string().min(1, APP_ERROR_TYPES.START_POINT_REQUIRED),
    postal_code: z.string().min(1, APP_ERROR_TYPES.START_POINT_REQUIRED),
    full_address: z.string().min(1, APP_ERROR_TYPES.START_POINT_REQUIRED),
    // optional + refine rather than a bare z.date(): an invalid_type anywhere in the
    // object aborts the cross-field refines below, a failed check does not
    start_time: z
      .date({ error: APP_ERROR_TYPES.DATE_REQUIRED })
      .optional()
      .refine((d) => d !== undefined, APP_ERROR_TYPES.DATE_REQUIRED)
      .refine((d) => {
        if (d === undefined) return true;
        const min = new Date();
        min.setHours(min.getHours() + MIN_LEAD_HOURS);
        return d.getTime() >= min.getTime();
      }, APP_ERROR_TYPES.START_TOO_SOON),
    bike_type: z.enum(BIKE_TYPES),
    drop_policy: z.enum(DROP_POLICIES),
    pace_policy: z.enum(PACE_POLICIES),
    formation_policy: z.enum(FORMATION_POLICIES),
    experience_policy: z.enum(EXPERIENCE_POLICIES),
    max_participants: z
      .number(APP_ERROR_TYPES.MAX_PARTICIPANTS_REQUIRED)
      .int(APP_ERROR_TYPES.MAX_PARTICIPANTS_OUT_OF_RANGE)
      .min(PARTICIPANTS_MIN, APP_ERROR_TYPES.MAX_PARTICIPANTS_OUT_OF_RANGE)
      .max(PARTICIPANTS_MAX, APP_ERROR_TYPES.MAX_PARTICIPANTS_OUT_OF_RANGE),
    route: z.custom<Route>().optional(),
    distance_km: z
      .number(APP_ERROR_TYPES.DISTANCE_OUT_OF_RANGE)
      .min(DISTANCE_MIN_KM, APP_ERROR_TYPES.DISTANCE_OUT_OF_RANGE)
      .max(DISTANCE_MAX_KM, APP_ERROR_TYPES.DISTANCE_OUT_OF_RANGE)
      .optional(),
    average_pace_kmh: z
      .number(APP_ERROR_TYPES.PACE_REQUIRED)
      .int(APP_ERROR_TYPES.PACE_OUT_OF_RANGE)
      .min(PACE_MIN_KMH, APP_ERROR_TYPES.PACE_OUT_OF_RANGE)
      .max(PACE_MAX_KMH, APP_ERROR_TYPES.PACE_OUT_OF_RANGE)
      .optional(),
  })
  .refine((f) => f.pace_policy !== 'leader' || f.average_pace_kmh !== undefined, {
    path: ['average_pace_kmh'],
    error: APP_ERROR_TYPES.PACE_REQUIRED,
  });

export type CreateRideInput = z.infer<typeof createRideSchema>;
