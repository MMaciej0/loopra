import { z } from 'zod';
import {
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
  type: z.enum(RIDE_TYPES),
  title: z
    .string()
    .min(TITLE_MIN_LENGTH, `Title must be at least ${TITLE_MIN_LENGTH} characters`)
    .max(TITLE_MAX_LENGTH, 'Title is too long'),
  start_location: coordsSchema.optional().refine((v) => v !== undefined, 'Pick a start point'),
  start_location_name: z.string().min(1, 'Name this location'),
  country: z.string().min(1, 'Pick a start point'),
  municipality: z.string().min(1, 'Pick a start point'),
  region: z.string().min(1, 'Pick a start point'),
  city: z.string().min(1, 'Pick a start point'),
  postal_code: z.string().min(1, 'Pick a start point'),
  full_address: z.string().min(1, 'Pick a start point'),
  start_time: z.date({ error: 'Pick a date' }).refine((d) => {
    const min = new Date();
    min.setHours(min.getHours() + MIN_LEAD_HOURS);
    return d.getTime() >= min.getTime();
  }, `Start must be at least ${MIN_LEAD_HOURS} hours from now`),
});

export type Coords = z.infer<typeof coordsSchema>;
export type CreateRideInput = z.infer<typeof createRideSchema>;
