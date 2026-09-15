'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { RideCard } from '@/components/ride-card';
import type { RideCardData } from '@/components/ride-card/types';
import { loadRidesPage } from '../../_actions/list-rides';
import type { RidesListQuery } from '../../list-query';
import { RideCardSkeleton } from './ride-card-skeleton';

const SKELETON_COUNT = 3;

type ListedRide = Readonly<{ id: string; data: RideCardData }>;

type Status = 'loading' | 'idle' | 'error' | 'done';

export function RidesList({ query }: { query: RidesListQuery }) {
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

  return (
    <div className="grid grid-cols-1 gap-4 pb-6 md:grid-cols-2 lg:grid-cols-3">
      {rides.map((ride) => (
        <RideCard key={ride.id} data={ride.data} />
      ))}
      {status === 'loading' &&
        Array.from({ length: SKELETON_COUNT }, (_, index) => <RideCardSkeleton key={index} />)}
    </div>
  );
}
