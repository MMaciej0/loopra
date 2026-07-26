'use client';

import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogSubheader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { createRideSchema, type CreateRideInput } from './schema';
import { createRide } from './_actions/action';
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
      start_location: undefined,
      start_location_name: '',
      city: '',
      country: '',
      region: '',
      municipality: '',
      postal_code: '',
      full_address: '',
    },
  });

  const onUseStartPoint = async () => {
    const valid = await form.trigger('start_location_name');
    if (valid) setView('form');
  };

  const onSubmit = form.handleSubmit(async (data) => {
    console.log(data);
    const result = await createRide(data);
    if (!result.ok) {
      form.setError('root', { message: result.errorType });
    }
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className="flex min-h-0 flex-col">
        <DialogHeader className="shrink-0 p-4 md:px-7.5 md:pt-5.5">
          <DialogSubheader>
            {view === 'form' ? (
              'NEW RIDE'
            ) : (
              <button
                type="button"
                onClick={() => setView('form')}
                className="inline-flex cursor-pointer items-center gap-x-2"
              >
                <ArrowLeft aria-hidden size={12} /> BACK TO DETAILS
              </button>
            )}
          </DialogSubheader>
          <DialogTitle>{view === 'form' ? 'Post your ride' : 'Pick a location'}</DialogTitle>
          <DialogDescription className="sr-only">
            Create and share a new ride with the community.
          </DialogDescription>
        </DialogHeader>
        <Separator className="shrink-0" />
        <div className="min-h-0 flex-1 overflow-y-auto p-4 md:px-7.5 md:pt-5.5">
          {view === 'form' ? (
            <FormFields onEditLocation={() => setView('location')} />
          ) : (
            <LocationPicker />
          )}
        </div>
        {form.formState.errors.root && (
          <p role="alert" className="text-destructive px-4 pb-2 text-[11.5px] md:px-7.5">
            {form.formState.errors.root.message}
          </p>
        )}
        <DialogFooter className="mx-0 mb-0 shrink-0 md:px-7.5">
          {view === 'location' ? (
            <Button variant="ghost" onClick={() => setView('form')}>
              Back
            </Button>
          ) : (
            <DialogClose asChild>
              <Button variant="ghost" type="button">
                Cancel
              </Button>
            </DialogClose>
          )}
          {view === 'location' ? (
            <Button type="button" variant="accent" onClick={onUseStartPoint}>
              Use this start point
              <ArrowRight />
            </Button>
          ) : (
            <Button type="submit" loading={form.formState.isSubmitting}>
              Save changes
            </Button>
          )}
        </DialogFooter>
      </form>
    </FormProvider>
  );
}
