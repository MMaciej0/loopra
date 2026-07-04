'use client';

import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogSubheader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { createRideSchema, type CreateRideInput } from './schema';
import { createRide } from './action';
import { FormFields } from './form-fields';
import { LocationPicker } from './location/picker';

type View = 'form' | 'location';

export function RideForm() {
  const [view, setView] = useState<View>('form');
  const form = useForm<CreateRideInput>({
    resolver: zodResolver(createRideSchema),
    mode: 'onBlur',
    defaultValues: {
      type: 'trip',
      title: '',
      start_location_name: '',
      city: '',
      country: '',
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    const result = await createRide(data);
    if (!result.ok) {
      form.setError('root', { message: result.errorType });
    }
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className="flex min-h-0 flex-col">
        <DialogHeader className="shrink-0 p-4 md:px-7.5 md:pt-5.5">
          <DialogSubheader>NEW RIDE</DialogSubheader>
          <DialogTitle>Post your ride</DialogTitle>
          <DialogDescription className="sr-only">
            Create and share a new ride with the community.
          </DialogDescription>
        </DialogHeader>
        <Separator className="shrink-0" />
        <div className="min-h-0 flex-1 overflow-y-auto p-4 md:px-7.5 md:pt-5.5">
          {view === 'form' ? (
            <FormFields onEditLocation={() => setView('location')} />
          ) : (
            <LocationPicker onDone={() => setView('form')} />
          )}
        </div>
        {form.formState.errors.root && (
          <p role="alert" className="text-destructive px-4 pb-2 text-[11.5px] md:px-7.5">
            {form.formState.errors.root.message}
          </p>
        )}
        <DialogFooter showCancel className="mx-0 mb-0 shrink-0 md:px-7.5">
          <Button
            type="submit"
            disabled={view === 'location'}
            loading={form.formState.isSubmitting}
          >
            Save changes
          </Button>
        </DialogFooter>
      </form>
    </FormProvider>
  );
}
