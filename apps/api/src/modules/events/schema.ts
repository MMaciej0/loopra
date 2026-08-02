import z from 'zod';

export const ListEventsQuerySchema = z
  .object({
    cursor: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    bike_type: z.enum(['road', 'gravel', 'mtb', 'trekking', 'urban', 'electric', 'cyclocross', 'tt']).optional(),
    ride_type: z.enum(['coffee_ride', 'sightseeing', 'casual', 'training']).optional(),
    city: z.string().optional(),
    region: z.string().optional(),
    country: z.string().optional(),
    date_from: z.coerce.date().optional(),
    date_to: z.coerce.date().optional(),
    lat: z.coerce.number().min(-90).max(90).optional(),
    lng: z.coerce.number().min(-180).max(180).optional(),
    radius_km: z.coerce.number().min(1).max(500).optional(),
    status: z.enum(['draft', 'open', 'full', 'cancelled', 'completed']).optional(),
  })
  .refine(
    (d) => {
      const geoFields = [d.lat, d.lng, d.radius_km];
      const provided = geoFields.filter((v) => v !== undefined).length;
      return provided === 0 || provided === 3; // all or none
    },
    { message: 'lat, lng, and radius_km must all be provided together' },
  );

export const CreateEventBodySchema = z
  .object({
    title: z.string().min(5).max(50),
    description: z.string().optional(),
    start_location: z
      .object({
        x: z.coerce.number().min(-180).max(180),
        y: z.coerce.number().min(-90).max(90),
      })
      .optional(),
    start_location_name: z.string().optional(),
    city: z.string(),
    municipality: z.string().optional(),
    region: z.string().optional(),
    country: z.string(),
    postal_code: z.string().optional(),
    full_address: z.string().optional(),

    // Minimum 5h lead time — prevents ghost events nobody can find in time
    start_time: z.coerce.date().refine((d) => {
      const now = new Date();
      now.setHours(now.getHours() + 5);
      return d.getTime() >= now.getTime();
    }),

    end_time: z.coerce.date().optional(),
    distance_km: z.coerce
      .number()
      .min(1)
      .transform((d) => d.toString())
      .optional(),
    average_pace_kmh: z.coerce.number().int().min(1).optional(),
    ride_type: z.enum(['coffee_ride', 'sightseeing', 'casual', 'training']),
    bike_type: z.enum(['road', 'gravel', 'mtb', 'trekking', 'urban', 'electric', 'cyclocross', 'tt']).optional(),
    drop_policy: z.enum(['no_drop', 'regroup', 'drop']),
    pace_policy: z.enum(['slowest_rider', 'leader', 'group_split']),
    formation_policy: z.enum(['free', 'leader', 'rotation']),
    experience_policy: z.enum(['first_timers', 'moderate', 'advanced']),
    // 2 = the creator plus one other rider; the creator holds a seat
    max_participants: z.coerce.number().int().min(2).optional(),
    is_private: z.boolean().default(false),
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

export const UpdateEventBodySchema = z
  .object({
    title: z.string().min(5).max(50).optional(),
    description: z.string().optional(),
    start_location: z
      .object({
        x: z.coerce.number().min(-180).max(180),
        y: z.coerce.number().min(-90).max(90),
      })
      .optional(),
    start_location_name: z.string().optional(),
    city: z.string().optional(),
    municipality: z.string().optional(),
    region: z.string().optional(),
    country: z.string().optional(),
    postal_code: z.string().optional(),
    full_address: z.string().optional(),

    // Minimum 5h lead time — prevents ghost events nobody can find in time
    start_time: z.coerce
      .date()
      .refine((d) => {
        const now = new Date();
        now.setHours(now.getHours() + 5);
        return d.getTime() >= now.getTime();
      })
      .optional(),

    end_time: z.coerce.date().optional(),
    distance_km: z.coerce
      .number()
      .min(1)
      .transform((d) => d.toString())
      .optional(),
    average_pace_kmh: z.coerce.number().int().min(1).optional(),
    ride_type: z.enum(['coffee_ride', 'sightseeing', 'casual', 'training']).optional(),
    bike_type: z.enum(['road', 'gravel', 'mtb', 'trekking', 'urban', 'electric', 'cyclocross', 'tt']).optional(),
    drop_policy: z.enum(['no_drop', 'regroup', 'drop']).optional(),
    pace_policy: z.enum(['slowest_rider', 'leader', 'group_split']).optional(),
    formation_policy: z.enum(['free', 'leader', 'rotation']).optional(),
    experience_policy: z.enum(['first_timers', 'moderate', 'advanced']).optional(),
    // 2 = the creator plus one other rider; the creator holds a seat
    max_participants: z.coerce.number().int().min(2).optional(),
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

export type UpdateEventBody = z.infer<typeof UpdateEventBodySchema>;
export type CreateEventBody = z.infer<typeof CreateEventBodySchema>;
export type ListEventsQuery = z.infer<typeof ListEventsQuerySchema>;
