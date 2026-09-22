import type { Static } from 'typebox';
import type {
  SelectedLocationSchema,
  UpdateSelectedLocationResponseSchema,
} from '../schemas/location.js';

export type SelectedLocation = Static<typeof SelectedLocationSchema>;
export type UpdateSelectedLocationResponse = Static<typeof UpdateSelectedLocationResponseSchema>;
