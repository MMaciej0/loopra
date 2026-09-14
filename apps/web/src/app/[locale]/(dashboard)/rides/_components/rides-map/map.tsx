'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRidesMap } from './use-rides-map';

type Props = Readonly<{ lng: number; lat: number; locationLabel: string }>;

export function RidesMap({ lng, lat, locationLabel }: Props) {
  const locale = useLocale();
  const t = useTranslations('RidesPage');
  const mapContainerRef = useRidesMap({ lng, lat, language: locale });

  return (
    <div
      ref={mapContainerRef}
      role="region"
      aria-label={t('mapLabel', { location: locationLabel })}
      className="border-border min-h-0 flex-1 overflow-hidden rounded-xl border"
    />
  );
}
