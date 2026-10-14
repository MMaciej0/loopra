import type z from 'zod';
import type {
  AuthUserResponseSchema,
  AuthUserSchema,
  MessageResponseSchema,
  SessionResponseSchema,
} from '../schemas/auth.js';

export type AuthUser = z.output<typeof AuthUserSchema>;
export type AuthUserResponse = z.output<typeof AuthUserResponseSchema>;
export type SessionResponse = z.output<typeof SessionResponseSchema>;
export type MessageResponse = z.output<typeof MessageResponseSchema>;
