import { useEffect, useEffectEvent, useState } from 'react';
import { loadMapStartPoints } from '../../_actions/list-rides';
import type { RidesListQuery } from '../../list-query';
import type { StartPointGroup } from './start-points';

export type StartPointsStatus = 'loading' | 'error' | 'done';

const NO_START_POINTS: readonly StartPointGroup[] = [];

export function useStartPoints(query: RidesListQuery) {
  const [initialQuery] = useState(query);
  const [startPoints, setStartPoints] = useState(NO_START_POINTS);
  const [status, setStatus] = useState<StartPointsStatus>('loading');

  const load = () => {
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

  const loadInitial = useEffectEvent(load);

  useEffect(() => {
    loadInitial();
  }, []);

  const retry = () => {
    setStatus('loading');
    load();
  };

  return { status, startPoints, retry };
}
