'use server';

import { protectedRequest } from '@/utils/api';
import { createRideSchema, type CreateRideInput } from '../schema';

export async function createRide(input: CreateRideInput) {
  const data = createRideSchema.parse(input);

  const payload = {
    ...data,
    description: data.description || undefined,
    bike_type: data.bike_type.toLowerCase() === 'all' ? undefined : data.bike_type,
    // drop a pace left over from switching away from the leader policy
    average_pace_kmh: data.pace_policy === 'leader' ? data.average_pace_kmh : undefined,
  };

  const response = await protectedRequest('/events', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return { ok: false as const, errorType: response.errorType };
  }

  return { ok: true as const, data: response.data };
}
