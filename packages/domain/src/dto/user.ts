import type { Static } from 'typebox';
import type {
  CurrentUserSchema,
  GetCurrentUserResponseSchema,
  UpdateCurrentUserResponseSchema,
} from '../schemas/user.js';

export type CurrentUser = Static<typeof CurrentUserSchema>;
export type GetCurrentUserResponse = Static<typeof GetCurrentUserResponseSchema>;
export type UpdateCurrentUserResponse = Static<typeof UpdateCurrentUserResponseSchema>;
