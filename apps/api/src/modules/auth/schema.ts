import z from 'zod';
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_SPECIAL_CHAR_PATTERN,
  PASSWORD_UPPERCASE_PATTERN,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from '@loopra/domain';

const PasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH)
  .regex(PASSWORD_UPPERCASE_PATTERN)
  .regex(PASSWORD_SPECIAL_CHAR_PATTERN);

export const EmailSchema = z.string().trim().toLowerCase().pipe(z.email());

export const RegisterBodySchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  username: z.string().trim().min(USERNAME_MIN_LENGTH).max(USERNAME_MAX_LENGTH),
});

export const LoginBodySchema = z.object({
  email: EmailSchema,
  password: z.string(),
});

export const ForgottenPasswordBodySchema = z.object({
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

export const ResendEmailVerificationBodySchema = z.object({
  email: EmailSchema,
});

export type VerifyEmailBody = z.infer<typeof VerifyEmailBodySchema>;
export type RegisterBody = z.infer<typeof RegisterBodySchema>;
export type LoginBody = z.infer<typeof LoginBodySchema>;
export type ForgottenPasswordBody = z.infer<typeof ForgottenPasswordBodySchema>;
export type ResetPasswordBody = z.infer<typeof ResetPasswordBodySchema>;
