import { z } from 'zod';
import { APP_ERROR_TYPES } from '@/utils/errors';
import {
  BIKE_TYPES,
  LAT_MAX,
  LAT_MIN,
  LNG_MAX,
  LNG_MIN,
  MIN_LEAD_HOURS,
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
    .min(TITLE_MIN_LENGTH, APP_ERROR_TYPES.TITLE_TOO_SHORT)
    .max(TITLE_MAX_LENGTH, APP_ERROR_TYPES.TITLE_TOO_LONG),
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
  start_time: z.date({ error: APP_ERROR_TYPES.DATE_REQUIRED }).refine((d) => {
    const min = new Date();
    min.setHours(min.getHours() + MIN_LEAD_HOURS);
    return d.getTime() >= min.getTime();
  }, APP_ERROR_TYPES.START_TOO_SOON),
  bike_type: z.enum(['all', ...BIKE_TYPES]),
});

export type Coords = z.infer<typeof coordsSchema>;
export type CreateRideInput = z.infer<typeof createRideSchema>;
