'use server';

import { revalidatePath } from 'next/cache';
import { RideResponseSchema } from '@loopra/domain/schemas';
import { protectedRequest } from '@/lib/api';

export async function cancelRide(rideId: string) {
  const response = await protectedRequest(`/rides/${encodeURIComponent(rideId)}/cancel`, {
    method: 'POST',
    schema: RideResponseSchema,
  });

  if (!response.ok) {
    return { ok: false as const, errorType: response.errorType };
  }

  revalidatePath('/[locale]/(dashboard)/rides/[id]', 'page');
  return { ok: true as const };
}
