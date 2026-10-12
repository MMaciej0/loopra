import { z } from 'zod';
import { PHASES, RIDE_ROLES, type Phase, type RideRole } from '@loopra/domain';

export type MyRidesFilters = Readonly<{ phase: Phase; role?: RideRole }>;

export type MyRidesFilterParams = Readonly<Record<keyof MyRidesFilters, string | string[]>>;

const DEFAULT_PHASE: Phase = 'upcoming';

const phaseSchema = z.enum(PHASES);
const roleSchema = z.enum(RIDE_ROLES);

export function parseMyRidesFilters(searchParams: Partial<MyRidesFilterParams>): MyRidesFilters {
  const phase = phaseSchema.safeParse(searchParams.phase);
  const role = roleSchema.safeParse(searchParams.role);

  return {
    phase: phase.success ? phase.data : DEFAULT_PHASE,
    role: role.success ? role.data : undefined,
  };
}

export function myRidesHref({ phase, role }: MyRidesFilters) {
  return {
    pathname: '/my-rides' as const,
    query: { ...(phase !== DEFAULT_PHASE && { phase }), ...(role && { role }) },
  };
}

export function myRidesListKey({ phase, role }: MyRidesFilters): string {
  return JSON.stringify([phase, role]);
}
