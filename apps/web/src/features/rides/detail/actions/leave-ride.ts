'use server';

import { revalidatePath } from 'next/cache';
import { RideParticipantResponseSchema } from '@loopra/domain/schemas';
import { protectedRequest } from '@/lib/api';

export async function leaveRide(rideId: string) {
  const response = await protectedRequest(`/rides/${encodeURIComponent(rideId)}/leave`, {
    method: 'DELETE',
    schema: RideParticipantResponseSchema,
  });

  if (!response.ok) {
    return { ok: false as const, errorType: response.errorType };
  }

  revalidatePath('/[locale]/(dashboard)/rides/[id]', 'page');
  return { ok: true as const };
}
