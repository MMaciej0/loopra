import z from 'zod';

export const UpdateUserBodySchema = z
  .object({
    username: z.string().trim().min(1).max(30).optional(),
  })
  .refine((body) => Object.keys(body).length > 0, { message: 'Nothing to update' });

export type UpdateUserBody = z.infer<typeof UpdateUserBodySchema>;

export const ReplaceSelectedLocationBodySchema = z.object({
  location: z.object({
    x: z.coerce.number().min(-180).max(180),
    y: z.coerce.number().min(-90).max(90),
  }),
  city: z.string().trim().min(1),
  district: z.string().trim().nullable().default(null),
  municipality: z.string().trim().nullable().default(null),
  region: z.string().trim().nullable().default(null),
  country: z.string().trim().min(1),
  postal_code: z.string().trim().nullable().default(null),
});

export type ReplaceSelectedLocationBody = z.infer<typeof ReplaceSelectedLocationBodySchema>;
