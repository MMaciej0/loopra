'use client';

import { useTranslations } from 'next-intl';
import { Clock } from 'lucide-react';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useStartTimeLabel } from '@/features/rides/components/use-start-time-label';

export function RideStartTime({ startTime }: { startTime?: Date }) {
  const t = useTranslations('RideCard');
  const timeLabel = useStartTimeLabel(startTime);

  return (
    <Text variant="body-s" className={cn('flex items-center gap-1.5', !timeLabel && 'opacity-60')}>
      <Clock aria-hidden className="size-3.5 shrink-0" />
      {timeLabel ?? t('datePlaceholder')}
    </Text>
  );
}
