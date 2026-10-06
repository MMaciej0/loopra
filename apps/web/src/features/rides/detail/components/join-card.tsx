'use client';

import { useState, useTransition } from 'react';
import { ERROR_TYPES, type RideDetail } from '@loopra/domain';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useRouter } from '@/i18n/navigation';
import { joinRide } from '@/features/rides/detail/actions/join-ride';
import { leaveRide } from '@/features/rides/detail/actions/leave-ride';
import { useCurrentUser } from '@/features/shell/components/current-user-provider';

type Props = Readonly<{
  ride: RideDetail;
}>;

export function JoinCard({ ride }: Props) {
  const t = useTranslations('RidePage');
  const user = useCurrentUser();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [hasError, setHasError] = useState(false);

  const capacity = ride.max_participants;
  const count = ride.participants.length;
  const seatsLeft = Math.max(0, capacity - count);
  const takenPercent = capacity > 0 ? Math.min(100, (count / capacity) * 100) : 100;
  const isOrganiser = user?.id === ride.creator.id;
  const isParticipant = ride.participants.some((participant) => participant.user.id === user?.id);
  const isFull = seatsLeft === 0;
  const isVerified = user?.email_verified === true;

  function run(action: typeof joinRide) {
    setHasError(false);
    startTransition(async () => {
      const result = await action(ride.id);

      if (result.ok) return;

      switch (result.errorType) {
        case ERROR_TYPES.MAX_PARTICIPANTS:
        case ERROR_TYPES.PARTICIPANT_EXISTS:
        case ERROR_TYPES.PARTICIPANT_NOT_FOUND:
          router.refresh();
          return;
        case ERROR_TYPES.RIDE_NOT_FOUND:
        case ERROR_TYPES.RIDE_ALREADY_STARTED:
          router.replace('/rides');
          return;
        default:
          setHasError(true);
      }
    });
  }

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
      {isOrganiser ? (
        <Text variant="body-s" className="text-muted-foreground mt-4">
          {t('joinOrganising')}
        </Text>
      ) : isParticipant ? (
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="font-ui text-foreground inline-flex items-center gap-1.5 text-[13.5px] font-medium">
            <Check aria-hidden className="text-accent size-4" strokeWidth={3} />
            {t('joinJoined')}
          </span>
          <Button variant="ghost" size="xs" loading={isPending} onClick={() => run(leaveRide)}>
            {t('joinLeave')}
          </Button>
        </div>
      ) : isFull ? (
        <Button variant="accent" disabled className="mt-4 w-full">
          {t('joinRideFull')}
        </Button>
      ) : !isVerified ? (
        <>
          <Button variant="accent" disabled className="mt-4 w-full">
            {t('joinAction')}
          </Button>
          <Text variant="body-xs" className="text-muted-foreground mt-2 text-center">
            {t('joinVerifyEmail')}
          </Text>
        </>
      ) : (
        <>
          <Button
            variant="accent"
            loading={isPending}
            onClick={() => run(joinRide)}
            className="mt-4 w-full"
          >
            {t('joinAction')}
          </Button>
          <Text variant="body-xs" className="text-muted-foreground mt-2 text-center">
            {t('joinHint')}
          </Text>
        </>
      )}
      {hasError && (
        <p role="alert" className="text-destructive mt-1.5 text-[11.5px]">
          {t('joinError')}
        </p>
      )}
    </section>
  );
}
