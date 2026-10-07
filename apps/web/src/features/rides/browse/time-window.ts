import type { RidesWhen } from './filters';

const NEXT_7_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export type RidesTimeWindow = Readonly<{ date_from: string; date_to?: string }>;

function upperBound(when: RidesWhen | undefined, now: Date): Date | undefined {
  if (when === 'today') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  }

  if (when === 'next_7_days') {
    return new Date(now.getTime() + NEXT_7_DAYS_MS);
  }

  return undefined;
}

export function buildRidesTimeWindow(when: RidesWhen | undefined): RidesTimeWindow {
  const now = new Date();
  const dateTo = upperBound(when, now);

  return {
    date_from: now.toISOString(),
    ...(dateTo && { date_to: dateTo.toISOString() }),
  };
}
