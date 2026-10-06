import z from 'zod';
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from '@loopra/domain';

export const RegisterBodySchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  username: z.string().trim().min(USERNAME_MIN_LENGTH).max(USERNAME_MAX_LENGTH),
});

export const LoginBodySchema = z.object({
  email: z.email(),
  password: z.string(),
});

export const ForgottenPasswordBodySchema = z.object({
  email: z.email(),
});

export const ResetPasswordBodySchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

export const VerifyEmailBodySchema = z.object({
  token: z.string(),
});

export const ResendEmailVerificationBodySchema = z.object({
  email: z.email(),
});

export type VerifyEmailBody = z.infer<typeof VerifyEmailBodySchema>;
export type RegisterBody = z.infer<typeof RegisterBodySchema>;
export type LoginBody = z.infer<typeof LoginBodySchema>;
export type ForgottenPasswordBody = z.infer<typeof ForgottenPasswordBodySchema>;
export type ResetPasswordBody = z.infer<typeof ResetPasswordBodySchema>;
