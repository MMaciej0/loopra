import z from 'zod';

const ServiceStatusSchema = z.enum(['ok', 'error']);

export type ServiceStatus = z.output<typeof ServiceStatusSchema>;

export const HealthResponseSchema = z.object({
  status: ServiceStatusSchema,
  postgres: ServiceStatusSchema,
  redis: ServiceStatusSchema,
});

export type HealthResponse = z.output<typeof HealthResponseSchema>;
