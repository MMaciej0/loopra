'use server';

import { protectedRequest } from '@/lib/api';
import { createRideSchema, type CreateRideInput } from '../schema';

export async function createRide(input: CreateRideInput) {
  const data = createRideSchema.parse(input);

  const payload = {
    ...data,
    route: undefined,
    route_id: data.route?.id,
    description: data.description || undefined,
    // drop a pace left over from switching away from the leader policy
    average_pace_kmh: data.pace_policy === 'leader' ? data.average_pace_kmh : undefined,
  };

  const response = await protectedRequest('/rides', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return { ok: false as const, errorType: response.errorType };
  }

  return { ok: true as const, data: response.data };
}
