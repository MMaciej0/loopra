import type { z } from 'zod';
import type {
  CurrentUserSchema,
  GetCurrentUserResponseSchema,
  UpdateCurrentUserResponseSchema,
} from '../schemas/user.js';

export type CurrentUser = z.output<typeof CurrentUserSchema>;
export type GetCurrentUserResponse = z.output<typeof GetCurrentUserResponseSchema>;
export type UpdateCurrentUserResponse = z.output<typeof UpdateCurrentUserResponseSchema>;
