import z from 'zod';

export const RegisterBodySchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const LoginBodySchema = z.object({
  email: z.email(),
  password: z.string(),
});

export type RegisterBody = z.infer<typeof RegisterBodySchema>;
export type LoginBody = z.infer<typeof LoginBodySchema>;
