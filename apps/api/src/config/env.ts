import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  PORT: z.coerce.number().default(8080),
  JWT_ACCESS_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const { DATABASE_URL, REDIS_URL, PORT, JWT_ACCESS_SECRET, NODE_ENV } = schema.parse(process.env);
