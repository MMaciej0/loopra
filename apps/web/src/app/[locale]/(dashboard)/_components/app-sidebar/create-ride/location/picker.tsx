'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import type { Coords, CreateRideInput } from '../schema';
import { useMap } from '@/hooks/use-map';
import { useCallback } from 'react';
import { SubmitBanner } from './submit-banner';

export function LocationPicker({ onDone }: { onDone: () => void }) {
  const { setValue } = useFormContext<CreateRideInput>();

  const onPick = useCallback(
    (coords: Coords) => {
      setValue('start_location', coords, { shouldValidate: true });
    },
    [setValue],
  );
  const startLocation = useWatch<CreateRideInput, 'start_location'>({ name: 'start_location' });

  const { mapContainerRef } = useMap({ onPick, initialCoords: startLocation });

  const hint = startLocation
    ? 'Click again to move the start point'
    : 'Click to set the start point';

  return (
    // min-h-full fills the scroll body; map region flex-1 takes the leftover space
    <div className="flex min-h-full flex-col gap-3">
      <div
        ref={mapContainerRef}
        className="relative min-h-0 w-full flex-1 overflow-hidden rounded-sm"
      >
        <div className="pointer-events-none absolute top-3 left-1/2 z-10 -translate-x-1/2">
          <Badge variant="default" size="sm" className="shadow-sm backdrop-blur">
            {hint}
          </Badge>
        </div>
        {startLocation && <SubmitBanner onDone={onDone} />}
      </div>
    </div>
  );
}
