import z from 'zod';
import {
  BIKE_TYPES,
  fitsSearchArea,
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
  RIDE_IDS_MAX,
  RIDE_TYPES,
  SEARCH_AREA_MAX_KM,
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH,
} from '@loopra/domain';

const BBoxSchema = z
  .string()
  .transform((value) => value.split(',').map((part) => (part.trim() === '' ? NaN : Number(part))))
  .pipe(
    z.tuple([
      z.number().min(LNG_MIN).max(LNG_MAX),
      z.number().min(LAT_MIN).max(LAT_MAX),
      z.number().min(LNG_MIN).max(LNG_MAX),
      z.number().min(LAT_MIN).max(LAT_MAX),
    ]),
  )
  .transform(([west, south, east, north]) => ({ west, south, east, north }))
  .refine((b) => b.west <= b.east, { message: 'bbox must not cross the antimeridian' })
  .refine((b) => b.south <= b.north, { message: 'bbox south must not be above north' })
  .refine(fitsSearchArea, {
    message: `bbox must be at most ${SEARCH_AREA_MAX_KM} km on its longest side`,
  });

const RideIdsSchema = z
  .string()
  .transform((value) => value.split(','))
  .pipe(z.array(z.uuid()).min(1).max(RIDE_IDS_MAX));

const rideFilterProperties = {
  bike_type: z.enum(BIKE_TYPES).optional(),
  ride_type: z.enum(RIDE_TYPES).optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  date_from: z.coerce.date().optional(),
  date_to: z.coerce.date().optional(),
};

export const ListRidesQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  ...rideFilterProperties,
  bbox: BBoxSchema.optional(),
  ids: RideIdsSchema.optional(),
});

export const ListRideMarkersQuerySchema = z.object({
  ...rideFilterProperties,
  bbox: BBoxSchema,
});

export const CreateRideBodySchema = z
  .object({
    title: z.string().trim().min(TITLE_MIN_LENGTH).max(TITLE_MAX_LENGTH),
    description: z.string().optional(),
    start_location: z
      .object({
        x: z.coerce.number().min(LNG_MIN).max(LNG_MAX),
        y: z.coerce.number().min(LAT_MIN).max(LAT_MAX),
      })
      .optional(),
    start_location_name: z.string().trim().max(LOCATION_NAME_MAX_LENGTH).optional(),
    city: z.string(),
    municipality: z.string().optional(),
    region: z.string().optional(),
    country: z.string(),
    postal_code: z.string().optional(),
    full_address: z.string().optional(),

    // Minimum 5h lead time — prevents ghost rides nobody can find in time
    start_time: z.coerce.date().refine((d) => {
      const now = new Date();
      now.setHours(now.getHours() + MIN_LEAD_HOURS);
      return d.getTime() >= now.getTime();
    }),

    end_time: z.coerce.date().optional(),
    distance_km: z.coerce
      .number()
      .min(DISTANCE_MIN_KM)
      .max(DISTANCE_MAX_KM)
      .transform((d) => d.toString())
      .optional(),
    average_pace_kmh: z.coerce.number().int().min(PACE_MIN_KMH).max(PACE_MAX_KMH).optional(),
    ride_type: z.enum(RIDE_TYPES),
    bike_type: z.enum(BIKE_TYPES),
    drop_policy: z.enum(DROP_POLICIES),
    pace_policy: z.enum(PACE_POLICIES),
    formation_policy: z.enum(FORMATION_POLICIES),
    experience_policy: z.enum(EXPERIENCE_POLICIES),
    // 2 = the creator plus one other rider; the creator holds a seat
    max_participants: z.coerce.number().int().min(PARTICIPANTS_MIN).max(PARTICIPANTS_MAX),
    is_private: z.boolean().default(false),
    route_id: z.uuid().optional(),
  })
  .refine((f) => {
    const startTime = f.start_time;
    const endTime = f.end_time;
    if (endTime) {
      return startTime < endTime;
    }
    return true;
  })
  .refine((f) => f.pace_policy !== 'leader' || f.average_pace_kmh !== undefined, {
    path: ['average_pace_kmh'],
  });

export const UpdateRideBodySchema = z
  .object({
    title: z.string().trim().min(TITLE_MIN_LENGTH).max(TITLE_MAX_LENGTH).optional(),
    description: z.string().optional(),
    start_location: z
      .object({
        x: z.coerce.number().min(LNG_MIN).max(LNG_MAX),
        y: z.coerce.number().min(LAT_MIN).max(LAT_MAX),
      })
      .optional(),
    start_location_name: z.string().trim().max(LOCATION_NAME_MAX_LENGTH).optional(),
    city: z.string().optional(),
    municipality: z.string().optional(),
    region: z.string().optional(),
    country: z.string().optional(),
    postal_code: z.string().optional(),
    full_address: z.string().optional(),

    // Minimum 5h lead time — prevents ghost rides nobody can find in time
    start_time: z.coerce
      .date()
      .refine((d) => {
        const now = new Date();
        now.setHours(now.getHours() + MIN_LEAD_HOURS);
        return d.getTime() >= now.getTime();
      })
      .optional(),

    end_time: z.coerce.date().optional(),
    distance_km: z.coerce
      .number()
      .min(DISTANCE_MIN_KM)
      .max(DISTANCE_MAX_KM)
      .transform((d) => d.toString())
      .optional(),
    average_pace_kmh: z.coerce.number().int().min(PACE_MIN_KMH).max(PACE_MAX_KMH).optional(),
    ride_type: z.enum(RIDE_TYPES).optional(),
    bike_type: z.enum(BIKE_TYPES).optional(),
    drop_policy: z.enum(DROP_POLICIES).optional(),
    pace_policy: z.enum(PACE_POLICIES).optional(),
    formation_policy: z.enum(FORMATION_POLICIES).optional(),
    experience_policy: z.enum(EXPERIENCE_POLICIES).optional(),
    // 2 = the creator plus one other rider; the creator holds a seat
    max_participants: z.coerce
      .number()
      .int()
      .min(PARTICIPANTS_MIN)
      .max(PARTICIPANTS_MAX)
      .optional(),
    is_private: z.boolean().optional(),
  })
  .refine((f) => {
    const startTime = f.start_time;
    const endTime = f.end_time;
    if (endTime && startTime) {
      return startTime < endTime;
    }
    return true;
  })
  .refine((f) => f.pace_policy !== 'leader' || f.average_pace_kmh !== undefined, {
    path: ['average_pace_kmh'],
  });

export type UpdateRideBody = z.infer<typeof UpdateRideBodySchema>;
export type CreateRideBody = z.infer<typeof CreateRideBodySchema>;
export type ListRidesQuery = z.infer<typeof ListRidesQuerySchema>;
export type ListRideMarkersQuery = z.infer<typeof ListRideMarkersQuerySchema>;
