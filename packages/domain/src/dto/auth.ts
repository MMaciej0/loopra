import type { Static } from 'typebox';
import type {
  AuthUserResponseSchema,
  AuthUserSchema,
  MessageResponseSchema,
  SessionResponseSchema,
} from '../schemas/auth.js';

export type AuthUser = Static<typeof AuthUserSchema>;
export type AuthUserResponse = Static<typeof AuthUserResponseSchema>;
export type SessionResponse = Static<typeof SessionResponseSchema>;
export type MessageResponse = Static<typeof MessageResponseSchema>;
