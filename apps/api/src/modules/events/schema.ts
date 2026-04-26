import z from 'zod';

export const ListEventsQuerySchema = z
  .object({
    cursor: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    type: z.enum(['trip', 'training']).optional(),
    bike_type: z.enum(['road', 'gravel', 'mtb', 'trekking']).optional(),
    difficulty: z.enum(['easy', 'moderate', 'hard', 'expert']).optional(),
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

export type ListEventsQuery = z.infer<typeof ListEventsQuerySchema>;
