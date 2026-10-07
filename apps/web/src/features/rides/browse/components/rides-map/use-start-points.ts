import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { formatBBox, type BBox } from '@loopra/domain';
import { loadMapStartPoints } from '@/features/rides/browse/actions/load-map-start-points';
import { ridesFiltersKey } from '@/features/rides/browse/filters';
import type { RidesListQuery } from '@/features/rides/browse/list-query';
import { buildRidesTimeWindow } from '@/features/rides/browse/time-window';
import type { StartPointGroup } from './start-points';

export type StartPointsStatus = 'loading' | 'error' | 'done';

const NO_START_POINTS: readonly StartPointGroup[] = [];

export function useStartPoints(query: RidesListQuery) {
  const bboxRef = useRef(query.bbox);
  const latestRequestRef = useRef(0);
  const [startPoints, setStartPoints] = useState(NO_START_POINTS);
  const [truncated, setTruncated] = useState(false);
  const [status, setStatus] = useState<StartPointsStatus>('loading');
  const filtersKey = ridesFiltersKey(query.filters);
  const [loadedFiltersKey, setLoadedFiltersKey] = useState(filtersKey);

  const load = () => {
    const request = ++latestRequestRef.current;
    const requestedFiltersKey = filtersKey;

    loadMapStartPoints(
      { ...query, bbox: bboxRef.current },
      buildRidesTimeWindow(query.filters.when),
    )
      .catch(() => null)
      .then((result) => {
        if (request !== latestRequestRef.current) return;

        setLoadedFiltersKey(requestedFiltersKey);

        if (!result?.ok) {
          setStatus('error');
          return;
        }

        setStartPoints(result.startPoints);
        setTruncated(result.truncated);
        setStatus('done');
      });
  };

  const loadForFilters = useEffectEvent(load);

  useEffect(() => {
    loadForFilters();
  }, [filtersKey]);

  const reload = () => {
    setStatus('loading');
    load();
  };

  const loadArea = (searchArea: BBox) => {
    bboxRef.current = formatBBox(searchArea);
    reload();
  };

  return {
    status: loadedFiltersKey === filtersKey ? status : 'loading',
    startPoints,
    truncated,
    retry: reload,
    loadArea,
  };
}
