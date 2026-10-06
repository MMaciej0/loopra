'use client';

import { useTranslations } from 'next-intl';
import { useStartTimeLabel } from '@/features/rides/components/use-start-time-label';

type Props = Readonly<{
  startTime: Date;
  startLocationName: string | null;
}>;

export function RideSubtitle({ startTime, startLocationName }: Props) {
  const t = useTranslations('RidePage');
  const timeLabel = useStartTimeLabel(startTime);
  const parts = [timeLabel, startLocationName && t('from', { location: startLocationName })].filter(
    Boolean,
  );

  return (
    <p className="font-ui text-muted-foreground mb-[22px] min-h-[1lh] text-[15px] leading-[22px]">
      {timeLabel ? parts.join(' · ') : null}
    </p>
  );
}
