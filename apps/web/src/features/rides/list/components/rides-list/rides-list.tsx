'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { RideCard } from '@/features/rides/ride-card/ride-card';
import type { RideCardData } from '@/features/rides/ride-card/types';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { loadRidesPage } from '@/features/rides/list/actions/load-rides-page';
import type { RidesListQuery } from '@/features/rides/list/list-query';
import { RideCardSkeleton } from './ride-card-skeleton';

const SKELETON_COUNT = 3;

type ListedRide = Readonly<{ id: string; data: RideCardData }>;

type Status = 'loading' | 'idle' | 'error' | 'done';

export function RidesList({ query }: { query: RidesListQuery }) {
  const t = useTranslations('RidesPage');
  const [initialQuery] = useState(query);
  const [rides, setRides] = useState<ListedRide[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const inFlight = useRef(false);

  const applyPage = (result: Awaited<ReturnType<typeof loadRidesPage>> | null) => {
    inFlight.current = false;

    if (!result?.ok) {
      setStatus('error');
      return;
    }

    setRides((loaded) => [...loaded, ...result.cards]);
    setNextCursor(result.nextCursor);
    setStatus(result.nextCursor ? 'idle' : 'done');
  };

  const requestPage = (cursor: string | null) => {
    if (inFlight.current) return;
    inFlight.current = true;

    loadRidesPage(initialQuery, cursor)
      .catch(() => null)
      .then(applyPage);
  };

  const requestFirstPage = useEffectEvent(() => requestPage(null));

  useEffect(() => {
    requestFirstPage();
  }, []);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const requestNextPage = useEffectEvent(() => {
    setStatus('loading');
    requestPage(nextCursor);
  });

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (status !== 'idle' || !sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        requestNextPage();
      }
    });
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [status]);

  const retry = () => {
    setStatus('loading');
    requestPage(nextCursor);
  };

  if (status === 'done' && rides.length === 0) {
    return (
      <div className="border-border flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed p-10 text-center">
        <Text variant="body-l" as="h2" className="text-foreground font-semibold">
          {t('listEmptyTitle')}
        </Text>
        <Text variant="body-s" className="text-muted-foreground max-w-sm">
          {t('listEmptyHint')}
        </Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rides.map((ride) => (
          <Link
            key={ride.id}
            href={`/rides/${ride.id}`}
            className="focus-visible:ring-ring/50 rounded-xl outline-none focus-visible:ring-3"
          >
            <RideCard data={ride.data} className="h-full transition-shadow hover:shadow-md" />
          </Link>
        ))}
        {status === 'loading' &&
          Array.from({ length: SKELETON_COUNT }, (_, index) => <RideCardSkeleton key={index} />)}
      </div>
      {status === 'idle' && <div ref={sentinelRef} aria-hidden className="h-px" />}
      {status === 'error' && (
        <div role="alert" className="flex flex-col items-center gap-3 py-4 text-center">
          <Text variant="body-s" className="text-muted-foreground">
            {t('listLoadError')}
          </Text>
          <Button variant="secondary" size="sm" onClick={retry}>
            {t('listRetry')}
          </Button>
        </div>
      )}
    </div>
  );
}
