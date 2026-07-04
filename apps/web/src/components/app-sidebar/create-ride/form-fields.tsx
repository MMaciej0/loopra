'use client';

import { useFormContext } from 'react-hook-form';
import { Field } from '@/components/ui/field';
import { DividerHeader } from './divider-header';
import { LocationInput } from './location/input';
import { DateTimeInput } from './date-time-input';
import type { CreateRideInput } from './schema';

export function FormFields({ onEditLocation }: { onEditLocation: () => void }) {
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateRideInput>();

  return (
    <div>
      <div className="pb-6">
        <DividerHeader text="THE BASICS" />
      </div>
      <div className="flex flex-col gap-y-4">
        <Field
          id="title"
          label="Ride Title"
          placeholder="e.g. Sunday Coffee Ride to your favorite cafe"
          size="sm"
          {...register('title')}
          error={errors.title?.message}
        />

        <div className="flex flex-col gap-y-1.5">
          <LocationInput onOpen={onEditLocation} />
          {errors.start_location_name && (
            <p role="alert" className="text-destructive text-[11.5px]">
              {errors.start_location_name.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-y-1.5">
          <DateTimeInput />
          {errors.start_time && (
            <p role="alert" className="text-destructive text-[11.5px]">
              {errors.start_time.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
