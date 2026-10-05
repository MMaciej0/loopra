import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { formatBBox, type BBox } from '@loopra/domain';
import { loadMapStartPoints } from '@/features/rides/browse/actions/load-map-start-points';
import type { RidesListQuery } from '@/features/rides/browse/list-query';
import type { StartPointGroup } from './start-points';

export type StartPointsStatus = 'loading' | 'error' | 'done';

const NO_START_POINTS: readonly StartPointGroup[] = [];

export function useStartPoints(initialQuery: RidesListQuery) {
  const queryRef = useRef(initialQuery);
  const latestRequestRef = useRef(0);
  const [startPoints, setStartPoints] = useState(NO_START_POINTS);
  const [truncated, setTruncated] = useState(false);
  const [status, setStatus] = useState<StartPointsStatus>('loading');

  const load = () => {
    const request = ++latestRequestRef.current;

    loadMapStartPoints(queryRef.current)
      .catch(() => null)
      .then((result) => {
        if (request !== latestRequestRef.current) return;

        if (!result?.ok) {
          setStatus('error');
          return;
        }

        setStartPoints(result.startPoints);
        setTruncated(result.truncated);
        setStatus('done');
      });
  };

  const loadInitial = useEffectEvent(load);

  useEffect(() => {
    loadInitial();
  }, []);

  const reload = () => {
    setStatus('loading');
    load();
  };

  const loadArea = (searchArea: BBox) => {
    queryRef.current = { ...queryRef.current, bbox: formatBBox(searchArea) };
    reload();
  };

  return { status, startPoints, truncated, retry: reload, loadArea };
}
