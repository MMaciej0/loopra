import z from 'zod';
import { ERROR_TYPES } from '@loopra/domain';
import { UsernameSchema } from '@loopra/domain/schemas';

export const UpdateUserBodySchema = z
  .object({
    username: UsernameSchema.optional(),
  })
  .refine((body) => Object.keys(body).length > 0, { message: 'Nothing to update' });

export type UpdateUserBody = z.output<typeof UpdateUserBodySchema>;

export const LocationBodySchema = z.object({
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

export type LocationBody = z.output<typeof LocationBodySchema>;

export const FavoriteLocationParamsSchema = z.object({
  id: z.uuid(ERROR_TYPES.FAVORITE_LOCATION_NOT_FOUND),
});
