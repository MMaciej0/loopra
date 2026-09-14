import z from 'zod';

export const UpdateUserBodySchema = z.object({
  username: z.string().trim().min(1).max(30).optional(),
  favorite_location: z
    .object({
      x: z.coerce.number().min(-180).max(180),
      y: z.coerce.number().min(-90).max(90),
    })
    .optional(),
  favorite_city: z.string().trim().optional(),
  favorite_municipality: z.string().trim().optional(),
  favorite_region: z.string().trim().optional(),
  favorite_country: z.string().trim().optional(),
  favorite_postal_code: z.string().trim().optional(),
  favorite_location_chosen: z.literal(true).optional(),
  dismiss_location_prompt: z.literal(true).optional(),
});

export type UpdateUserBody = z.infer<typeof UpdateUserBodySchema>;
