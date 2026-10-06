'use client';

import { useSyncExternalStore } from 'react';
import { useFormatter } from 'next-intl';

const subscribe = () => () => {};

export function useStartTimeLabel(startTime?: Date): string | null {
  const format = useFormatter();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  if (!mounted || startTime === undefined) {
    return null;
  }

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return [
    format.dateTime(startTime, { weekday: 'short', timeZone }),
    format.dateTime(startTime, { month: 'short', day: 'numeric', timeZone }),
    format.dateTime(startTime, { hour: '2-digit', minute: '2-digit', timeZone }),
  ].join(' · ');
}
