import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  PORT: z.coerce.number().default(8080),
});

export const { DATABASE_URL, REDIS_URL, PORT } = schema.parse(process.env);
