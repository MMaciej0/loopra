import { z } from 'zod';
import { VALIDATION_ERROR_TYPES } from '../errors.js';
import { EmailSchema, PasswordSchema, UsernameSchema } from './common.js';

const RequiredStringSchema = z
  .string(VALIDATION_ERROR_TYPES.REQUIRED)
  .min(1, VALIDATION_ERROR_TYPES.REQUIRED);

export const RegisterBodySchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  username: UsernameSchema,
});

export const LoginBodySchema = z.object({
  email: EmailSchema,
  password: RequiredStringSchema,
});

export const ForgotPasswordBodySchema = z.object({
  email: EmailSchema,
});

export const ResetPasswordBodySchema = z.object({
  token: RequiredStringSchema,
  password: PasswordSchema,
});

export const ChangePasswordBodySchema = z.object({
  current_password: RequiredStringSchema,
  new_password: PasswordSchema,
});

export const VerifyEmailBodySchema = z.object({
  token: RequiredStringSchema,
});

export const ResendVerificationEmailBodySchema = z.object({
  email: EmailSchema,
});

export const AuthUserSchema = z.object({
  id: z.uuid(),
  email: z.string(),
  email_verified: z.boolean(),
  username: z.string().nullable(),
});

export const AuthUserResponseSchema = z.object({ user: AuthUserSchema });

export const SessionResponseSchema = z.object({ user: z.object({ id: z.uuid() }) });

export const MessageResponseSchema = z.object({ message: z.string() });
