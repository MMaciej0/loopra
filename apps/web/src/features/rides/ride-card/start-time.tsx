'use client';

import { useSyncExternalStore } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { Clock } from 'lucide-react';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

const subscribe = () => () => {};

export function RideStartTime({ startTime }: { startTime?: Date }) {
  const t = useTranslations('RideCard');
  const format = useFormatter();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const showTime = mounted && startTime !== undefined;
  let label = t('datePlaceholder');

  if (showTime) {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    label = [
      format.dateTime(startTime, { weekday: 'short', timeZone }),
      format.dateTime(startTime, { month: 'short', day: 'numeric', timeZone }),
      format.dateTime(startTime, { hour: '2-digit', minute: '2-digit', timeZone }),
    ].join(' · ');
  }

  return (
    <Text variant="body-s" className={cn('flex items-center gap-1.5', !showTime && 'opacity-60')}>
      <Clock aria-hidden className="size-3.5 shrink-0" />
      {label}
    </Text>
  );
}
