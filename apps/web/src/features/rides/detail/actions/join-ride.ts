'use server';

import { revalidatePath } from 'next/cache';
import { protectedRequest } from '@/lib/api';

export async function joinRide(rideId: string) {
  const response = await protectedRequest(`/rides/${encodeURIComponent(rideId)}/join`, {
    method: 'POST',
  });

  if (!response.ok) {
    return { ok: false as const, errorType: response.errorType };
  }

  revalidatePath('/[locale]/(dashboard)/rides/[id]', 'page');
  return { ok: true as const };
}
