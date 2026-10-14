import type { z } from 'zod';
import type {
  FavoriteLocationResponseSchema,
  FavoriteLocationSchema,
  ListFavoriteLocationsResponseSchema,
  SelectedLocationSchema,
  UpdateSelectedLocationResponseSchema,
} from '../schemas/location.js';

export type SelectedLocation = z.output<typeof SelectedLocationSchema>;
export type UpdateSelectedLocationResponse = z.output<typeof UpdateSelectedLocationResponseSchema>;
export type FavoriteLocation = z.output<typeof FavoriteLocationSchema>;
export type ListFavoriteLocationsResponse = z.output<typeof ListFavoriteLocationsResponseSchema>;
export type FavoriteLocationResponse = z.output<typeof FavoriteLocationResponseSchema>;
