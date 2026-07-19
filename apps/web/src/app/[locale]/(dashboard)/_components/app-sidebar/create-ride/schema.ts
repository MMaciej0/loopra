import { z } from 'zod';

const MIN_LEAD_HOURS = 5;

const coordsSchema = z.object({
  x: z.number().min(-180).max(180),
  y: z.number().min(-90).max(90),
});

export const createRideSchema = z.object({
  type: z.enum(['trip', 'training']),
  title: z.string().min(5, 'Title must be at least 5 characters').max(50, 'Title is too long'),
  start_location: coordsSchema.optional().refine((v) => v !== undefined, 'Pick a start point'),
  start_location_name: z.string().min(1, 'Name this location'),
  city: z.string().min(1, 'Pick a start point'),
  country: z.string().min(1, 'Pick a start point'),
  start_time: z.date({ error: 'Pick a date' }).refine((d) => {
    const min = new Date();
    min.setHours(min.getHours() + MIN_LEAD_HOURS);
    return d.getTime() >= min.getTime();
  }, `Start must be at least ${MIN_LEAD_HOURS} hours from now`),
});

export type Coords = z.infer<typeof coordsSchema>;
export type CreateRideInput = z.infer<typeof createRideSchema>;
