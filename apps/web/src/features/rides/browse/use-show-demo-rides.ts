import { useState, useTransition } from 'react';
import { acceptDefaultSelectedLocation } from '@/features/locations/actions/accept-default-selected-location';

export function useShowDemoRides() {
  const [isPending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  const showDemoRides = () => {
    if (isPending) return;

    setFailed(false);
    startTransition(async () => {
      const result = await acceptDefaultSelectedLocation();

      if (!result.ok) {
        setFailed(true);
      }
    });
  };

  return { showDemoRides, isPending, failed };
}
