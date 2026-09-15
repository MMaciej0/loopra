'use client';

import { useEffect, useEffectEvent, useState, type Ref } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { RideCard } from '@/components/ride-card';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import type { StartPointRide } from './start-points';

type Props = Readonly<{
  ref?: Ref<HTMLElement>;
  rides: readonly StartPointRide[];
  onClose: () => void;
}>;

export function RidePanel({ ref, rides, onClose }: Props) {
  const t = useTranslations('RidesPage');
  const [index, setIndex] = useState(0);
  const ride = rides[index];

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
      className="bg-background border-border absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 rounded-t-2xl border-t p-3 shadow-lg sm:inset-x-auto sm:bottom-3 sm:left-3 sm:w-90 sm:rounded-xl sm:border"
    >
      <div className="flex items-center justify-between">
        {rides.length > 1 ? (
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
        ) : (
          <span />
        )}
        <Button variant="ghost" size="icon-sm" aria-label={t('mapPanelClose')} onClick={onClose}>
          <X aria-hidden />
        </Button>
      </div>
      <RideCard data={ride.data} className="shadow-none" />
      <Button asChild>
        <Link href={`/rides/${ride.id}`}>{t('mapViewRide')}</Link>
      </Button>
    </section>
  );
}
