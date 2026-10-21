import { z } from 'zod';
import { IsoDateTime } from './common.js';
import { SelectedLocationSchema } from './location.js';

export const CurrentUserSchema = z.object({
  id: z.uuid(),
  email: z.string(),
  username: z.string().nullable(),
  created_at: IsoDateTime,
  email_verified: z.boolean(),
  has_password: z.boolean(),
  is_guest: z.boolean(),
  selected_location: SelectedLocationSchema.nullable(),
});

export const GetCurrentUserResponseSchema = z.object({ user: CurrentUserSchema });

export const UpdateCurrentUserResponseSchema = z.object({ updatedUser: CurrentUserSchema });
