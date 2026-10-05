'use client';

import { useEffect, useEffectEvent, useState, type Ref } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { RideCard } from '@/features/rides/ride-card/ride-card';
import type { RideCardData } from '@/features/rides/ride-card/types';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Link } from '@/i18n/navigation';
import { loadRideCards } from '@/features/rides/list/actions/load-ride-cards';
import { RideCardSkeleton } from '@/features/rides/list/components/rides-list/ride-card-skeleton';

type PanelRide = Readonly<{ id: string; data: RideCardData }>;

type Props = Readonly<{
  ref?: Ref<HTMLElement>;
  rideIds: readonly string[];
  onClose: () => void;
}>;

export function RidePanel({ ref, rideIds, onClose }: Props) {
  const t = useTranslations('RidesPage');
  const [index, setIndex] = useState(0);
  const [rides, setRides] = useState<readonly PanelRide[] | null>(null);
  const [hasError, setHasError] = useState(false);
  const ride = rides?.[index];

  const load = () => {
    loadRideCards(rideIds)
      .catch(() => null)
      .then((result) => {
        if (!result?.ok) {
          setHasError(true);
          return;
        }
        setRides(result.cards);
      });
  };

  const loadInitial = useEffectEvent(load);

  const retry = () => {
    setHasError(false);
    load();
  };

  useEffect(() => {
    loadInitial();
  }, []);

  const closeOnEscape = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  });

  useEffect(() => {
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  return (
    <section
      ref={ref}
      aria-label={t('mapPanelLabel')}
      className="bg-background border-border absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 rounded-t-2xl border-t p-3 shadow-lg md:inset-x-auto md:right-3 md:bottom-3 md:w-90 md:rounded-xl md:border"
    >
      <Button
        variant="outline"
        size="icon-sm"
        aria-label={t('mapPanelClose')}
        onClick={onClose}
        className="absolute top-5 right-5 z-10 shadow-sm"
      >
        <X aria-hidden />
      </Button>
      {rides && rides.length > 1 && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t('mapStepperPrevious')}
            disabled={index === 0}
            onClick={() => setIndex(index - 1)}
          >
            <ChevronLeft aria-hidden />
          </Button>
          <span aria-live="polite" className="text-muted-foreground text-[13px] tabular-nums">
            {t('mapStepperPosition', { position: index + 1, total: rides.length })}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t('mapStepperNext')}
            disabled={index === rides.length - 1}
            onClick={() => setIndex(index + 1)}
          >
            <ChevronRight aria-hidden />
          </Button>
        </div>
      )}
      {hasError ? (
        <div role="alert" className="flex flex-col items-center gap-3 py-6 text-center">
          <Text variant="body-s" className="text-muted-foreground">
            {t('listLoadError')}
          </Text>
          <Button variant="secondary" size="sm" onClick={retry}>
            {t('listRetry')}
          </Button>
        </div>
      ) : ride ? (
        <>
          <RideCard data={ride.data} className="shadow-none" />
          <Button asChild>
            <Link href={`/rides/${ride.id}`}>{t('mapViewRide')}</Link>
          </Button>
        </>
      ) : rides ? (
        <Text variant="body-s" className="text-muted-foreground py-6 text-center">
          {t('mapEmpty')}
        </Text>
      ) : (
        <RideCardSkeleton />
      )}
    </section>
  );
}
