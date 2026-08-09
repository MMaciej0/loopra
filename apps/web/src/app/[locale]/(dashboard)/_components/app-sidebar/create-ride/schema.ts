import { z } from 'zod';
import { APP_ERROR_TYPES } from '@/utils/errors';
import {
  BIKE_TYPES,
  DROP_POLICIES,
  EXPERIENCE_POLICIES,
  FORMATION_POLICIES,
  LAT_MAX,
  LAT_MIN,
  LNG_MAX,
  LNG_MIN,
  MAX_PARTICIPANTS_MAX,
  MAX_PARTICIPANTS_MIN,
  MIN_LEAD_HOURS,
  PACE_MAX_KMH,
  PACE_MIN_KMH,
  PACE_POLICIES,
  RIDE_TYPES,
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH,
} from '@/config/ride';

const coordsSchema = z.object({
  x: z.number().min(LNG_MIN).max(LNG_MAX),
  y: z.number().min(LAT_MIN).max(LAT_MAX),
});

export const createRideSchema = z.object({
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
  start_location_name: z.string().min(1, APP_ERROR_TYPES.LOCATION_NAME_REQUIRED),
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
  bike_type: z.enum(['all', ...BIKE_TYPES]),
  drop_policy: z.enum(DROP_POLICIES),
  pace_policy: z.enum(PACE_POLICIES),
  formation_policy: z.enum(FORMATION_POLICIES),
  experience_policy: z.enum(EXPERIENCE_POLICIES),
  // undefined = no cap
  max_participants: z
    .number(APP_ERROR_TYPES.MAX_PARTICIPANTS_OUT_OF_RANGE)
    .int(APP_ERROR_TYPES.MAX_PARTICIPANTS_OUT_OF_RANGE)
    .min(MAX_PARTICIPANTS_MIN, APP_ERROR_TYPES.MAX_PARTICIPANTS_OUT_OF_RANGE)
    .max(MAX_PARTICIPANTS_MAX, APP_ERROR_TYPES.MAX_PARTICIPANTS_OUT_OF_RANGE)
    .optional(),
  average_pace_kmh: z
    .number(APP_ERROR_TYPES.PACE_REQUIRED)
    .int(APP_ERROR_TYPES.PACE_OUT_OF_RANGE)
    .min(PACE_MIN_KMH, APP_ERROR_TYPES.PACE_OUT_OF_RANGE)
    .max(PACE_MAX_KMH, APP_ERROR_TYPES.PACE_OUT_OF_RANGE)
    .optional(),
}).refine((f) => f.pace_policy !== 'leader' || f.average_pace_kmh !== undefined, {
  path: ['average_pace_kmh'],
  error: APP_ERROR_TYPES.PACE_REQUIRED,
});

export type Coords = z.infer<typeof coordsSchema>;
export type CreateRideInput = z.infer<typeof createRideSchema>;
