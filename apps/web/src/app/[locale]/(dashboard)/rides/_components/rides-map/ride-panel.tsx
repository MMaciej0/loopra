'use client';

import { useEffect, useEffectEvent } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { RideCard } from '@/components/ride-card';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import type { StartPointRide } from './start-points';

type Props = Readonly<{ ride: StartPointRide; onClose: () => void }>;

export function RidePanel({ ride, onClose }: Props) {
  const t = useTranslations('RidesPage');

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
      aria-label={t('mapPanelLabel')}
      className="bg-background border-border absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 rounded-t-2xl border-t p-3 shadow-lg sm:inset-x-auto sm:bottom-3 sm:left-3 sm:w-90 sm:rounded-xl sm:border"
    >
      <div className="flex items-center justify-end">
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
