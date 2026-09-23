import type { Static } from 'typebox';
import type {
  CreateFavoriteLocationResponseSchema,
  FavoriteLocationSchema,
  ListFavoriteLocationsResponseSchema,
  SelectedLocationSchema,
  UpdateSelectedLocationResponseSchema,
} from '../schemas/location.js';

export type SelectedLocation = Static<typeof SelectedLocationSchema>;
export type UpdateSelectedLocationResponse = Static<typeof UpdateSelectedLocationResponseSchema>;
export type FavoriteLocation = Static<typeof FavoriteLocationSchema>;
export type ListFavoriteLocationsResponse = Static<typeof ListFavoriteLocationsResponseSchema>;
export type CreateFavoriteLocationResponse = Static<typeof CreateFavoriteLocationResponseSchema>;
