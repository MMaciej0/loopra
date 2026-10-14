import { z } from 'zod';
import { IsoDateTime } from './common.js';

export const SelectedLocationSchema = z.object({
  location: z.object({ x: z.number(), y: z.number() }),
  city: z.string(),
  district: z.string().nullable(),
  municipality: z.string().nullable(),
  region: z.string().nullable(),
  country: z.string(),
  postal_code: z.string().nullable(),
});

export const UpdateSelectedLocationResponseSchema = z.object({
  selected_location: SelectedLocationSchema,
});

export const FavoriteLocationSchema = z.object({
  id: z.uuid(),
  ...SelectedLocationSchema.shape,
  created_at: IsoDateTime,
});

export const ListFavoriteLocationsResponseSchema = z.object({
  favorite_locations: z.array(FavoriteLocationSchema),
});

export const FavoriteLocationResponseSchema = z.object({
  favorite_location: FavoriteLocationSchema,
});
