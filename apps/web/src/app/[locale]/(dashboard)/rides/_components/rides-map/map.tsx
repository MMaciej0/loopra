'use client';

import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loadMapStartPoints } from '../../_actions/list-rides';
import type { RidesListQuery } from '../../list-query';
import { MapChip } from './map-chip';
import { RidePanel } from './ride-panel';
import type { StartPointGroup } from './start-points';
import { useRidesMap } from './use-rides-map';

type Props = Readonly<{ query: RidesListQuery; locationLabel: string }>;

type Status = 'loading' | 'error' | 'done';

export function RidesMap({ query, locationLabel }: Props) {
  const locale = useLocale();
  const t = useTranslations('RidesPage');
  const [initialQuery] = useState(query);
  const [startPoints, setStartPoints] = useState<StartPointGroup[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasMarkerInView, setHasMarkerInView] = useState<boolean | null>(null);
  const panelRef = useRef<HTMLElement>(null);

  const loadStartPoints = () => {
    loadMapStartPoints(initialQuery)
      .catch(() => null)
      .then((result) => {
        if (!result?.ok) {
          setStatus('error');
          return;
        }

        setStartPoints(result.startPoints);
        setStatus('done');
      });
  };

  const loadInitialStartPoints = useEffectEvent(loadStartPoints);

  useEffect(() => {
    loadInitialStartPoints();
  }, []);

  const retry = () => {
    setStatus('loading');
    loadStartPoints();
  };

  const markers = useMemo(
    () =>
      startPoints.map((group) => ({
        ...group,
        label: group.name
          ? t('mapMarkerLabel', { count: group.rides.length, name: group.name })
          : t('mapMarkerLabelUnnamed', { count: group.rides.length }),
      })),
    [startPoints, t],
  );

  const { mapContainerRef, showAllMarkers } = useRidesMap({
    lng: initialQuery.lng,
    lat: initialQuery.lat,
    radiusKm: initialQuery.radius_km,
    language: locale,
    markers,
    selectedId,
    panelRef,
    onSelect: setSelectedId,
    onDeselect: () => setSelectedId(null),
    onMarkersInViewChange: setHasMarkerInView,
  });

  const rideCount = startPoints.reduce((total, group) => total + group.rides.length, 0);
  const selectedGroup = startPoints.find((group) => group.id === selectedId);

  return (
    <div className="border-border relative min-h-0 flex-1 overflow-hidden rounded-xl border">
      <div
        ref={mapContainerRef}
        role="region"
        aria-label={t('mapLabel', { location: locationLabel })}
        className="absolute inset-0"
      />
      <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center px-3">
        {status === 'loading' && (
          <MapChip role="status" className="pr-3.5">
            <Loader2 aria-hidden className="text-muted-foreground size-3.5 animate-spin" />
            {t('mapLoading')}
          </MapChip>
        )}
        {status === 'done' && startPoints.length === 0 && (
          <MapChip role="status" className="pr-3.5">
            {t('mapEmpty', { radius: initialQuery.radius_km })}
          </MapChip>
        )}
        {status === 'done' && startPoints.length > 0 && hasMarkerInView === false && (
          <MapChip role="status">
            {t('mapNearbyCount', { count: rideCount })}
            <span aria-hidden className="text-muted-foreground">
              ·
            </span>
            <Button variant="secondary" size="xs" className="rounded-full" onClick={showAllMarkers}>
              {t('mapShowAll')}
            </Button>
          </MapChip>
        )}
        {status === 'error' && (
          <MapChip role="alert">
            {t('listLoadError')}
            <Button variant="secondary" size="xs" className="rounded-full" onClick={retry}>
              {t('listRetry')}
            </Button>
          </MapChip>
        )}
      </div>
      {selectedGroup && (
        <RidePanel
          key={selectedGroup.id}
          ref={panelRef}
          rides={selectedGroup.rides}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
