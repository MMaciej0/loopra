'use server';

import { protectedRequest } from '@/utils/api';
import { createRideSchema, type CreateRideInput } from './schema';

export async function createRide(input: CreateRideInput) {
  const data = createRideSchema.parse(input);

  const response = await protectedRequest('/events', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    return { ok: false as const, errorType: response.errorType };
  }

  return { ok: true as const, data: response.data };
}
