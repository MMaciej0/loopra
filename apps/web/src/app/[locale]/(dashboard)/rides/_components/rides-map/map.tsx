'use client';

import { useEffect, useEffectEvent, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { loadMapStartPoints } from '../../_actions/list-rides';
import type { RidesListQuery } from '../../list-query';
import type { StartPointGroup } from './start-points';
import { useRidesMap } from './use-rides-map';

type Props = Readonly<{ query: RidesListQuery; locationLabel: string }>;

export function RidesMap({ query, locationLabel }: Props) {
  const locale = useLocale();
  const t = useTranslations('RidesPage');
  const [initialQuery] = useState(query);
  const [startPoints, setStartPoints] = useState<StartPointGroup[]>([]);

  const loadStartPoints = useEffectEvent(() => {
    loadMapStartPoints(initialQuery)
      .catch(() => null)
      .then((result) => {
        if (result?.ok) {
          setStartPoints(result.startPoints);
        }
      });
  });

  useEffect(() => {
    loadStartPoints();
  }, []);

  const markers = useMemo(
    () =>
      startPoints.map((group) => ({
        ...group,
        label: group.name
          ? t('mapMarkerLabel', { count: group.rideCount, name: group.name })
          : t('mapMarkerLabelUnnamed', { count: group.rideCount }),
      })),
    [startPoints, t],
  );

  const mapContainerRef = useRidesMap({
    lng: initialQuery.lng,
    lat: initialQuery.lat,
    radiusKm: initialQuery.radius_km,
    language: locale,
    markers,
  });

  return (
    <div
      ref={mapContainerRef}
      role="region"
      aria-label={t('mapLabel', { location: locationLabel })}
      className="border-border min-h-0 flex-1 overflow-hidden rounded-xl border"
    />
  );
}
