'use client';

import { useFormContext } from 'react-hook-form';
import { Field } from '@/components/ui/field';
import type { CreateRideInput } from '../schema';

export function StartingPointInputBanner() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateRideInput>();

  return (
    <div className="bg-popover border-border absolute bottom-9 left-1/2 z-10 flex w-[calc(100%-1rem)] -translate-x-1/2 flex-col gap-2 rounded-md border p-3">
      <div className="min-w-0">
        <Field
          id="start_location_name"
          label="Name this start point"
          placeholder="e.g. Main square fountain"
          size="sm"
          {...register('start_location_name')}
        />
      </div>
      {errors.start_location_name ? (
        <p role="alert" className="text-destructive text-[11.5px]">
          {errors.start_location_name.message}
        </p>
      ) : (
        <p className="text-muted-foreground text-[11.5px]">
          Riders see this name — add a landmark or exact spot (e.g. “by the fountain”).
        </p>
      )}
    </div>
  );
}
