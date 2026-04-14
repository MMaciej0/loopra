import z from 'zod';

export const RegisterBodySchema = z.object({
  email: z.email(),
  password: z.string().min(8),
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

export type RegisterBody = z.infer<typeof RegisterBodySchema>;
export type LoginBody = z.infer<typeof LoginBodySchema>;
export type ForgottenPasswordBody = z.infer<typeof ForgottenPasswordBodySchema>;
export type ResetPasswordBody = z.infer<typeof ResetPasswordBodySchema>;
