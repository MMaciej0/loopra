'use client';

import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RidesListQuery } from '../../list-query';
import { MapChip } from './map-chip';
import { mapNotice } from './map-notice';
import { RidePanel } from './ride-panel';
import { useRidesMap } from './use-rides-map';
import { useStartPoints } from './use-start-points';

type Props = Readonly<{ query: RidesListQuery; locationLabel: string }>;

export function RidesMap({ query, locationLabel }: Props) {
  const t = useTranslations('RidesPage');
  const { status, startPoints, retry } = useStartPoints(query);
  const { containerRef, panelRef, selected, clearSelection, hasStartPointInView, showAll } =
    useRidesMap({ area: query, startPoints });

  const notice = mapNotice({
    status,
    startPointCount: startPoints.length,
    hasStartPointInView,
  });
  const rideCount = startPoints.reduce((total, group) => total + group.rides.length, 0);

  return (
    <div className="border-border relative min-h-0 flex-1 overflow-hidden rounded-xl border">
      <div
        ref={containerRef}
        role="region"
        aria-label={t('mapLabel', { location: locationLabel })}
        className="absolute inset-0"
      />
      <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center px-3">
        {notice === 'loading' && (
          <MapChip role="status" className="pr-3.5">
            <Loader2 aria-hidden className="text-muted-foreground size-3.5 animate-spin" />
            {t('mapLoading')}
          </MapChip>
        )}
        {notice === 'empty' && (
          <MapChip role="status" className="pr-3.5">
            {t('mapEmpty', { radius: query.radius_km })}
          </MapChip>
        )}
        {notice === 'out-of-view' && (
          <MapChip role="status">
            {t('mapNearbyCount', { count: rideCount })}
            <span aria-hidden className="text-muted-foreground">
              ·
            </span>
            <Button variant="secondary" size="xs" className="rounded-full" onClick={showAll}>
              {t('mapShowAll')}
            </Button>
          </MapChip>
        )}
        {notice === 'error' && (
          <MapChip role="alert">
            {t('listLoadError')}
            <Button variant="secondary" size="xs" className="rounded-full" onClick={retry}>
              {t('listRetry')}
            </Button>
          </MapChip>
        )}
      </div>
      {selected && (
        <RidePanel
          key={selected.id}
          ref={panelRef}
          rides={selected.rides}
          onClose={clearSelection}
        />
      )}
    </div>
  );
}
