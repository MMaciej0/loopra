'use client';

import { useFormContext } from 'react-hook-form';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import type { CreateRideInput } from '../schema';

export function SubmitBanner({ onDone }: { onDone: () => void }) {
  const {
    register,
    trigger,
    formState: { errors },
  } = useFormContext<CreateRideInput>();

  const onConfirm = async () => {
    const valid = await trigger('start_location_name');
    if (valid) onDone();
  };

  return (
    <div className="bg-popover border-border absolute bottom-1 left-1/2 z-10 flex w-[calc(100%-1rem)] -translate-x-1/2 flex-col gap-2 rounded-md border p-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-end">
        <div className="min-w-0 md:flex-1">
          <Field
            id="start_location_name"
            label="Location name"
            placeholder="e.g. Main square fountain"
            size="sm"
            {...register('start_location_name')}
          />
        </div>
        <Button
          type="button"
          variant="accent"
          onClick={onConfirm}
          className="w-full md:h-[38px] md:w-auto"
        >
          Confirm
        </Button>
      </div>
      {errors.start_location_name && (
        <p role="alert" className="text-destructive text-[11.5px]">
          {errors.start_location_name.message}
        </p>
      )}
    </div>
  );
}
