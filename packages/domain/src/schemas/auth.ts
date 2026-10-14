import { z } from 'zod';
import { EmailSchema, PasswordSchema, UsernameSchema } from './common.js';

export const RegisterBodySchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  username: UsernameSchema,
});

export const LoginBodySchema = z.object({
  email: EmailSchema,
  password: z.string(),
});

export const ForgotPasswordBodySchema = z.object({
  email: EmailSchema,
});

export const ResetPasswordBodySchema = z.object({
  token: z.string(),
  password: PasswordSchema,
});

export const ChangePasswordBodySchema = z.object({
  current_password: z.string(),
  new_password: PasswordSchema,
});

export const VerifyEmailBodySchema = z.object({
  token: z.string(),
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
