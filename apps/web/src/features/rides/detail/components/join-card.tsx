'use client';

import { useState, useTransition } from 'react';
import { ERROR_TYPES, type RideDetail } from '@loopra/domain';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Text } from '@/components/ui/text';
import { Link, useRouter } from '@/i18n/navigation';
import { cancelRide } from '@/features/rides/detail/actions/cancel-ride';
import { joinRide } from '@/features/rides/detail/actions/join-ride';
import { leaveRide } from '@/features/rides/detail/actions/leave-ride';
import { useCurrentUser } from '@/features/shell/components/current-user-provider';

type Props = Readonly<{
  ride: RideDetail;
}>;

type RideAction = typeof joinRide | typeof leaveRide | typeof cancelRide;

export function JoinCard({ ride }: Props) {
  const t = useTranslations('RidePage');
  const user = useCurrentUser();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [hasError, setHasError] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  const capacity = ride.max_participants;
  const participantCount = ride.participants.length;
  const seatsLeft = Math.max(0, capacity - participantCount);
  const takenPercent = capacity > 0 ? Math.min(100, (participantCount / capacity) * 100) : 100;
  const isOrganiser = user?.id === ride.creator.id;
  const isParticipant = ride.participants.some((participant) => participant.user.id === user?.id);
  const isFull = seatsLeft === 0;
  const isVerified = user?.email_verified === true;
  const isCancelled = ride.status === 'cancelled';
  const otherRidersCount = ride.participants.filter(
    (participant) => participant.user.id !== ride.creator.id,
  ).length;

  function runAction(action: RideAction) {
    setHasError(false);
    startTransition(async () => {
      const result = await action(ride.id);

      if (result.ok) {
        setIsCancelOpen(false);
        return;
      }

      switch (result.errorType) {
        case ERROR_TYPES.MAX_PARTICIPANTS:
        case ERROR_TYPES.PARTICIPANT_EXISTS:
        case ERROR_TYPES.PARTICIPANT_NOT_FOUND:
        case ERROR_TYPES.RIDE_CANCELLED:
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

  function handleCancelOpenChange(open: boolean) {
    setIsCancelOpen(open);
    setHasError(false);
  }

  return (
    <Card className="-order-1 mb-[26px] lg:order-none lg:mb-0">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-ui text-foreground text-[13.5px] font-medium">
          {t('joinRiders', { count: participantCount, capacity })}
        </span>
        {!isCancelled && (
          <Text variant="caption" className="text-muted-foreground shrink-0">
            {isFull ? t('joinFull') : t('joinSeatsLeft', { count: seatsLeft })}
          </Text>
        )}
      </div>
      <div
        role="progressbar"
        aria-label={t('joinRiders', { count: participantCount, capacity })}
        aria-valuemin={0}
        aria-valuemax={capacity}
        aria-valuenow={Math.min(participantCount, capacity)}
        className="bg-muted mt-3 h-1.5 overflow-hidden rounded-full"
      >
        <div className="bg-accent h-full rounded-full" style={{ width: `${takenPercent}%` }} />
      </div>
      {isCancelled ? (
        <Text variant="body-s" className="text-muted-foreground mt-4">
          {t('joinCancelled')}
        </Text>
      ) : isOrganiser ? (
        <div className="mt-4 flex items-center justify-between gap-3">
          <Text variant="body-s" className="text-muted-foreground">
            {t('joinOrganising')}
          </Text>
          <Dialog open={isCancelOpen} onOpenChange={handleCancelOpenChange}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="xs">
                {t('cancelAction')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('cancelDialogTitle')}</DialogTitle>
                <DialogDescription>
                  {t('cancelDialogRiders', { count: otherRidersCount })} {t('cancelDialogFinal')}
                </DialogDescription>
              </DialogHeader>
              {hasError && (
                <p role="alert" className="text-destructive text-[11.5px]">
                  {t('cancelError')}
                </p>
              )}
              <DialogFooter showCancel cancelLabel={t('cancelDialogKeep')}>
                <Button
                  variant="destructive"
                  loading={isPending}
                  onClick={() => runAction(cancelRide)}
                >
                  {t('cancelDialogConfirm')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : isParticipant ? (
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="font-ui text-foreground inline-flex items-center gap-1.5 text-[13.5px] font-medium">
            <Check aria-hidden className="text-accent size-4" strokeWidth={3} />
            {t('joinJoined')}
          </span>
          <Button
            variant="ghost"
            size="xs"
            loading={isPending}
            onClick={() => runAction(leaveRide)}
          >
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
            <Link href="/settings" className="underline underline-offset-2">
              {t('joinVerifyEmail')}
            </Link>
          </Text>
        </>
      ) : (
        <>
          <Button
            variant="accent"
            loading={isPending}
            onClick={() => runAction(joinRide)}
            className="mt-4 w-full"
          >
            {t('joinAction')}
          </Button>
          {!hasError && (
            <Text variant="body-xs" className="text-muted-foreground mt-2 text-center">
              {t('joinHint')}
            </Text>
          )}
        </>
      )}
      {hasError && !isCancelOpen && (
        <p role="alert" className="text-destructive mt-1.5 text-[11.5px]">
          {t('joinError')}
        </p>
      )}
    </Card>
  );
}
