'use client';

import type { RideDetail } from '@loopra/domain';
import { useTranslations } from 'next-intl';
import { Text } from '@/components/ui/text';
import { useCurrentUser } from '@/features/shell/components/current-user-provider';

type Props = Readonly<{
  ride: RideDetail;
}>;

export function JoinCard({ ride }: Props) {
  const t = useTranslations('RidePage');
  const user = useCurrentUser();

  const capacity = ride.max_participants;
  const count = ride.participants.length;
  const seatsLeft = Math.max(0, capacity - count);
  const takenPercent = capacity > 0 ? Math.min(100, (count / capacity) * 100) : 100;
  const isOrganiser = user?.id === ride.creator.id;

  return (
    <section className="bg-card border-border -order-1 mb-[26px] rounded-[14px] border px-[22px] py-5 lg:order-none lg:mb-0">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-ui text-foreground text-[13.5px] font-medium">
          {t('joinRiders', { count, capacity })}
        </span>
        <Text variant="caption" className="text-muted-foreground shrink-0">
          {seatsLeft === 0 ? t('joinFull') : t('joinSeatsLeft', { count: seatsLeft })}
        </Text>
      </div>
      <div
        role="progressbar"
        aria-label={t('joinRiders', { count, capacity })}
        aria-valuemin={0}
        aria-valuemax={capacity}
        aria-valuenow={Math.min(count, capacity)}
        className="bg-muted mt-3 h-1.5 overflow-hidden rounded-full"
      >
        <div className="bg-accent h-full rounded-full" style={{ width: `${takenPercent}%` }} />
      </div>
      {isOrganiser && (
        <Text variant="body-s" className="text-muted-foreground mt-4">
          {t('joinOrganising')}
        </Text>
      )}
    </section>
  );
}
