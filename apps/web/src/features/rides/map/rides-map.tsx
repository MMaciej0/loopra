'use client';

import type { Point } from '@loopra/domain';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RidesListQuery } from '@/features/rides/list/list-query';
import { MapChip } from './map-chip';
import { mapNotice } from './map-notice';
import { RidePanel } from './ride-panel';
import { useRidesMap } from './use-rides-map';
import { useStartPoints } from './use-start-points';

type Props = Readonly<{
  query: RidesListQuery;
  center: Point;
  screenReaderLocationLabel: string;
}>;

export function RidesMap({ query, center, screenReaderLocationLabel }: Props) {
  const t = useTranslations('RidesPage');
  const { status, startPoints, truncated, retry, loadArea } = useStartPoints(query);
  const { containerRef, panelRef, selected, clearSelection, hasStartPointInView, showAll } =
    useRidesMap({ center, startPoints, onSearchAreaChange: loadArea });

  const notice = mapNotice({
    status,
    startPointCount: startPoints.length,
    hasStartPointInView,
    truncated,
  });
  const rideCount = startPoints.reduce((total, group) => total + group.rideIds.length, 0);

  return (
    <div className="border-border relative min-h-0 flex-1 overflow-hidden rounded-xl border">
      <div
        ref={containerRef}
        role="region"
        aria-label={t('mapLabel', { location: screenReaderLocationLabel })}
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
            {t('mapEmpty')}
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
        {notice === 'truncated' && (
          <MapChip role="status" className="pr-3.5">
            {t('mapTruncated')}
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
          key={selected.rideIds.join()}
          ref={panelRef}
          rideIds={selected.rideIds}
          onClose={clearSelection}
        />
      )}
    </div>
  );
}
